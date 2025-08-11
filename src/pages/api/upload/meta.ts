import { NextApiRequest, NextApiResponse } from 'next';
import cuid from 'cuid';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Keypair } from '@solana/web3.js';
import { BN } from "bn.js";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { DynamicBondingCurveClient } from '@meteora-ag/dynamic-bonding-curve-sdk';
import { uploadToR2, PUBLIC_R2_URL } from "@/lib/r2Util";
import { selectOneMint, markMintUsed, insertRow } from "@/lib/dbUtils";
import { HELIUS_RPC_URL, MEME_CONFIG_KEY, TECH_CONFIG_KEY, IS_OPEN_VANITY_MINT_ADDR } from "@/lib/constant";

// Types
type UploadRequest = {
  tokenName: string;
  tokenSymbol: string;
  tokenDescription?: string;
  tokenImgUrl: string;
  twitter?: string;
  telegram?: string;
  website?: string;
  configType: string;
  userWallet: string;
  buyAmount?: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log("req body: ", req.body);
    const ur = req.body as UploadRequest;

    const { tokenName, tokenSymbol, tokenImgUrl, configType, userWallet } = ur;
    // Validate required fields
    if (!tokenName || !tokenSymbol || !tokenImgUrl || !userWallet) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!configType) {
      return res.status(400).json({ error: 'unknown config type' });
    }
    let configKey = MEME_CONFIG_KEY;
    if (configType == "2") {
      configKey = TECH_CONFIG_KEY;
    }
    console.log("using configKey: ", configKey);
    console.log("ur.buyAmount: ", ur.buyAmount, typeof ur.buyAmount);

    const metadataUrl = await uploadMetadata(ur);
    if (!metadataUrl) {
      return res.status(400).json({ error: 'Failed to upload metadata' });
    }

    let keyPair = Keypair.generate();
    let isMintFromDb = false;
    if (IS_OPEN_VANITY_MINT_ADDR) {
      try {
        const mintAccount = await selectOneMint();
        if (mintAccount) {
          keyPair = Keypair.fromSecretKey(bs58.decode(mintAccount.pkey));
          isMintFromDb = true;
          await markMintUsed(mintAccount.account_address);
        }
      } catch (error) {
        console.error('Error finding unused mint account:', error)
      }
    }
    if (!keyPair) {
      keyPair = Keypair.generate();
      //write this keypair to db, so that send-transaction can fetch it
      await insertRow(keyPair.publicKey.toBase58(), bs58.encode(keyPair.secretKey));
      isMintFromDb = false;
    }
    const mint = keyPair.publicKey.toBase58();
    console.log("mint: ", mint, "isMintFromDb: ", isMintFromDb);

    //1. Create pool transaction
    const createPoolTx = await createPoolTransaction({
      mint,
      tokenName,
      tokenSymbol,
      metadataUrl,
      configKey,
      userWallet,
      buyAmount: ur.buyAmount
    });
    if (!createPoolTx) {
      return res.status(500).json({ error: 'Failed to createPoolTransaction' });
    }

    const resp: any = {
      success: true,
      mint,
      metadataUrl,
      poolTx: createPoolTx.serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        }).toString('base64'),
    };
    res.status(200).json(resp);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

async function uploadMetadata(ur: UploadRequest): Promise<string | false> {
  let metadata: Record<string, string> = {
    name: ur.tokenName,
    symbol: ur.tokenSymbol,
    description: ur.tokenDescription ?? "",
    image: ur.tokenImgUrl,
  };

  if (ur.twitter) {
    metadata["twitter"] = ur.twitter;
  }
  if (ur.telegram) {
    metadata["telegram"] = ur.telegram;
  }
  if (ur.website) {
    metadata["website"] = ur.website;
  }

  const metaId = cuid();
  const fileName = `metadata/${metaId}.json`;

  try {
    await uploadToR2(Buffer.from(JSON.stringify(metadata, null, 2)), 'application/json', fileName);
    return `${PUBLIC_R2_URL}/${fileName}`;
  } catch (error) {
    console.error('Error uploading metadata:', error);
    return false;
  }
}

async function createPoolTransaction({
  mint,
  tokenName,
  tokenSymbol,
  metadataUrl,
  configKey,
  userWallet,
  buyAmount,
}: {
  mint: string;
  tokenName: string;
  tokenSymbol: string;
  metadataUrl: string;
  configKey: string;
  userWallet: string;
  buyAmount?: number;
}) {
  const connection = new Connection(HELIUS_RPC_URL, 'confirmed');
  const client = new DynamicBondingCurveClient(connection, 'confirmed');

  let firstBuyParam: any = null;
  if (buyAmount && buyAmount > 0.00001) {
    const buyAmountSol = new BN(Math.trunc(buyAmount * LAMPORTS_PER_SOL));
    console.log("buyAmount: ", buyAmount, "buyAmountSol: ", buyAmountSol.toString());
    firstBuyParam = {
      buyer: new PublicKey(userWallet),
      buyAmount: buyAmountSol,
      minimumAmountOut: new BN(1),
      referralTokenAccount: null,
    }
  }

  const { createPoolTx, swapBuyTx } = await client.pool.createPoolWithFirstBuy({
    createPoolParam: {
      config: new PublicKey(configKey),
      baseMint: new PublicKey(mint),
      name: tokenName,
      symbol: tokenSymbol,
      uri: metadataUrl,
      payer: new PublicKey(userWallet),
      poolCreator: new PublicKey(userWallet),
    },
    firstBuyParam,
  });

  const { blockhash } = await connection.getLatestBlockhash();
  createPoolTx.feePayer = new PublicKey(userWallet);
  createPoolTx.recentBlockhash = blockhash;

  if (swapBuyTx) {
    swapBuyTx.feePayer = new PublicKey(userWallet);
    swapBuyTx.recentBlockhash = blockhash;
    createPoolTx.add(swapBuyTx);
  }

  //createPoolTx.setSigners(new PublicKey(userWallet), new PublicKey(mint));

  return createPoolTx;
}
