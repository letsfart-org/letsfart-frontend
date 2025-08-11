import { PrismaClient, type AccountInfo } from "@prisma/client";

const db: PrismaClient = new PrismaClient();

export async function selectOneMint() {
  try {
    const account = await db.accountInfo.findFirst({
      where: {
        is_used: 0
      }
    })
    return account
  } catch (error) {
    console.error('Error finding unused account:', error)
    return null;
  }
}

export async function markMintUsed(mint: string) {
  try {
    const updatedAccount = await db.accountInfo.update({
      where: {
        account_address: mint
      },
      data: {
        is_used: 1,
        updated_at: new Date()
      }
    })
    return updatedAccount
  } catch (error) {
    console.error('Error marking account as used:', error)
    throw error
  }
}

export async function checkIsMintInDb(mint: string) {
  let rows: AccountInfo[] = await db.accountInfo.findMany({
    where: {
      account_address: mint,
    },
  });
  if (!rows || rows.length == 0) {
    return false;
  }

  return true;
}

export async function insertRow(mint: string, pkey: string) {
  const isMintInDb = await checkIsMintInDb(mint);
  if (isMintInDb) {
    return;
  } 

  await db.accountInfo.create({
    data: { 
      account_address: mint,
      pkey,
      is_used: 1,
    }
  })
}

export async function fetchMintAccount(mint: string) {
  try {
    const account = await db.accountInfo.findFirst({
      where: {
        account_address: mint
      }
    })
    return account
  } catch (error) {
    console.error('Error finding unused account:', error)
    return null;
  }
}
