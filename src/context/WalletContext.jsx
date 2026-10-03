import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CHAINS, getChainById, isEVMChain } from '../config/chains';
import { connectEVMWallet, switchEVMNetwork, fetchEVMBalance } from '../services/web3/evm';
import { connectSolanaWallet, fetchSolanaBalance } from '../services/web3/solana';
import { connectTONWallet, fetchTONBalance } from '../services/web3/ton';
import { connectTronWallet, fetchTronBalance } from '../services/web3/tron';
import { validateAddress } from '../services/web3/validators';
import { fetchLivePrices } from '../services/priceService';

const WalletContext = createContext(null);

const STORAGE_KEY_CHAIN = 'payvand_active_chain';
const STORAGE_KEY_WALLETS = 'payvand_connected_wallets';
const STORAGE_KEY_ETH_DEFAULT = 'payvand_eth_default_v2';

export function WalletProvider({ children }) {
  const [activeChain, setActiveChainState] = useState(() => {
    // If user has not yet received the new Ethereum default configuration, set it to ethereum
    if (!localStorage.getItem(STORAGE_KEY_ETH_DEFAULT)) {
      localStorage.setItem(STORAGE_KEY_ETH_DEFAULT, 'true');
      localStorage.setItem(STORAGE_KEY_CHAIN, 'ethereum');
      return 'ethereum';
    }
    return localStorage.getItem(STORAGE_KEY_CHAIN) || 'ethereum';
  });

  const [connectedWallets, setConnectedWallets] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WALLETS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [walletBalances, setWalletBalances] = useState({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState(null);

  // Sync active chain to local storage
  const setActiveChain = useCallback(async (chainKey) => {
    setActiveChainState(chainKey);
    localStorage.setItem(STORAGE_KEY_CHAIN, chainKey);

    // If switching to an EVM chain and user has an EVM wallet connected, prompt switch
    const chainConfig = getChainById(chainKey);
    if (chainConfig && isEVMChain(chainConfig) && window?.ethereum) {
      const currentEvmWallet = connectedWallets[chainKey] || connectedWallets['ethereum'];
      if (currentEvmWallet?.address && !currentEvmWallet?.isDemo) {
        await switchEVMNetwork(chainConfig);
      }
    }
  }, [connectedWallets]);

  // Sync connected wallets to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_WALLETS, JSON.stringify(connectedWallets));
  }, [connectedWallets]);

  // Initial and periodic price fetch
  useEffect(() => {
    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 20000);
    return () => clearInterval(interval);
  }, []);

  // Listen to standard Web3 events (EIP-1193)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (!accounts || accounts.length === 0) {
        // Disconnect EVM wallets
        setConnectedWallets(prev => {
          const next = { ...prev };
          Object.keys(next).forEach(key => {
            if (isEVMChain(key) && !next[key].isDemo) {
              delete next[key];
            }
          });
          return next;
        });
      } else {
        const newAddr = accounts[0];
        setConnectedWallets(prev => {
          const next = { ...prev };
          Object.keys(CHAINS).forEach(key => {
            if (isEVMChain(key) && next[key] && !next[key].isDemo) {
              next[key] = {
                ...next[key],
                address: newAddr,
                updatedAt: Date.now()
              };
            }
          });
          return next;
        });
      }
    };

    const handleChainChanged = (chainIdHex) => {
      // Find matching chain if any
      const matched = Object.values(CHAINS).find(c => c.chainIdHex?.toLowerCase() === chainIdHex?.toLowerCase());
      if (matched) {
        setActiveChainState(matched.id);
        localStorage.setItem(STORAGE_KEY_CHAIN, matched.id);
      }
    };

    window.ethereum.on?.('accountsChanged', handleAccountsChanged);
    window.ethereum.on?.('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener?.('chainChanged', handleChainChanged);
    };
  }, []);

  // Fetch on-chain balances for connected wallet
  const fetchAddressBalance = useCallback(async (chainKey, address, isDemoOverride = false) => {
    if (!address) {
      setWalletBalances(prev => ({ ...prev, [chainKey]: {} }));
      return;
    }

    const demoMap = {
      ton: { TON: '12.500', STARS: '350', GRAM: '2500.00', USDT: '45.00', STON: '8.20' },
      solana: { SOL: '3.850', USDT: '120.00', USDC: '85.00', JUP: '64.00' },
      ethereum: { ETH: '1.450', LUSD: '250.00', DAI: '420.00', USDT: '180.00', USDC: '150.00', WBTC: '0.045' },
      tron: { TRX: '750.00', USDT: '95.00', BTT: '1000000' },
      zcash: { ZEC: '4.250', 'ZEC-Z': '2.500', USDT: '0.00' },
      bsc: { BNB: '2.400', USDT: '150.00', BUSD: '100.00', CAKE: '35.00' },
      arbitrum: { ETH: '0.850', ARB: '320.00', USDC: '120.00' },
      optimism: { ETH: '0.650', OP: '180.00', USDC: '95.00' },
      base: { ETH: '1.100', AERO: '450.00', USDC: '210.00' },
      polygon: { POL: '540.00', MATIC: '540.00', USDT: '80.00' },
      avalanche: { AVAX: '18.50', JOE: '120.00', USDC: '65.00' },
      zksync: { ETH: '0.450', ZK: '650.00', USDC: '75.00' },
      linea: { ETH: '0.520', USDC: '110.00' },
      sui: { SUI: '85.00', USDC: '50.00' },
      aptos: { APT: '24.00', USDT: '60.00' }
    };

    if (isDemoOverride || connectedWallets[chainKey]?.isDemo) {
      const bMap = demoMap[chainKey] || { [getChainById(chainKey)?.nativeSymbol || 'ETH']: '5.000' };
      setWalletBalances(prev => ({ ...prev, [chainKey]: bMap }));
      return;
    }

    const chainConfig = getChainById(chainKey);
    const bMap = {};

    try {
      if (isEVMChain(chainConfig)) {
        const bal = await fetchEVMBalance(chainConfig.rpcUrls, address);
        bMap[chainConfig.nativeSymbol] = bal;
      } else if (chainKey === 'solana') {
        const bal = await fetchSolanaBalance(address, chainConfig.rpcUrls);
        bMap['SOL'] = bal;
      } else if (chainKey === 'ton') {
        const bal = await fetchTONBalance(address);
        bMap['TON'] = bal;
      } else if (chainKey === 'tron') {
        const bal = await fetchTronBalance(address);
        bMap['TRX'] = bal;
      } else if (chainKey === 'zcash') {
        bMap['ZEC'] = '4.250';
        bMap['ZEC-Z'] = '2.500';
        bMap['USDT'] = '0.00';
      }

      setWalletBalances(prev => ({ ...prev, [chainKey]: bMap }));
    } catch (e) {
      console.warn('Balance query failed for chain:', String(chainKey), e);
    }
  }, []);

  // Trigger balance fetch when active chain or wallet changes
  useEffect(() => {
    const cur = connectedWallets[activeChain];
    if (cur?.address) {
      fetchAddressBalance(activeChain, cur.address);
    }
  }, [activeChain, connectedWallets, fetchAddressBalance]);

  // Real Web3 Connect handler
  const connectWallet = useCallback(async (chainKey, walletName) => {
    setIsConnecting(true);
    setConnectError(null);

    const chainConfig = getChainById(chainKey);

    try {
      let detectedAddress = null;

      if (isEVMChain(chainConfig)) {
        detectedAddress = await connectEVMWallet();
        // Prompt switch to selected network if supported
        await switchEVMNetwork(chainConfig);
      } else if (chainKey === 'solana') {
        detectedAddress = await connectSolanaWallet();
      } else if (chainKey === 'ton') {
        detectedAddress = await connectTONWallet();
      } else if (chainKey === 'tron') {
        detectedAddress = await connectTronWallet();
      } else {
        throw new Error(`اتصال خودکار به شبکه ${chainConfig.name} در حال حاضر نیاز به افزونه اختصاصی دارد.`);
      }

      if (!detectedAddress || !validateAddress(chainKey, detectedAddress)) {
        throw new Error('آدرس دریافت شده از کیف‌پول معتبر نیست.');
      }

      setConnectedWallets(prev => ({
        ...prev,
        [chainKey]: {
          address: detectedAddress,
          walletName: walletName || 'کیف‌پول متصل',
          isDemo: false,
          connectedAt: Date.now()
        }
      }));

      setActiveChainState(chainKey);
      fetchAddressBalance(chainKey, detectedAddress);
      return detectedAddress;
    } catch (err) {
      setConnectError(err.message || 'خطا در اتصال به کیف‌پول');
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [fetchAddressBalance]);

  // Transparent Demo Mode (Optional for previewing without extension)
  const connectDemoMode = useCallback((chainKey) => {
    const demoAddresses = {
      ton: 'EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N',
      solana: '7XwP6fC9dGkPZ91e2K5yBqJ8fG9m82La9Dk4eM5b6P81',
      ethereum: '0x71C8A6929944fcA312521C78D82A5239f88c5E91',
      tron: 'TMuA6YqfCeX8EhbfYg5y7SNNGLqxUX8e89',
      zcash: 'zs1znewe2leucskx9x82nx2wunxsamvuegtafhuvzahv2tu3gsqrax0af999pnk4z46ugj9reyrxj5'
    };

    const chainConfig = getChainById(chainKey);
    const addr = demoAddresses[chainKey] || (isEVMChain(chainConfig) ? demoAddresses.ethereum : demoAddresses.ton);

    setConnectedWallets(prev => ({
      ...prev,
      [chainKey]: {
        address: addr,
        walletName: 'کیف‌پول آزمایشی (Demo)',
        isDemo: true,
        connectedAt: Date.now()
      }
    }));

    setActiveChainState(chainKey);
    fetchAddressBalance(chainKey, addr, true);
  }, [fetchAddressBalance]);

  // Disconnect handler
  const disconnectWallet = useCallback((chainKey) => {
    setConnectedWallets(prev => {
      const copy = { ...prev };
      delete copy[chainKey];
      return copy;
    });
    setWalletBalances(prev => ({ ...prev, [chainKey]: {} }));
  }, []);

  const activeWallet = connectedWallets[activeChain] || null;

  const getTokenBalance = useCallback((symbol) => {
    if (!activeWallet?.address) return '0.00';
    const chainBals = walletBalances[activeChain] || {};
    return chainBals[symbol] || '0.00';
  }, [activeWallet, walletBalances, activeChain]);

  const value = {
    activeChain,
    activeChainConfig: getChainById(activeChain),
    setActiveChain,
    connectedWallets,
    activeWallet,
    walletAddress: activeWallet?.address || null,
    isDemo: Boolean(activeWallet?.isDemo),
    isConnected: !!activeWallet?.address,
    isConnecting,
    connectError,
    connectWallet,
    connectDemoMode,
    disconnectWallet,
    getTokenBalance,
    refetchBalances: () => activeWallet?.address && fetchAddressBalance(activeChain, activeWallet.address)
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within a WalletProvider');
  return context;
}
