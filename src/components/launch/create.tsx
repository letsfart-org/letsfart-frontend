"use client"

import { z } from "zod";
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronsUpDownIcon } from "lucide-react";
import { Transaction, Keypair } from '@solana/web3.js';
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { ConnectionProvider, useUnifiedWalletContext, useWallet } from '@jup-ag/wallet-adapter';
import { Card, CardHeader, CardDescription, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import TokenConfigSelect from "./config-select";
import ChainInput from "./chain-input";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "../ui/button";
import SOLIcon from "../icons/sol";
import { useSolBalance } from "@/hooks/useWalletBalance";
import numeral from "numeral";
import { APP_NAME, HELIUS_RPC_URL } from "@/lib/constant";
import { FileUpload } from "./FileUpload";

const ConfigTypes: any = ["1", "2",]  //1: meme; 2: tech

const FormSchema = z.object({
  name: z.string().min(2, {
    message: "Token name must be at least 2 characters.",
  }),
  symbol: z.string().min(2, {
    message: "Token symbol must be at least 2 characters.",
  }),
  desc: z.string({
    required_error: 'Description is required',
  }).max(1024),
  tokenLogo: z.instanceof(File, { message: 'Token logo is required' }).optional(),
  twitter: z.string().url().optional(),
  telegram: z.string().url().optional(),
  website: z.string().url().optional(),
  config_type: z.enum(ConfigTypes).optional().default('1'),
  buy_amount: z.string().optional().default('0'),
})

function CreateTokenForm () {
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)

  const { publicKey, signTransaction } = useWallet();
  const address = useMemo(() => publicKey?.toBase58(), [publicKey]);
  const [poolCreated, setPoolCreated] = useState(false);
  const router = useRouter()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {

    },
  })

  async function onSubmit(value: z.infer<typeof FormSchema>) {
    setIsSubmitLoading(true)
    console.log("onSubmit value: ", value);

    try {
      const { tokenLogo } = value;
      if (!tokenLogo) {
        toast.error('Token logo is required');
        return;
      }

      if (value.buy_amount && value.buy_amount != "0") {
        const buyAmtVal = parseFloat(value.buy_amount);
        if (!buyAmtVal) {
          toast.error('buy_amount value is invalid!');
          return;
        }
      }

      if (!signTransaction) {
        toast.error('Wallet not connected');
        return;
      }

      const reader = new FileReader();

      // Convert file to base64
      const base64File = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(tokenLogo);
      });

      // Step 1: Upload logo to get logoUrl
      const imgResponse = await fetch('/api/upload/img', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenLogo: base64File,
        }),
      });

      if (!imgResponse.ok) {
        const error = await imgResponse.json();
        throw new Error(error.error);
      }
      const { imageUrl } = await imgResponse.json();
      console.log("imageUrl: ", imageUrl);

      // Step 2: Upload meta info to R2 and get transaction
      const uploadResponse = await fetch('/api/upload/meta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenName: value.name,
          tokenSymbol: value.symbol,
          tokenDescription: value.desc,
          tokenImgUrl: imageUrl,
          twitter: value.twitter,
          telegram: value.telegram,
          website: value.website,
          configType: value.config_type,
          userWallet: address,
          buyAmount: parseFloat(value.buy_amount),
        }),
      });
      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.error);
      }

      const { mint, metadataUrl, poolTx } = await uploadResponse.json();
      console.log("mint: ", mint);
      console.log("metadataUrl: ", metadataUrl);
      console.log("poolTx: ", poolTx);
      //router.replace(`/token/${mint}`)
      //return;

      const transaction = Transaction.from(Buffer.from(poolTx, 'base64'));

      // Step 3: Then sign with user's wallet
      const signedTransaction = await signTransaction(transaction);

      // Step 4: Send signed transaction
      const sendResponse = await fetch('/api/send-transaction', {
        method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            signedTransaction: signedTransaction.serialize({ requireAllSignatures: false }).toString('base64'),
            mint
          }),
      });

      if (!sendResponse.ok) {
        const error = await sendResponse.json();
        throw new Error(error.error);
      }

      const { success } = await sendResponse.json();
      if (success) {
        //toast.success('Pool created successfully');
        setPoolCreated(true);
        router.replace(`/token/${mint}`)
      } else {
        toast.error('Pool create failed!');
        setPoolCreated(false);
      }
    } catch (error) {
      console.error('Error creating pool:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create pool');
    } finally {
      setIsSubmitLoading(false);
    }

    return;
  }

  return (
    <Form {...form} >
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Name</FormLabel>
                <FormControl>
                  <Input className="text-black" placeholder="Token name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="symbol"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Symbol</FormLabel>
                <FormControl>
                  <Input className="text-black" placeholder="Token symbol" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="tokenLogo"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">
                Token image
                <span className="text-muted-foreground font-normal pl-1">(max size 5MB)</span>
              </FormLabel>
              <FormControl>
                <FileUpload
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="desc"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">
                  Description
                  <span className="text-muted-foreground font-normal pl-1">(max characters:1024)</span>
              </FormLabel>
              <FormControl>
                <Textarea className="bg-background text-black" placeholder="Token description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="buy_amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold flex flex-col sm:flex-row items-center">
                <div>
                  Buy Amount
                  <span className="text-muted-foreground font-normal pl-1">(optional)</span>
                </div>
                <BalanceNode />
              </FormLabel>
              <FormControl>
                <ChainInput className="text-black" step={0.00001} min={0} value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
              <FormDescription className="text-xs">
                <span className="text-foreground font-bold">tip</span>: its optional but buying a small amount of coins helps protect your coin from snipers
              </FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="config_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">
                Select coin type
                <span className="text-muted-foreground font-normal pl-1"></span>
              </FormLabel>
              <TokenConfigSelect options={ConfigTypes} onValueChange={field.onChange} defaultValue={"1"} />
              <FormDescription className="text-xs flex items-center">
                Learn more about how fees are allocated.
                <a href="https://docs.letsfart.org/faq/" target="_blank" className="text-primary pl-1 hover:underline after:content-['_↗'] after:text-primary">detail</a>
              </FormDescription>
            </FormItem>
          )}
        />
        <Collapsible>
          <CollapsibleTrigger className="flex flex-col items-start">
            <div className="flex items-center gap-2 hover:opacity-70 text-pretty text-sm font-bold">
              More Options <span className="hidden sm:block text-muted-foreground">(website, twitter, telegram, etc.)</span>
              <ChevronsUpDownIcon className="h-4 w-4" />
            </div>
            <div className="sm:hidden text-muted-foreground text-sm">(website, twitter, telegram, etc.)</div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4">
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel className="font-bold">
                    Offical Website
                    <span className="text-muted-foreground font-normal pl-1">(options)</span>
                  </FormLabel>
                  <FormControl>
                    <Input className="text-black" placeholder="Options" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="twitter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">
                    Twitter Url
                    <span className="text-muted-foreground font-normal pl-1">(options)</span>
                  </FormLabel>
                  <FormControl>
                    <Input className="text-black" placeholder="Options" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telegram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">
                    Telegram Url
                    <span className="text-muted-foreground font-normal pl-1">(options)</span>
                  </FormLabel>
                  <FormControl>
                    <Input className="text-black" placeholder="Options" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CollapsibleContent>
        </Collapsible>

        <SubmitButton isSubmitting={isSubmitLoading} />
      </form>
    </Form>
  )
}

const SubmitButton = ({ isSubmitting }: { isSubmitting: boolean }) => {
  const { publicKey } = useWallet();
  const { setShowModal } = useUnifiedWalletContext();

  if (!publicKey) {
    return (
      <Button type="button" onClick={() => setShowModal(true)}>
        <span>Connect Wallet</span>
      </Button>
    );
  }

  return (
    <Button className="flex items-center gap-2" type="submit" disabled={isSubmitting}>
      {isSubmitting ? (
        <>
          <span className="iconify ph--spinner w-5 h-5 animate-spin" />
          <span>Deploying Token...</span>
        </>
      ) : (
        <>
          <span className="iconify ph--rocket-bold w-5 h-5" />
          <span>Deploy Token</span>
        </>
      )}
    </Button>
  );
};

function BalanceNode () {
  const { solBalance, loading } = useSolBalance()
  return (
    <div className='ml-auto flex items-center justify-end text-sm gap-1'>
        <SOLIcon className='h-3 w-3 min-w-3' />
      <div className='text-muted-foreground text-xs'>balance:</div>
      <div className="flex items-center">
        {loading ? <Skeleton className="h-4 w-6" /> : (numeral(solBalance).format('0,0.0[0] ') ?? 0) }
        {" "}SOL
      </div>
    </div>
  )
}

export default function CreateToken () {
  return (
    <ConnectionProvider endpoint={HELIUS_RPC_URL}>
      <Card className="max-w-[640px] m-auto mt-6 border-neutral-850 bg-muted/50 relative">
        <CardHeader>
          <CardTitle>Launch New Token</CardTitle>
          <CardDescription>{ APP_NAME } prevents rugs by making sure that all created tokens are safe.</CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <CreateTokenForm />
        </CardContent>
      </Card>
    </ConnectionProvider>
  )
}
