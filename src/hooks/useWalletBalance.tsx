import { useConnection, useWallet } from '@jup-ag/wallet-adapter';
import { useEffect, useState } from 'react';

export function useSolBalance() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalance = async () => {
    //console.log("publicKey: ", publicKey);
    if (!publicKey) {
      setBalance(null);
      return;
    }

    //console.log("connection: ", connection);
    setLoading(true);
    try {
      const lamports = await connection.getBalance(publicKey);
      console.log("lamports: ", lamports);
      const sol = lamports / 10 ** 9; // 转换为 SOL
      setBalance(sol);
      setError(null);
    } catch (err) {
      console.log("err: ", err);
      setError(err as Error);
      setBalance(null);
    } finally {
      setLoading(false);
    }
  };

  // 当公钥变化时自动获取余额
  useEffect(() => {
    fetchBalance();
  }, [publicKey?.toString()]); // 依赖公钥字符串

  return {
    solBalance: balance,
    loading,
    error,
    refresh: fetchBalance, // 手动刷新函数
  };
}
