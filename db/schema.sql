-- JSWAP Swap History Database Schema
-- For Neon Serverless Postgres + Cloudflare Workers

CREATE TABLE IF NOT EXISTS swaps (
    id              SERIAL PRIMARY KEY,
    tx_hash         VARCHAR(66) UNIQUE,          -- 0x... transaction hash
    chain_id        INTEGER NOT NULL,             -- EVM chain ID (1, 56, 137, ...)
    chain_name      VARCHAR(32) NOT NULL,         -- ethereum, bsc, polygon, ...
    wallet_address  VARCHAR(42) NOT NULL,         -- 0x... user wallet
    token_in        VARCHAR(42) NOT NULL,         -- input token contract
    token_out       VARCHAR(42) NOT NULL,         -- output token contract
    symbol_in       VARCHAR(16) NOT NULL,         -- ETH, USDT, ...
    symbol_out      VARCHAR(16) NOT NULL,
    amount_in       NUMERIC(36, 18) NOT NULL,     -- input amount (wei precision)
    amount_out      NUMERIC(36, 18) NOT NULL,     -- output amount
    slippage_bps    INTEGER DEFAULT 50,           -- slippage in basis points (50 = 0.5%)
    price_impact    NUMERIC(8, 4),                -- price impact percentage
    gas_used        BIGINT,
    status          VARCHAR(10) DEFAULT 'pending', -- pending, confirmed, failed
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_swaps_wallet ON swaps(wallet_address);
CREATE INDEX idx_swaps_chain ON swaps(chain_id);
CREATE INDEX idx_swaps_created ON swaps(created_at DESC);

-- Price cache table (for Cloudflare Workers edge caching)
CREATE TABLE IF NOT EXISTS price_cache (
    token_address   VARCHAR(42) NOT NULL,
    chain_id        INTEGER NOT NULL,
    price_usd       NUMERIC(24, 8) NOT NULL,
    source          VARCHAR(20) DEFAULT 'coingecko', -- coingecko, dexscreener, ...
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (token_address, chain_id)
);

-- Daily volume aggregation
CREATE TABLE IF NOT EXISTS daily_stats (
    stat_date       DATE NOT NULL,
    chain_id        INTEGER NOT NULL,
    total_swaps     INTEGER DEFAULT 0,
    total_volume    NUMERIC(36, 18) DEFAULT 0,    -- in USD
    unique_wallets  INTEGER DEFAULT 0,
    PRIMARY KEY (stat_date, chain_id)
);
