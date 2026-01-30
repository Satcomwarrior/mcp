# Trading Features - Usage Examples

This document provides examples of how to use the trading-optimized features in Browser MCP for automating stock and cryptocurrency trading workflows.

## Prerequisites

1. Browser MCP server installed and running
2. Browser extension connected to a trading platform (e.g., Robinhood, Coinbase, Binance, TradingView, etc.)
3. MCP client (VS Code, Claude, Cursor, or Windsurf) connected to the server

## Basic Price Monitoring

### Get Current Price

Extract the current price from any trading page:

```
Use browser_get_price to get the current price from the trading page
```

This will automatically detect common price patterns like:
- $1,234.56
- 1234.56 USD
- Price: 1,234.56
- Quote: 1,234.56

### Monitor Price Changes

Track price movements over time:

```
Use browser_monitor_price with interval=5 and duration=60 to monitor price every 5 seconds for 1 minute
```

This creates a price history that can be used to detect trends and opportunities.

## Portfolio Management

### View Portfolio

Get a snapshot of your current positions and balances:

```
Use browser_get_portfolio with includeDetails=true to extract portfolio information
```

This extracts information about:
- Current positions
- Account balance
- Profit/Loss (P&L)
- Holdings

### Access Portfolio Resource

Query the portfolio resource for structured data:

```
Read from trading://positions to get current open positions
```

## Market Data

### Get Market Data

Extract comprehensive market information:

```
Use browser_get_market_data with dataPoints=["price", "volume", "change_24h", "market_cap"] to get market data
```

Available data points:
- `price`: Current price
- `volume`: Trading volume
- `market_cap`: Market capitalization
- `change_24h`: 24-hour price change
- `high_24h`: 24-hour high
- `low_24h`: 24-hour low
- `all`: All available data points

### Market Summary Resource

Access market overview data:

```
Read from trading://market-summary for market indices and overview
```

## Trading Automation

### Execute a Market Buy Order

```
1. Navigate to the trading page for your desired symbol
2. Use browser_execute_trade with action="buy", amount="100", orderType="market"
3. Use browser_click to click on the buy button
4. Use browser_type to fill in the amount field
5. Use browser_click to confirm the order
```

### Execute a Limit Sell Order

```
1. Navigate to the trading page
2. Use browser_execute_trade with action="sell", amount="50", orderType="limit", price="150.50"
3. Use browser_type to fill in the limit price
4. Use browser_click to submit the order
```

### Set Price Alerts

Automate setting up price alerts:

```
1. Navigate to the alerts/notifications page
2. Use browser_set_price_alert with symbol="BTC", targetPrice="50000", condition="above"
3. Use browser_click and browser_type to fill in the alert form
4. Use browser_click to save the alert
```

## Watchlist Management

### View Watchlist

Access your monitored symbols:

```
Read from trading://watchlist to get current watchlist
```

This returns a JSON object with:
- Monitored symbols
- Current prices
- Timestamp

## Advanced Trading Workflows

### Multi-Asset Monitoring

Monitor multiple cryptocurrencies simultaneously:

```
1. Navigate to a crypto dashboard (e.g., Binance, Coinbase)
2. Use browser_get_market_data to extract data for all visible assets
3. Use browser_monitor_price to track changes over time
4. Set up alerts using browser_set_price_alert for specific price targets
```

### Automated Trading Strategy

Example: Buy dip strategy

```
1. Use browser_monitor_price with interval=10 and duration=300 to monitor for 5 minutes
2. Analyze the price history to detect a dip
3. If price drops by >2%, use browser_execute_trade to place a buy order
4. Use browser_get_portfolio to verify the position was opened
```

### Risk Management

Track positions and P&L:

```
1. Use browser_get_portfolio to get current positions
2. Calculate total exposure
3. Use browser_get_price to get current prices
4. Make decisions based on P&L thresholds
```

## Platform-Specific Examples

### TradingView

```
1. Navigate to TradingView chart
2. Use browser_get_price to extract the current price from the chart
3. Use browser_get_market_data to get volume and other indicators
4. Use browser_set_price_alert to set alerts on the platform
```

### Coinbase

```
1. Navigate to Coinbase asset page (e.g., Bitcoin)
2. Use browser_get_price to get current BTC price
3. Use browser_execute_trade with action="buy" to initiate a purchase
4. Use browser_click on the Buy button
5. Use browser_type to enter the amount
6. Use browser_click to confirm
```

### Robinhood

```
1. Navigate to stock page (e.g., AAPL)
2. Use browser_get_market_data to get stock information
3. Use browser_execute_trade with orderType="limit" for a limit order
4. Use browser_type to fill in the limit price
5. Use browser_click to place the order
```

## Best Practices

### Safety First

1. **Always verify prices**: Use browser_get_price before executing trades
2. **Start with small amounts**: Test automation with minimal positions
3. **Use limit orders**: Prefer limit orders over market orders to control price
4. **Monitor positions**: Regularly check portfolio using browser_get_portfolio
5. **Set stop losses**: Use price alerts for risk management

### Optimization Tips

1. **Efficient monitoring**: Use appropriate intervals for browser_monitor_price
   - Fast markets (crypto): 5-10 second intervals
   - Stock markets: 30-60 second intervals
   
2. **Resource management**: Access resources for quick data:
   - Use trading://watchlist for quick symbol lookup
   - Use trading://positions for portfolio overview
   - Use trading://market-summary for market context

3. **Error handling**: Always check for errors in tool responses
   - Verify price extraction was successful
   - Confirm order execution
   - Validate portfolio updates

### Combining Tools

Most powerful workflows combine multiple tools:

```
Example: Complete trading workflow

1. Navigate to trading platform
2. Use browser_get_market_data to analyze current market
3. Use browser_monitor_price to wait for target entry price
4. Use browser_execute_trade to place the order
5. Use browser_get_portfolio to confirm position
6. Use browser_set_price_alert to set exit targets
7. Read trading://positions to track the trade
```

## Troubleshooting

### Price not detected

- Try using the `selector` parameter in browser_get_price
- Navigate to a page with clearer price display
- Use browser_snapshot to see what elements are visible

### Order execution issues

- Verify you're logged into the trading platform
- Check that the platform supports the order type
- Use browser_snapshot to see available buttons/forms
- Manually verify order parameters

### Portfolio data incomplete

- Navigate to the portfolio/positions page
- Use browser_get_portfolio with includeDetails=true
- Check that you have active positions to display

## Security Notes

⚠️ **Important Security Considerations**:

1. Never share or store API keys or credentials
2. Use browser automation responsibly and within platform terms of service
3. Be aware of rate limits and API restrictions
4. Always manually verify automated trades
5. Keep your Browser MCP extension and server updated
6. Use proper authentication and secure your browser profile

## Further Reading

- [Browser MCP Documentation](https://docs.browsermcp.io)
- [MCP Protocol Specification](https://modelcontextprotocol.io)
- Trading platform-specific documentation for API/automation policies
