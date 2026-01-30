# Trading Utilities Reference

This document provides a reference for the trading-specific utility functions available in Browser MCP.

## Price Utilities

### parsePrice(priceString: string): number | null

Parses price strings from various formats into a numeric value.

**Supported Formats:**
- US format: `$1,234.56`, `1,234.56 USD`
- European format: `1.234,56 EUR`
- Crypto format: `0.00001234 BTC`
- Plain numbers: `1234.56`

**Examples:**
```typescript
parsePrice("$1,234.56")      // 1234.56
parsePrice("1.234,56 EUR")   // 1234.56
parsePrice("1,234.56")       // 1234.56
parsePrice("0.00001234 BTC") // 0.00001234
```

**Returns:**
- `number`: Parsed price value
- `null`: If parsing fails

---

### formatPrice(price: number, currency: string = "USD"): string

Formats a numeric price value for display with proper currency formatting.

**Parameters:**
- `price`: The numeric price value
- `currency`: Currency code (default: "USD")

**Examples:**
```typescript
formatPrice(1234.56, "USD")     // "$1,234.56"
formatPrice(1234.56789, "BTC")  // "1234.56789000 BTC"
formatPrice(1234.56, "EUR")     // "€1,234.56"
```

---

### validatePrice(price: string | number): ValidationResult

Validates a price value for limit/stop orders.

**Returns:**
```typescript
{
  valid: boolean;
  value?: number;
  error?: string;
}
```

**Examples:**
```typescript
validatePrice("150.50")  // { valid: true, value: 150.50 }
validatePrice("-10")     // { valid: false, error: "Price must be positive" }
validatePrice("abc")     // { valid: false, error: "Invalid price format" }
```

---

## Amount Utilities

### validateAmount(amount: string | number): ValidationResult

Validates a trading amount/quantity.

**Returns:**
```typescript
{
  valid: boolean;
  value?: number;
  error?: string;
}
```

**Examples:**
```typescript
validateAmount("100")     // { valid: true, value: 100 }
validateAmount("0.5")     // { valid: true, value: 0.5 }
validateAmount("0")       // { valid: false, error: "Amount must be positive" }
validateAmount("-100")    // { valid: false, error: "Amount must be positive" }
```

---

## Change Calculation

### calculateChange(oldPrice: number, newPrice: number): ChangeResult

Calculates absolute and percentage change between two prices.

**Returns:**
```typescript
{
  absolute: number;
  percentage: number;
}
```

**Examples:**
```typescript
calculateChange(100, 110)   // { absolute: 10, percentage: 10 }
calculateChange(100, 95)    // { absolute: -5, percentage: -5 }
calculateChange(100, 100.5) // { absolute: 0.5, percentage: 0.5 }
```

---

### isSignificantChange(oldPrice: number, newPrice: number, threshold: number = 1.0): boolean

Determines if a price change exceeds a specified threshold.

**Parameters:**
- `oldPrice`: Previous price
- `newPrice`: Current price
- `threshold`: Percentage threshold (default: 1.0%)

**Examples:**
```typescript
isSignificantChange(100, 102, 1.0)   // true (2% change)
isSignificantChange(100, 100.5, 1.0) // false (0.5% change)
isSignificantChange(100, 95, 3.0)    // true (5% change exceeds 3% threshold)
```

---

## Symbol Utilities

### validateSymbol(symbol: string): boolean

Validates trading symbol format.

**Valid Formats:**
- Stock tickers: AAPL, MSFT, GOOGL
- Crypto tickers: BTC, ETH, DOGE
- Crypto pairs: BTCUSDT, ETHBTC

**Examples:**
```typescript
validateSymbol("AAPL")     // true
validateSymbol("BTC")      // true
validateSymbol("BTCUSDT")  // true
validateSymbol("invalid!") // false
validateSymbol("TOOLONG123") // false (>10 chars)
```

---

## Percentage Utilities

### parsePercentage(percentString: string): number | null

Extracts numeric value from percentage strings.

**Examples:**
```typescript
parsePercentage("5.5%")    // 5.5
parsePercentage("+2.3%")   // 2.3
parsePercentage("-1.2%")   // -1.2
parsePercentage("invalid") // null
```

---

## Volume Utilities

### parseVolume(volumeString: string): number | null

Parses volume strings with K, M, B suffixes into numeric values.

**Supported Suffixes:**
- K (thousands): 1,000
- M (millions): 1,000,000
- B (billions): 1,000,000,000

**Examples:**
```typescript
parseVolume("1.5K")      // 1500
parseVolume("2.3M")      // 2300000
parseVolume("1.2B")      // 1200000000
parseVolume("1,234")     // 1234
parseVolume("Vol: 5.5M") // 5500000
```

---

## Complete Example Usage

```typescript
import {
  parsePrice,
  formatPrice,
  validateAmount,
  validatePrice,
  calculateChange,
  isSignificantChange,
  validateSymbol,
  parsePercentage,
  parseVolume,
} from "@/utils/trading";

// Price monitoring workflow
const priceString = "$1,234.56";
const currentPrice = parsePrice(priceString);

if (currentPrice !== null) {
  const previousPrice = 1200.00;
  const change = calculateChange(previousPrice, currentPrice);
  
  console.log(`Price: ${formatPrice(currentPrice)}`);
  console.log(`Change: ${change.percentage.toFixed(2)}%`);
  
  if (isSignificantChange(previousPrice, currentPrice, 2.0)) {
    console.log("Significant price movement detected!");
  }
}

// Order validation workflow
const symbol = "AAPL";
const amount = "100";
const limitPrice = "150.50";

if (validateSymbol(symbol)) {
  const amountValidation = validateAmount(amount);
  const priceValidation = validatePrice(limitPrice);
  
  if (amountValidation.valid && priceValidation.valid) {
    console.log(`Valid order: ${symbol} x ${amountValidation.value} @ ${formatPrice(priceValidation.value!)}`);
  } else {
    console.error(amountValidation.error || priceValidation.error);
  }
}

// Market data parsing
const volumeStr = "Vol: 2.5M";
const volume = parseVolume(volumeStr);
console.log(`Trading volume: ${volume?.toLocaleString()} shares`);

const changeStr = "+5.5%";
const percentChange = parsePercentage(changeStr);
console.log(`Price change: ${percentChange}%`);
```

---

## Type Definitions

```typescript
type ValidationResult = {
  valid: boolean;
  value?: number;
  error?: string;
};

type ChangeResult = {
  absolute: number;
  percentage: number;
};
```

---

## Error Handling

All parsing functions return `null` on failure instead of throwing errors, allowing for graceful error handling:

```typescript
const price = parsePrice(userInput);

if (price === null) {
  // Handle invalid input
  console.error("Could not parse price");
} else {
  // Use parsed price
  console.log(`Parsed price: ${price}`);
}
```

Validation functions return detailed error messages:

```typescript
const validation = validateAmount(userInput);

if (!validation.valid) {
  // Show error to user
  console.error(validation.error);
} else {
  // Use validated value
  const amount = validation.value;
}
```

---

## Best Practices

1. **Always validate inputs**: Use validation functions before executing trades
2. **Handle null returns**: Check for null when parsing user input
3. **Use appropriate thresholds**: Adjust `isSignificantChange` threshold based on asset volatility
4. **Format for display**: Use `formatPrice` when showing prices to users
5. **Validate symbols**: Check symbol format before making API calls

---

## Platform Compatibility

These utilities are designed to work with various trading platforms:

- **Stock platforms**: Robinhood, E*TRADE, TD Ameritrade, Interactive Brokers
- **Crypto platforms**: Coinbase, Binance, Kraken, Gemini
- **Chart platforms**: TradingView, Yahoo Finance, Google Finance
- **General**: Any platform displaying prices in standard formats

---

## Performance Notes

All utility functions are:
- **Fast**: Simple string operations and calculations
- **Safe**: No external dependencies or API calls
- **Pure**: No side effects, same input always produces same output
- **Type-safe**: Full TypeScript support with proper type definitions
