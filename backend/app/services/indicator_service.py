import pandas as pd
from typing import List
from ..models.schemas import OHLCV

class IndicatorService:
    @staticmethod
    def to_dataframe(data: List[OHLCV]) -> pd.DataFrame:
        df = pd.DataFrame([d.dict() for d in data])
        if not df.empty:
            df.set_index('date', inplace=True)
            df.sort_index(inplace=True)
        return df

    @staticmethod
    def calculate_sma(data: List[OHLCV], window: int = 20) -> pd.Series:
        df = IndicatorService.to_dataframe(data)
        if df.empty:
            return pd.Series()
        return df['close'].rolling(window=window).mean()

    @staticmethod
    def calculate_rsi(data: List[OHLCV], window: int = 14) -> pd.Series:
        df = IndicatorService.to_dataframe(data)
        if df.empty:
            return pd.Series()
        
        delta = df['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()
        
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi
