<a href="https://browsermcp.io">
  <img src="./.github/images/banner.png" alt="Browser MCP banner">
</a>

<h3 align="center">Browser MCP</h3>

<p align="center">
  Automate your browser with AI.
  <br />
  <a href="https://browsermcp.io"><strong>Website</strong></a> 
  •
  <a href="https://docs.browsermcp.io"><strong>Docs</strong></a>
</p>

## About

Browser MCP is an MCP server + Chrome extension that allows you to automate your browser using AI applications like VS Code, Claude, Cursor, and Windsurf.

## Features

- ⚡ Fast: Automation happens locally on your machine, resulting in better performance without network latency.
- 🔒 Private: Since automation happens locally, your browser activity stays on your device and isn't sent to remote servers.
- 👤 Logged In: Uses your existing browser profile, keeping you logged into all your services.
- 🥷🏼 Stealth: Avoids basic bot detection and CAPTCHAs by using your real browser fingerprint.
- 📈 Trading Optimized: Specialized tools and resources for stock and cryptocurrency trading automation.

## Trading Features

Browser MCP now includes specialized tools and resources optimized for trading stocks and cryptocurrencies:

### Trading Tools

- **browser_get_price**: Extract current prices from trading pages using smart pattern recognition
- **browser_execute_trade**: Automate trade execution (buy/sell) with support for market, limit, and stop orders
- **browser_monitor_price**: Real-time price monitoring with configurable intervals for tracking market movements
- **browser_get_portfolio**: Extract portfolio information including positions, balances, and P&L
- **browser_set_price_alert**: Automate setting price alerts on trading platforms
- **browser_get_market_data**: Extract comprehensive market data including volume, market cap, and price changes

### Trading Resources

- **trading://watchlist**: Access to monitored trading symbols and current prices
- **trading://positions**: Current open positions and portfolio status
- **trading://market-summary**: Market overview including indices and major market data

### Trading Utilities

The package includes robust utilities for:
- Price parsing from multiple formats ($1,234.56, 1234.56 USD, etc.)
- Amount and price validation for orders
- Percentage change calculations
- Volume parsing (with K, M, B suffixes)
- Symbol validation

These features enable automated trading workflows including:
- Monitoring multiple assets simultaneously
- Setting up automated price alerts
- Executing trades based on market conditions
- Tracking portfolio performance
- Analyzing market trends

**Note**: Always use caution when automating trades. These tools are designed to assist with automation but should be used responsibly with proper risk management.

## Contributing

This repo contains all the core MCP code for Browser MCP, but currently cannot yet be built on its own due to dependencies on utils and types from the monorepo where it's developed.

## Credits

Browser MCP was adapted from the [Playwright MCP server](https://github.com/microsoft/playwright-mcp) in order to automate the user's browser rather than creating new browser instances. This allows using the user's existing browser profile to use logged-in sessions and avoid bot detection mechanisms that commonly block automated browser use.
