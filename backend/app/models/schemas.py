from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional, Dict

class OHLCV(BaseModel):
    date: datetime
    open: float
    high: float
    low: float
    close: float
    volume: int

class Signal(BaseModel):
    date: datetime
    symbol: str
    signal_type: str  # BUY or SELL
    price: float
    strategy: str

class Trade(BaseModel):
    id: Optional[int] = None
    date: datetime
    symbol: str
    trade_type: str  # BUY or SELL
    price: float
    quantity: int
    pnl: Optional[float] = 0.0

class Portfolio(BaseModel):
    cash: float
    holdings: Dict[str, int]  # Symbol -> Quantity
    total_value: float
