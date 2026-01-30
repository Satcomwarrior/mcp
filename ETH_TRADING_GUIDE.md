# ETH Trading - Usage Examples

This document provides examples specifically for Ethereum (ETH) traders using Browser MCP.

## Quick Start for ETH Traders

If you trade in ETH, these tools will help you automate common workflows on platforms like Coinbase, Binance, Uniswap, and Etherscan.

## Gas Price Monitoring

### Check Current Gas Prices

Essential for timing your trades and transactions:

```
Use browser_get_gas_price to see current gas prices in Gwei
```

This works on:
- Etherscan gas tracker
- MetaMask
- Crypto exchange platforms
- DeFi platforms showing gas estimates

**Example Output:**
```
Current ETH Gas Prices:
  slow: 20 gwei
  standard: 35 gwei
  fast: 50 gwei
```

### Wait for Optimal Gas Prices

```
1. Use browser_get_gas_price to check current rates
2. If too high, use browser_wait with time=300 (5 minutes)
3. Repeat browser_get_gas_price until acceptable
4. Execute your transaction
```

## ETH Balance Tracking

### Check Your ETH Balance

```
Navigate to your exchange or wallet
Use browser_get_eth_balance to extract your current ETH holdings
```

Works with:
- Coinbase
- Binance
- Kraken
- MetaMask
- Trust Wallet
- Ledger Live

**Example:**
```
ETH Balance Information:
  Balances: 2.5 ETH, 0.75 ETH
  USD Values: $4,250.00, $1,275.00
```

### Track Multiple Wallets

```
1. Navigate to wallet #1
2. Use browser_get_eth_balance
3. Navigate to wallet #2
4. Use browser_get_eth_balance
5. Compare totals
```

### Include ERC-20 Tokens

```
Use browser_get_eth_balance with includeTokens=true
```

This will also extract token balances like USDT, USDC, DAI, etc.

## ETH Trading Pairs

### Monitor ETH/USDT

```
Navigate to Binance or Coinbase ETH/USDT pair
Use browser_get_eth_pair_data with pair="ETH/USDT"
```

**Example Output:**
```
Trading Pair Data for ETH/USDT:
  Price: $1,700.45
  Volume: 245.5M
  24h Change: +2.34%
```

### Compare Multiple Pairs

```
# Check ETH/USDT
Navigate to ETH/USDT chart
Use browser_get_eth_pair_data with pair="ETH/USDT"

# Check ETH/BTC
Navigate to ETH/BTC chart
Use browser_get_eth_pair_data with pair="ETH/BTC"

# Analyze arbitrage opportunities
```

### Supported Pairs

- ETH/USDT - Most liquid stablecoin pair
- ETH/USD - Fiat pair on major exchanges
- ETH/BTC - Bitcoin pair
- ETH/USDC - Alternative stablecoin
- ETH/DAI - Decentralized stablecoin
- ETH/EUR - European fiat pair

## DeFi Automation

### Check Staking Rewards

```
Navigate to staking platform (Lido, Rocket Pool, etc.)
Use browser_get_defi_data with dataType="staking"
```

**Example Output:**
```
DeFi Data:
  Staking: 4.5% APY, 0.15 ETH rewards
```

### Find Best Yield

```
# Check multiple DeFi platforms
Navigate to Aave
Use browser_get_defi_data with dataType="apy"

Navigate to Compound
Use browser_get_defi_data with dataType="apy"

Navigate to Curve
Use browser_get_defi_data with dataType="apy"

# Compare and choose best rate
```

### Monitor Liquidity Pools

```
Navigate to Uniswap or SushiSwap pool page
Use browser_get_defi_data with dataType="liquidity"
```

**Example Output:**
```
DeFi Data:
  Liquidity/TVL: $12.5M, $8.3M
  APY/APR: 25.5% APY, 18.3% APR
```

## Transaction Monitoring

### Track Your ETH Transaction

After sending a transaction:

```
Navigate to Etherscan transaction page
Use browser_monitor_eth_transaction
```

**Example Output:**
```
ETH Transaction Status:
  Status: Success
  Confirmations: 12 blocks
  Gas: 0.0035 ETH

Monitoring with 10s refresh interval.
```

### Wait for Confirmation

```
1. Execute transaction on exchange/wallet
2. Copy transaction hash
3. Navigate to Etherscan
4. Use browser_monitor_eth_transaction with txHash
5. Use browser_wait with time=10
6. Repeat step 4 until confirmed
```

### Monitor Multiple Transactions

```
# Transaction 1
Navigate to first transaction on Etherscan
Use browser_monitor_eth_transaction
Note status

# Transaction 2
Navigate to second transaction
Use browser_monitor_eth_transaction
Note status

# Continue checking both
```

## Complete ETH Trading Workflows

### Workflow 1: Optimal Buy Entry

```
# Step 1: Check gas prices
Navigate to Etherscan gas tracker
Use browser_get_gas_price

# Step 2: If gas is acceptable, check current price
Navigate to Coinbase ETH/USDT
Use browser_get_eth_pair_data with pair="ETH/USDT"

# Step 3: Check your balance
Use browser_get_eth_balance

# Step 4: Set up the trade
Use browser_execute_trade with action="buy", amount="0.5", symbol="ETH"

# Step 5: Execute using existing browser tools
Use browser_click on buy button
Use browser_type to enter amount
Use browser_click to confirm

# Step 6: Monitor transaction
Navigate to transaction in Etherscan
Use browser_monitor_eth_transaction
```

### Workflow 2: DeFi Yield Farming

```
# Step 1: Check current gas prices
Use browser_get_gas_price

# Step 2: Find best yield
Navigate to DeFi aggregator (DeFi Pulse, DeFi Llama)
Use browser_get_defi_data with dataType="all"

# Step 3: Check multiple protocols
Visit Aave, Compound, Curve
Use browser_get_defi_data on each

# Step 4: Select best option
Navigate to chosen protocol

# Step 5: Check your ETH balance
Use browser_get_eth_balance

# Step 6: Deposit
Use browser_click and browser_type to deposit ETH

# Step 7: Confirm transaction
Use browser_monitor_eth_transaction to track deposit
```

### Workflow 3: Swing Trading ETH

```
# Morning: Check overnight movement
Navigate to TradingView ETH chart
Use browser_get_eth_pair_data with pair="ETH/USDT"
Use browser_get_market_data

# Set alerts for entry
Use browser_set_price_alert for target entry

# When alert triggers:
Check gas prices with browser_get_gas_price
Execute trade with browser_execute_trade
Monitor transaction with browser_monitor_eth_transaction

# Set exit alerts
Use browser_set_price_alert for take profit
Use browser_set_price_alert for stop loss
```

### Workflow 4: Arbitrage Between Exchanges

```
# Check ETH price on Exchange 1
Navigate to Coinbase ETH/USDT
Use browser_get_eth_pair_data

# Check ETH price on Exchange 2
Navigate to Binance ETH/USDT
Use browser_get_eth_pair_data

# Calculate spread
Compare prices

# If profitable:
Check gas prices with browser_get_gas_price
Execute buy on cheaper exchange
Execute sell on expensive exchange
Monitor both transactions
```

## Platform-Specific Examples

### Coinbase

```
# Check ETH balance
Navigate to Coinbase portfolio
Use browser_get_eth_balance

# Check current price
Navigate to ETH asset page
Use browser_get_eth_pair_data with pair="ETH/USD"

# Execute trade
Use browser_execute_trade
Use browser_click and browser_type to complete
```

### Binance

```
# Monitor ETH/USDT
Navigate to Binance ETH/USDT
Use browser_get_eth_pair_data with pair="ETH/USDT"

# Check multiple pairs
Use browser_get_market_data

# Track balance
Use browser_get_eth_balance with includeTokens=true
```

### Uniswap

```
# Check liquidity pool
Navigate to ETH/USDC pool
Use browser_get_defi_data with dataType="liquidity"

# Check gas before swap
Use browser_get_gas_price

# Monitor swap transaction
After swap, use browser_monitor_eth_transaction
```

### Etherscan

```
# Monitor your wallet
Navigate to your address on Etherscan
Use browser_get_eth_balance

# Track transaction
Navigate to transaction hash
Use browser_monitor_eth_transaction

# Check gas prices
Use browser_get_gas_price
```

### MetaMask

```
# Check balance
Open MetaMask
Use browser_get_eth_balance

# Check gas estimate
On transaction screen
Use browser_get_gas_price

# Confirm transaction
Use browser_click to confirm
Navigate to Etherscan link
Use browser_monitor_eth_transaction
```

## Best Practices for ETH Traders

### Gas Price Management

1. **Always check gas before transactions**
   ```
   Use browser_get_gas_price before every trade
   ```

2. **Wait for low gas periods**
   - Typically lower on weekends
   - Lower during US night hours
   - Use browser_wait and recheck

3. **Set gas price alerts**
   - Monitor gas throughout the day
   - Trade when gas drops below threshold

### Balance Management

1. **Track across platforms**
   ```
   Check each exchange/wallet with browser_get_eth_balance
   ```

2. **Include tokens**
   ```
   Use includeTokens=true to see full portfolio
   ```

3. **Regular audits**
   - Daily balance checks
   - Compare with previous snapshots

### Trading Pair Selection

1. **Use ETH/USDT for stability**
   - Most liquid
   - Easiest to track in USD

2. **Use ETH/BTC for crypto exposure**
   - Isolate from USD fluctuations
   - Track ETH performance vs BTC

3. **Use ETH/USD on regulated exchanges**
   - Direct fiat pairing
   - Tax reporting clarity

### DeFi Strategies

1. **Compare yields regularly**
   ```
   Check multiple platforms daily with browser_get_defi_data
   ```

2. **Factor in gas costs**
   ```
   High APY might not be worth it with high gas
   ```

3. **Monitor transaction confirmations**
   ```
   Use browser_monitor_eth_transaction for all DeFi txns
   ```

### Transaction Monitoring

1. **Always track important transactions**
   ```
   Use browser_monitor_eth_transaction after trades
   ```

2. **Set refresh intervals appropriately**
   - 5s for urgent transactions
   - 10s for normal priority
   - 30s for low priority

3. **Verify on Etherscan**
   - Don't trust exchange confirmations alone
   - Check block explorer

## Common ETH Trading Scenarios

### Scenario: Gas is too high

```
Problem: Want to trade but gas is 100+ gwei

Solution:
1. Use browser_get_gas_price to confirm
2. Use browser_wait with time=1800 (30 min)
3. Recheck with browser_get_gas_price
4. Repeat until acceptable
5. Execute trade quickly before gas rises
```

### Scenario: Finding best DeFi yield

```
Problem: Want highest APY for ETH

Solution:
1. Create list of platforms to check
2. For each platform:
   - Navigate to platform
   - Use browser_get_defi_data
   - Note APY
3. Compare results
4. Choose highest yield factoring gas costs
5. Execute deposit
```

### Scenario: Tracking pending transaction

```
Problem: Sent ETH but transaction pending

Solution:
1. Navigate to Etherscan with transaction hash
2. Use browser_monitor_eth_transaction
3. Check confirmation count
4. If stuck, check gas price used vs current
5. If too low, consider speed-up transaction
```

### Scenario: Multi-exchange arbitrage

```
Problem: ETH price differs across exchanges

Solution:
1. Check price on Exchange A with browser_get_eth_pair_data
2. Check price on Exchange B with browser_get_eth_pair_data
3. Calculate spread minus fees and gas
4. If profitable:
   - Check balances with browser_get_eth_balance
   - Execute buy on cheaper exchange
   - Execute sell on expensive exchange
   - Monitor both transactions
```

## Resources for ETH Traders

### Useful Platforms

- **Exchanges**: Coinbase, Binance, Kraken, Gemini
- **DeFi**: Uniswap, Aave, Compound, Curve
- **Block Explorers**: Etherscan, Blockchair
- **Gas Trackers**: Etherscan Gas Tracker, GasNow
- **Analytics**: DeFi Pulse, DeFi Llama, CoinGecko

### Further Learning

- See [TRADING_EXAMPLES.md](TRADING_EXAMPLES.md) for general trading examples
- See [TRADING_UTILITIES.md](TRADING_UTILITIES.md) for utility function reference
- Check ETH-specific utility functions in `src/utils/eth.ts`

## Safety Reminders

⚠️ **Important for ETH Traders**:

1. **Gas costs matter** - Always check gas before trading
2. **Verify addresses** - Double-check ETH addresses before sending
3. **Test with small amounts** - Start with small ETH amounts when automating
4. **Monitor transactions** - Always track important transactions
5. **DeFi risks** - Understand smart contract risks before using DeFi
6. **Slippage** - Set appropriate slippage tolerance for DEX trades
7. **Network congestion** - Be aware of network state before urgent trades
