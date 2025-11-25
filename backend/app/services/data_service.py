import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Optional, Dict
from ..models.schemas import OHLCV

class DataService:
    @staticmethod
    def fetch_history(symbol: str, period: str = "1y", interval: str = "1d") -> List[OHLCV]:
        """
        Fetch historical data from Yahoo Finance.
        """
        ticker = yf.Ticker(symbol)
        df = ticker.history(period=period, interval=interval)
        
        if df.empty:
            return []
        
        data = []
        for index, row in df.iterrows():
            # yfinance returns index as DatetimeIndex (timezone aware)
            # We convert to naive datetime or keep it as is depending on requirement.
            # Here we convert to naive for simplicity or ensure UTC.
            dt = index.to_pydatetime()
            if dt.tzinfo:
                dt = dt.replace(tzinfo=None)
                
            data.append(OHLCV(
                date=dt,
                open=row['Open'],
                high=row['High'],
                low=row['Low'],
                close=row['Close'],
                volume=int(row['Volume'])
            ))
        return data

    @staticmethod
    def get_current_price(symbol: str) -> float:
        """
        Get real-time (delayed) price.
        """
        ticker = yf.Ticker(symbol)
        # fast_info is faster than history for current price
        return ticker.fast_info.last_price

    @staticmethod
    def search_symbols(query: str) -> List[Dict[str, str]]:
        """
        Search for symbols using Yahoo Finance.
        This is a basic implementation. For better results, we might need a dedicated search API 
        or a pre-populated list of Indian stocks.
        """
        try:
            # yfinance doesn't have a direct search method exposed easily without private APIs or scraping.
            # However, we can use the Ticker object to check if valid, but that's not search.
            # A common workaround is to use a public API or a static list.
            # For this demo, let's mock a search for common Indian stocks if the query matches,
            # or use a simple heuristic.
            
            # BETTER APPROACH: Use a static list of popular Indian/US stocks for the demo.
            # In a real app, we'd use an API like AlphaVantage Search or Yahoo Finance Autocomplete API (undocumented).
            
            results = []
            
            # Mock Data for Demo purposes (since we don't have a paid search API)
            common_stocks = [
                # Indian Stocks (NSE)
                {"symbol": "RELIANCE.NS", "name": "Reliance Industries"},
                {"symbol": "TCS.NS", "name": "Tata Consultancy Services"},
                {"symbol": "HDFCBANK.NS", "name": "HDFC Bank"},
                {"symbol": "INFY.NS", "name": "Infosys"},
                {"symbol": "ICICIBANK.NS", "name": "ICICI Bank"},
                {"symbol": "HINDUNILVR.NS", "name": "Hindustan Unilever"},
                {"symbol": "SBIN.NS", "name": "State Bank of India"},
                {"symbol": "BHARTIARTL.NS", "name": "Bharti Airtel"},
                {"symbol": "ITC.NS", "name": "ITC Limited"},
                {"symbol": "KOTAKBANK.NS", "name": "Kotak Mahindra Bank"},
                {"symbol": "LICI.NS", "name": "Life Insurance Corp"},
                {"symbol": "LT.NS", "name": "Larsen & Toubro"},
                {"symbol": "AXISBANK.NS", "name": "Axis Bank"},
                {"symbol": "HCLTECH.NS", "name": "HCL Technologies"},
                {"symbol": "ASIANPAINT.NS", "name": "Asian Paints"},
                {"symbol": "MARUTI.NS", "name": "Maruti Suzuki"},
                {"symbol": "SUNPHARMA.NS", "name": "Sun Pharma"},
                {"symbol": "TITAN.NS", "name": "Titan Company"},
                {"symbol": "BAJFINANCE.NS", "name": "Bajaj Finance"},
                {"symbol": "ULTRACEMCO.NS", "name": "UltraTech Cement"},
                {"symbol": "TATASTEEL.NS", "name": "Tata Steel"},
                {"symbol": "NTPC.NS", "name": "NTPC Limited"},
                {"symbol": "POWERGRID.NS", "name": "Power Grid Corp"},
                {"symbol": "M&M.NS", "name": "Mahindra & Mahindra"},
                {"symbol": "WIPRO.NS", "name": "Wipro"},
                {"symbol": "ADANIENT.NS", "name": "Adani Enterprises"},
                {"symbol": "ADANIPORTS.NS", "name": "Adani Ports"},
                {"symbol": "TATAMOTORS.NS", "name": "Tata Motors"},
                {"symbol": "COALINDIA.NS", "name": "Coal India"},
                {"symbol": "ONGC.NS", "name": "ONGC"},
                {"symbol": "ZOMATO.NS", "name": "Zomato"},
                {"symbol": "PAYTM.NS", "name": "Paytm (One97)"},
                
                # US Stocks
                {"symbol": "AAPL", "name": "Apple Inc."},
                {"symbol": "MSFT", "name": "Microsoft Corp."},
                {"symbol": "GOOGL", "name": "Alphabet Inc."},
                {"symbol": "AMZN", "name": "Amazon.com Inc."},
                {"symbol": "NVDA", "name": "NVIDIA Corp."},
                {"symbol": "TSLA", "name": "Tesla Inc."},
                {"symbol": "META", "name": "Meta Platforms"},
                {"symbol": "BRK-B", "name": "Berkshire Hathaway"},
                {"symbol": "V", "name": "Visa Inc."},
                {"symbol": "JPM", "name": "JPMorgan Chase"},
                {"symbol": "JNJ", "name": "Johnson & Johnson"},
                {"symbol": "WMT", "name": "Walmart Inc."},
                {"symbol": "PG", "name": "Procter & Gamble"},
                {"symbol": "MA", "name": "Mastercard Inc."},
                {"symbol": "HD", "name": "Home Depot"},
                {"symbol": "CVX", "name": "Chevron Corp."},
                {"symbol": "MRK", "name": "Merck & Co."},
                {"symbol": "KO", "name": "Coca-Cola"},
                {"symbol": "PEP", "name": "PepsiCo"},
                {"symbol": "BAC", "name": "Bank of America"},
                {"symbol": "AMD", "name": "AMD"},
                {"symbol": "NFLX", "name": "Netflix"},
                {"symbol": "INTC", "name": "Intel Corp."},
            ]
            
            q = query.upper()
            for stock in common_stocks:
                if q in stock["symbol"] or q in stock["name"].upper():
                    results.append(stock)
            
            return results
        except Exception as e:
            print(f"Search error: {e}")
            return []
