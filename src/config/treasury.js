// Official Treasury & Settlement Receiving Addresses for PayVand (پی‌وند) Protocol
// Verified checksum addresses for OTC Stars desk, Iran cashout, and multi-chain settlement

export const TREASURY_WALLETS = {
  ton: {
    address: 'UQAzVbTDzh2sCc6854FjKI-c9x-jz_sjLlJa_SmF1SC1sIMS',
    network: 'TON Mainnet',
    label: 'خزانه رسمی تون و استارز تلگرام'
  },
  evm: {
    address: '0xdB25e672d7873d178f6465E242BAdF44e990A787',
    network: 'Ethereum / Arbitrum / Base / BSC / Polygon',
    label: 'خزانه چندزنجیره‌ای EVM'
  },
  solana: {
    address: '3hY5AZkErdBrWRjYypr9TUaH7Vo3SvVuft8Zm7hJjJQn',
    network: 'Solana Mainnet (SPL)',
    label: 'خزانه رسمی سولانا'
  },
  tron: {
    address: 'TJSpjmoz4F84kB4e3tvxJt3LFhhwVtiHQN',
    network: 'TRON Mainnet (TRC-20)',
    label: 'خزانه تسویه تتر ترون'
  }
};

export function getTreasuryWallet(chainTypeOrId) {
  if (['ton', 'stars', 'usdt_ton'].includes(chainTypeOrId)) {
    return TREASURY_WALLETS.ton;
  }
  if (['solana', 'sol'].includes(chainTypeOrId)) {
    return TREASURY_WALLETS.solana;
  }
  if (['tron', 'trx', 'usdt_trc20'].includes(chainTypeOrId)) {
    return TREASURY_WALLETS.tron;
  }
  return TREASURY_WALLETS.evm;
}
