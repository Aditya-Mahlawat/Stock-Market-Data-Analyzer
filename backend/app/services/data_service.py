import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Optional, Dict
from ..models.schemas import OHLCV

class DataService:
    @staticmethod
    def fetch_history(symbol: str, period: str = "1y", interval: str = "1d") -> List[OHLCV]:
        """
        Fetch historical data from Yahoo Finance. Fallback to mock data on failure.
        """
        try:
            ticker = yf.Ticker(symbol)
            df = ticker.history(period=period, interval=interval)
            
            if df.empty:
                raise Exception("Empty data")
                
            # Calculate Indicators
            df['SMA_20'] = df['Close'].rolling(window=20).mean()
            df['SMA_50'] = df['Close'].rolling(window=50).mean()
            
            # RSI Calculation
            delta = df['Close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            df['RSI'] = 100 - (100 / (1 + rs))
            
            # Fill NaN values to avoid JSON serialization errors
            df = df.fillna(0)

            data = []
            for index, row in df.iterrows():
                dt = index.to_pydatetime()
                if dt.tzinfo:
                    dt = dt.replace(tzinfo=None)
                    
                data.append(OHLCV(
                    date=dt,
                    open=row['Open'],
                    high=row['High'],
                    low=row['Low'],
                    close=row['Close'],
                    volume=int(row['Volume']),
                    SMA_20=float(row['SMA_20']) if row['SMA_20'] != 0 else None,
                    SMA_50=float(row['SMA_50']) if row['SMA_50'] != 0 else None,
                    RSI=float(row['RSI']) if row['RSI'] != 0 else None
                ))
            return data
            
        except Exception as e:
            print(f"Error fetching data for {symbol}: {e}. Using Mock Data.")
            return DataService._generate_mock_data(symbol, period)

    @staticmethod
    def _generate_mock_data(symbol: str, period: str) -> List[OHLCV]:
        import numpy as np
        
        # Determine days based on period
        days_map = {'1d': 1, '5d': 5, '1mo': 30, '6mo': 180, '1y': 365, '2y': 730, 'max': 1000}
        days = days_map.get(period, 365)
        
        # Generate dates
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        date_range = pd.date_range(start=start_date, end=end_date, freq='B') # Business days
        
        # Generate random price walk
        np.random.seed(sum(ord(c) for c in symbol)) # Seed with symbol for consistency
        n = len(date_range)
        start_price = 100.0 + np.random.rand() * 1000 # Random start price
        returns = np.random.normal(0.0005, 0.02, n) # Mean 0.05%, Std 2%
        price_path = start_price * (1 + returns).cumprod()
        
        # Calculate Mock Indicators (Simple approximation for visual consistency)
        import pandas as pd
        df = pd.DataFrame({'Close': price_path})
        df['SMA_20'] = df['Close'].rolling(window=20).mean().fillna(0)
        df['SMA_50'] = df['Close'].rolling(window=50).mean().fillna(0)
        
        # Mock RSI
        delta = df['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['RSI'] = 100 - (100 / (1 + rs))
        df = df.fillna(50) # Default RSI to 50

        data = []
        for i, date in enumerate(date_range):
            close = float(price_path[i])
            open_p = close * (1 + np.random.normal(0, 0.005))
            high = max(open_p, close) * (1 + abs(np.random.normal(0, 0.01)))
            low = min(open_p, close) * (1 - abs(np.random.normal(0, 0.01)))
            volume = int(np.random.randint(10000, 1000000))
            
            data.append(OHLCV(
                date=date.to_pydatetime(),
                open=open_p,
                high=high,
                low=low,
                close=close,
                volume=volume,
                SMA_20=float(df.iloc[i]['SMA_20']) if df.iloc[i]['SMA_20'] != 0 else None,
                SMA_50=float(df.iloc[i]['SMA_50']) if df.iloc[i]['SMA_50'] != 0 else None,
                RSI=float(df.iloc[i]['RSI'])
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
                # --- Nifty 50 & Next 50 (Top 100 NSE Stocks) ---
                {"symbol": "RELIANCE.NS", "name": "Reliance Industries Ltd."},
                {"symbol": "TCS.NS", "name": "Tata Consultancy Services Ltd."},
                {"symbol": "HDFCBANK.NS", "name": "HDFC Bank Ltd."},
                {"symbol": "ICICIBANK.NS", "name": "ICICI Bank Ltd."},
                {"symbol": "INFY.NS", "name": "Infosys Ltd."},
                {"symbol": "HINDUNILVR.NS", "name": "Hindustan Unilever Ltd."},
                {"symbol": "ITC.NS", "name": "ITC Ltd."},
                {"symbol": "SBIN.NS", "name": "State Bank of India"},
                {"symbol": "BHARTIARTL.NS", "name": "Bharti Airtel Ltd."},
                {"symbol": "LICI.NS", "name": "Life Insurance Corporation of India"},
                {"symbol": "KOTAKBANK.NS", "name": "Kotak Mahindra Bank Ltd."},
                {"symbol": "LT.NS", "name": "Larsen & Toubro Ltd."},
                {"symbol": "HCLTECH.NS", "name": "HCL Technologies Ltd."},
                {"symbol": "AXISBANK.NS", "name": "Axis Bank Ltd."},
                {"symbol": "ASIANPAINT.NS", "name": "Asian Paints Ltd."},
                {"symbol": "MARUTI.NS", "name": "Maruti Suzuki India Ltd."},
                {"symbol": "SUNPHARMA.NS", "name": "Sun Pharmaceutical Industries Ltd."},
                {"symbol": "TITAN.NS", "name": "Titan Company Ltd."},
                {"symbol": "BAJFINANCE.NS", "name": "Bajaj Finance Ltd."},
                {"symbol": "ULTRACEMCO.NS", "name": "UltraTech Cement Ltd."},
                {"symbol": "NTPC.NS", "name": "NTPC Ltd."},
                {"symbol": "ONGC.NS", "name": "Oil & Natural Gas Corporation Ltd."},
                {"symbol": "TATAMOTORS.NS", "name": "Tata Motors Ltd."},
                {"symbol": "POWERGRID.NS", "name": "Power Grid Corporation of India Ltd."},
                {"symbol": "ADANIENT.NS", "name": "Adani Enterprises Ltd."},
                {"symbol": "TATASTEEL.NS", "name": "Tata Steel Ltd."},
                {"symbol": "COALINDIA.NS", "name": "Coal India Ltd."},
                {"symbol": "WIPRO.NS", "name": "Wipro Ltd."},
                {"symbol": "M&M.NS", "name": "Mahindra & Mahindra Ltd."},
                {"symbol": "ADANIPORTS.NS", "name": "Adani Ports and Special Economic Zone Ltd."},
                {"symbol": "JSWSTEEL.NS", "name": "JSW Steel Ltd."},
                {"symbol": "BAJAJFINSV.NS", "name": "Bajaj Finserv Ltd."},
                {"symbol": "HDFCLIFE.NS", "name": "HDFC Life Insurance Company Ltd."},
                {"symbol": "GRASIM.NS", "name": "Grasim Industries Ltd."},
                {"symbol": "TECHM.NS", "name": "Tech Mahindra Ltd."},
                {"symbol": "SBILIFE.NS", "name": "SBI Life Insurance Company Ltd."},
                {"symbol": "BRITANNIA.NS", "name": "Britannia Industries Ltd."},
                {"symbol": "INDUSINDBK.NS", "name": "IndusInd Bank Ltd."},
                {"symbol": "CIPLA.NS", "name": "Cipla Ltd."},
                {"symbol": "DRREDDY.NS", "name": "Dr. Reddy's Laboratories Ltd."},
                {"symbol": "EICHERMOT.NS", "name": "Eicher Motors Ltd."},
                {"symbol": "NESTLEIND.NS", "name": "Nestle India Ltd."},
                {"symbol": "TATACONSUM.NS", "name": "Tata Consumer Products Ltd."},
                {"symbol": "DIVISLAB.NS", "name": "Divi's Laboratories Ltd."},
                {"symbol": "HINDALCO.NS", "name": "Hindalco Industries Ltd."},
                {"symbol": "APOLLOHOSP.NS", "name": "Apollo Hospitals Enterprise Ltd."},
                {"symbol": "BAJAJ-AUTO.NS", "name": "Bajaj Auto Ltd."},
                {"symbol": "HEROMOTOCO.NS", "name": "Hero MotoCorp Ltd."},
                {"symbol": "UPL.NS", "name": "UPL Ltd."},
                {"symbol": "BPCL.NS", "name": "Bharat Petroleum Corporation Ltd."},
                {"symbol": "ZOMATO.NS", "name": "Zomato Ltd."},
                {"symbol": "PAYTM.NS", "name": "One 97 Communications Ltd. (Paytm)"},
                {"symbol": "HAL.NS", "name": "Hindustan Aeronautics Ltd."},
                {"symbol": "DLF.NS", "name": "DLF Ltd."},
                {"symbol": "VBL.NS", "name": "Varun Beverages Ltd."},
                {"symbol": "JIOFIN.NS", "name": "Jio Financial Services Ltd."},
                {"symbol": "SIEMENS.NS", "name": "Siemens Ltd."},
                {"symbol": "PIDILITIND.NS", "name": "Pidilite Industries Ltd."},
                {"symbol": "BEL.NS", "name": "Bharat Electronics Ltd."},
                {"symbol": "IOC.NS", "name": "Indian Oil Corporation Ltd."},
                {"symbol": "TRENT.NS", "name": "Trent Ltd."},
                {"symbol": "RECLTD.NS", "name": "REC Ltd."},
                {"symbol": "PFC.NS", "name": "Power Finance Corporation Ltd."},
                {"symbol": "GAIL.NS", "name": "GAIL (India) Ltd."},
                {"symbol": "CHOLAFIN.NS", "name": "Cholamandalam Investment and Finance Company Ltd."},
                {"symbol": "BANKBARODA.NS", "name": "Bank of Baroda"},
                {"symbol": "ADANIPOWER.NS", "name": "Adani Power Ltd."},
                {"symbol": "ADANIGREEN.NS", "name": "Adani Green Energy Ltd."},
                {"symbol": "ABB.NS", "name": "ABB India Ltd."},
                {"symbol": "GODREJCP.NS", "name": "Godrej Consumer Products Ltd."},
                {"symbol": "HAVELLS.NS", "name": "Havells India Ltd."},
                {"symbol": "SHREECEM.NS", "name": "Shree Cement Ltd."},
                {"symbol": "TVSMOTOR.NS", "name": "TVS Motor Company Ltd."},
                {"symbol": "DABUR.NS", "name": "Dabur India Ltd."},
                {"symbol": "VEDL.NS", "name": "Vedanta Ltd."},
                {"symbol": "AMBUJACEM.NS", "name": "Ambuja Cements Ltd."},
                {"symbol": "INDIGO.NS", "name": "InterGlobe Aviation Ltd."},
                {"symbol": "NAUKRI.NS", "name": "Info Edge (India) Ltd."},
                {"symbol": "ICICIGI.NS", "name": "ICICI Lombard General Insurance Company Ltd."},
                {"symbol": "PNB.NS", "name": "Punjab National Bank"},
                {"symbol": "SBICARD.NS", "name": "SBI Cards and Payment Services Ltd."},
                {"symbol": "BOSCHLTD.NS", "name": "Bosch Ltd."},
                {"symbol": "LODHA.NS", "name": "Macrotech Developers Ltd."},
                {"symbol": "CANBK.NS", "name": "Canara Bank"},
                {"symbol": "IRCTC.NS", "name": "Indian Railway Catering and Tourism Corporation Ltd."},
                {"symbol": "MOTHERSON.NS", "name": "Samvardhana Motherson International Ltd."},
                {"symbol": "SRF.NS", "name": "SRF Ltd."},
                {"symbol": "MUTHOOTFIN.NS", "name": "Muthoot Finance Ltd."},
                {"symbol": "BERGEPAINT.NS", "name": "Berger Paints India Ltd."},
                {"symbol": "ICICIPRULI.NS", "name": "ICICI Prudential Life Insurance Company Ltd."},
                {"symbol": "MARICO.NS", "name": "Marico Ltd."},
                {"symbol": "PIIND.NS", "name": "PI Industries Ltd."},
                {"symbol": "TATAELXSI.NS", "name": "Tata Elxsi Ltd."},
                {"symbol": "POLYCAB.NS", "name": "Polycab India Ltd."},
                {"symbol": "ASTRAL.NS", "name": "Astral Ltd."},
                {"symbol": "ALKEM.NS", "name": "Alkem Laboratories Ltd."},
                {"symbol": "JSWENERGY.NS", "name": "JSW Energy Ltd."},
                {"symbol": "TORNTPHARM.NS", "name": "Torrent Pharmaceuticals Ltd."},
                {"symbol": "MANKIND.NS", "name": "Mankind Pharma Ltd."},

                # --- US Tech Giants ---
                {"symbol": "AAPL", "name": "Apple Inc."},
                {"symbol": "MSFT", "name": "Microsoft Corp."},
                {"symbol": "GOOGL", "name": "Alphabet Inc."},
                {"symbol": "AMZN", "name": "Amazon.com Inc."},
                {"symbol": "NVDA", "name": "NVIDIA Corp."},
                {"symbol": "TSLA", "name": "Tesla Inc."},
                {"symbol": "META", "name": "Meta Platforms"},
                {"symbol": "NFLX", "name": "Netflix Inc."},
            ]
            
            q = query.upper()
            for stock in common_stocks:
                if q in stock["symbol"] or q in stock["name"].upper():
                    results.append(stock)
            
            return results
        except Exception as e:
            print(f"Search error: {e}")
            return []
