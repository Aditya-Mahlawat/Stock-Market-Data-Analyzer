import yfinance as yf

symbols = ["AAPL", "RELIANCE.NS"]
for symbol in symbols:
    print(f"Testing {symbol}...")
    ticker = yf.Ticker(symbol)
    df = ticker.history(period="1mo")
    if df.empty:
        print(f"FAILED: No data for {symbol}")
    else:
        print(f"SUCCESS: Fetched {len(df)} rows for {symbol}")
