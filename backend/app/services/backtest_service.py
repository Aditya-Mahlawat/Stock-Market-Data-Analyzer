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
        
        std_dev = df['Strategy_Return'].std()
        if std_dev == 0 or np.isnan(std_dev):
            sharpe_ratio = 0.0
        else:
            sharpe_ratio = df['Strategy_Return'].mean() / std_dev * np.sqrt(252)
        
        # Max Drawdown
        cumulative_returns = df['Cumulative_Strategy_Return']
        peak = cumulative_returns.cummax()
        drawdown = (cumulative_returns - peak) / peak
        max_drawdown = drawdown.min()
        
        # Handle NaN/Inf for JSON serialization
        def clean_float(val):
            if np.isnan(val) or np.isinf(val):
                return 0.0
            return float(val)

        return {
            "initial_capital": initial_capital,
            "final_value": clean_float(initial_capital * (1 + total_return)),
            "total_return": clean_float(total_return),
            "annualized_return": clean_float(annualized_return),
            "sharpe_ratio": clean_float(sharpe_ratio),
            "max_drawdown": clean_float(max_drawdown),
            "equity_curve": {k.strftime('%Y-%m-%d'): clean_float(v) for k, v in cumulative_returns.to_dict().items()} 
        }
