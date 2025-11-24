import pandas as pd
import numpy as np
from typing import List, Dict
from ..models.schemas import OHLCV
from .indicator_service import IndicatorService

class BacktestService:
    @staticmethod
    def run_sma_cross_backtest(data: List[OHLCV], initial_capital: float = 10000.0, short_window: int = 50, long_window: int = 200) -> Dict:
        if not data:
            return {"error": "No data provided"}
            
        df = IndicatorService.to_dataframe(data)
        if len(df) < long_window:
            return {"error": "Not enough data for backtest"}

        # Calculate Indicators
        df['SMA_Short'] = df['close'].rolling(window=short_window).mean()
        df['SMA_Long'] = df['close'].rolling(window=long_window).mean()
        
        # Generate Signals
        df['Signal'] = 0
        df.loc[df['SMA_Short'] > df['SMA_Long'], 'Signal'] = 1 # Long
        df.loc[df['SMA_Short'] < df['SMA_Long'], 'Signal'] = 0 # Cash (Long-only)
        
        # Calculate Returns
        df['Market_Return'] = df['close'].pct_change()
        df['Strategy_Return'] = df['Market_Return'] * df['Signal'].shift(1)
        
        # Cumulative Returns
        df['Cumulative_Market_Return'] = (1 + df['Market_Return']).cumprod()
        df['Cumulative_Strategy_Return'] = (1 + df['Strategy_Return']).cumprod()
        
        # Metrics
        total_return = df['Cumulative_Strategy_Return'].iloc[-1] - 1
        annualized_return = (1 + total_return) ** (252 / len(df)) - 1
        sharpe_ratio = df['Strategy_Return'].mean() / df['Strategy_Return'].std() * np.sqrt(252)
        
        # Max Drawdown
        cumulative_returns = df['Cumulative_Strategy_Return']
        peak = cumulative_returns.cummax()
        drawdown = (cumulative_returns - peak) / peak
        max_drawdown = drawdown.min()
        
        return {
            "initial_capital": initial_capital,
            "final_value": initial_capital * (1 + total_return),
            "total_return": total_return,
            "annualized_return": annualized_return,
            "sharpe_ratio": sharpe_ratio,
            "max_drawdown": max_drawdown,
            "equity_curve": cumulative_returns.to_dict() # Date -> Value
        }
