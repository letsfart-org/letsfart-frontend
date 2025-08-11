import { useUnifiedWalletContext, useWallet } from '@jup-ag/wallet-adapter';
import Link from 'next/link';
import { Button } from '../ui/button';
import { CreatePoolButton } from './CreatePoolButton';
import { useMemo } from 'react';
import { shortenAddress } from '@/lib/utils';


export default function ConnectButton () {
  const { setShowModal } = useUnifiedWalletContext();

  const { disconnect, publicKey } = useWallet();
  const address = useMemo(() => publicKey?.toBase58(), [publicKey]);

  const handleConnectWallet = () => {
    // In a real implementation, this would connect to a Solana wallet
    setShowModal(true);
  };

  return (
    <>
    {address ? (
      <Button onClick={() => disconnect()}>{shortenAddress(address)}</Button>
      ) : (
              <Button
                onClick={() => {
                  handleConnectWallet();
                }}
              >
                <span className="hidden md:block">Connect Wallet</span>
                <span className="block md:hidden">Connect</span>
              </Button>
            )}
    </>
  )
}
