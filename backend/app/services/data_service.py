import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Optional
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
