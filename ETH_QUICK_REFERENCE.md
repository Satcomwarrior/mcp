# ETH Trading Quick Reference

Quick reference card for Ethereum traders using Browser MCP.

## Essential ETH Tools

| Tool | Purpose | Quick Example |
|------|---------|---------------|
| `browser_get_gas_price` | Check gas prices | Get current Gwei prices |
| `browser_get_eth_balance` | Check ETH balance | See your ETH holdings |
| `browser_get_eth_pair_data` | Track ETH pairs | Monitor ETH/USDT price |
| `browser_get_defi_data` | DeFi yields/APY | Find best staking rates |
| `browser_monitor_eth_transaction` | Track transactions | Follow tx confirmations |

## Quick Commands

### Before Every Trade
```
1. browser_get_gas_price        # Check if gas is reasonable
2. browser_get_eth_balance      # Verify you have enough ETH
3. browser_get_eth_pair_data    # Confirm current price
```

### DeFi Workflow
```
1. browser_get_defi_data        # Compare yields
2. browser_get_gas_price        # Check transaction cost
3. Execute deposit/stake
4. browser_monitor_eth_transaction  # Track confirmation
```

### After Transaction
```
1. Navigate to Etherscan
2. browser_monitor_eth_transaction  # Watch confirmations
3. Wait until confirmed
```

## Gas Price Guide

| Gas Price (Gwei) | Speed | When to Use |
|-----------------|-------|-------------|
| < 20 | Slow | Non-urgent, overnight |
| 20-50 | Standard | Normal trading |
| 50-100 | Fast | Time-sensitive trades |
| > 100 | Very Fast | Urgent only, high cost |

**Tip**: Use `browser_get_gas_price` to check before EVERY transaction

## Common ETH Pairs

| Pair | Best For |
|------|----------|
| ETH/USDT | General trading (most liquid) |
| ETH/USD | Direct fiat exposure |
| ETH/BTC | Crypto-only, isolate from USD |
| ETH/USDC | Alternative stablecoin |
| ETH/DAI | DeFi and decentralized |

## DeFi Platforms

| Platform | Use | Tool to Use |
|----------|-----|-------------|
| Uniswap | Swaps, pools | `browser_get_defi_data` |
| Aave | Lending/borrowing | `browser_get_defi_data` |
| Compound | Lending | `browser_get_defi_data` |
| Lido | ETH staking | `browser_get_defi_data` |
| Curve | Stablecoin pools | `browser_get_defi_data` |

## Exchange Automation

### Coinbase
```
Navigate to Coinbase ETH page
browser_get_eth_balance          # Check balance
browser_get_eth_pair_data        # Get price
browser_execute_trade            # Get trade guidance
```

### Binance
```
Navigate to Binance ETH/USDT
browser_get_eth_pair_data        # Monitor pair
browser_get_market_data          # Get full data
browser_execute_trade            # Prepare trade
```

### Uniswap
```
Navigate to Uniswap ETH pool
browser_get_defi_data            # Check pool info
browser_get_gas_price            # Verify gas cost
Execute swap
browser_monitor_eth_transaction  # Track swap
```

## Utility Functions

Available in `src/utils/eth.ts`:

### Unit Conversion
```typescript
convertEthUnits(100, "gwei", "eth")  // Convert Gwei to ETH
formatEthAmount(0.00001234)          // Format small amounts
formatGasPrice(45.5)                 // Format gas: "45.50 Gwei"
```

### Gas Calculations
```typescript
calculateGasCost(21000, 50)          // Gas cost in ETH
estimateTransactionCost(65000, 40)   // Estimate cost
```

### Address & Validation
```typescript
isValidEthAddress("0x...")           // Validate address
shortenAddress("0x...")              // Shorten for display
isValidTxHash("0x...")               // Validate tx hash
```

### Trading Helpers
```typescript
parseTradingPair("ETH/USDT")        // Parse pair
isEthPair("ETH/BTC")                 // Check if ETH pair
calculateSlippage(1700, 1695)        // Calculate slippage
```

### DeFi Calculations
```typescript
calculateAPY(12, 365)                // APR to APY
calculateAPR(12.68, 365)             // APY to APR
parseDeFiPercentage("12.5% APY")     // Parse yield
```

## Timing Your Trades

### Best Times for Low Gas (Generally)
- **Weekends**: Saturday-Sunday
- **Night (US)**: 12 AM - 6 AM EST
- **Avoid**: Monday mornings, major DeFi events

### Gas Price Monitoring Strategy
```
Every 5 minutes:
  browser_get_gas_price
  If gas < 30 gwei → Execute trades
  If gas > 50 gwei → Wait
  browser_wait with time=300 (5 min)
  Repeat
```

## Transaction Monitoring

### Confirmation Levels
- **1-2 blocks**: Very risky, can be reorg'd
- **3-6 blocks**: Low risk for small amounts
- **12+ blocks**: Safe for most purposes  
- **35+ blocks**: Exchange deposit standard

### Monitor Pattern
```
Send transaction
Copy transaction hash
Navigate to Etherscan
browser_monitor_eth_transaction
browser_wait with time=10
Repeat until 12+ confirmations
```

## Safety Checklist

Before Every Trade:
- [ ] Check gas with `browser_get_gas_price`
- [ ] Verify balance with `browser_get_eth_balance`
- [ ] Confirm price with `browser_get_eth_pair_data`
- [ ] Check address if sending (not trading)
- [ ] Set slippage tolerance (DEX only)

After Every Trade:
- [ ] Monitor with `browser_monitor_eth_transaction`
- [ ] Verify on Etherscan
- [ ] Wait for confirmations
- [ ] Check new balance

## Common Issues & Solutions

### Issue: Gas too high
**Solution**: Use `browser_get_gas_price`, wait for lower gas with `browser_wait`

### Issue: Transaction pending too long
**Solution**: Use `browser_monitor_eth_transaction`, check if gas was too low

### Issue: Can't find balance
**Solution**: Navigate to portfolio page, use `browser_get_eth_balance` with `includeTokens=true`

### Issue: Price seems wrong
**Solution**: Verify with `browser_get_eth_pair_data` on multiple exchanges

### Issue: DeFi APY unclear
**Solution**: Use `browser_get_defi_data` with `dataType="all"` for complete info

## Resources

- **Full Guide**: [ETH_TRADING_GUIDE.md](ETH_TRADING_GUIDE.md)
- **General Trading**: [TRADING_EXAMPLES.md](TRADING_EXAMPLES.md)
- **Utilities Reference**: [TRADING_UTILITIES.md](TRADING_UTILITIES.md)

## Platform Links

- Etherscan: https://etherscan.io (gas tracker, transactions)
- Coinbase: https://coinbase.com (exchange)
- Binance: https://binance.com (exchange)
- Uniswap: https://app.uniswap.org (DEX)
- Aave: https://app.aave.com (lending)

---

**Remember**: Always verify transactions, use appropriate gas prices, and start with small amounts when automating!
