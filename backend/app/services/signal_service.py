from typing import List
import pandas as pd
from ..models.schemas import OHLCV, Signal
from .indicator_service import IndicatorService

class SignalService:
    @staticmethod
    def generate_sma_cross_signals(data: List[OHLCV], short_window: int = 50, long_window: int = 200) -> List[Signal]:
        if not data:
            return []
            
        df = IndicatorService.to_dataframe(data)
        if len(df) < long_window:
            return []

        df['SMA_Short'] = df['close'].rolling(window=short_window).mean()
        df['SMA_Long'] = df['close'].rolling(window=long_window).mean()
        
        signals = []
        # Simple logic: Crossover
        # We need to iterate to find crossovers. Vectorized approach is better for backtesting, 
        # but for signal generation list, we can iterate or use shift.
        
        df['Signal'] = 0
        df.loc[df['SMA_Short'] > df['SMA_Long'], 'Signal'] = 1 # Bullish
        df.loc[df['SMA_Short'] < df['SMA_Long'], 'Signal'] = -1 # Bearish
        
        # Crossover happens when Signal changes
        df['Position'] = df['Signal'].diff()
        
        # Position = 2 ( -1 to 1) -> Buy
        # Position = -2 ( 1 to -1) -> Sell
        
        for date, row in df.iterrows():
            if row['Position'] == 2:
                signals.append(Signal(
                    date=date,
                    symbol="UNKNOWN", # Need to pass symbol or have it in OHLCV
                    signal_type="BUY",
                    price=row['close'],
                    strategy="SMA_CROSS"
                ))
            elif row['Position'] == -2:
                signals.append(Signal(
                    date=date,
                    symbol="UNKNOWN",
                    signal_type="SELL",
                    price=row['close'],
                    strategy="SMA_CROSS"
                ))
                
        return signals
