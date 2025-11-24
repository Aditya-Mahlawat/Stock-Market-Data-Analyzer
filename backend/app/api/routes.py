from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from ..models.db import get_db
from ..models.schemas import OHLCV, Signal, Trade, Portfolio
from ..services.data_service import DataService
from ..services.indicator_service import IndicatorService
from ..services.signal_service import SignalService
from ..services.backtest_service import BacktestService
from ..services.portfolio_service import PortfolioService

router = APIRouter()

@router.get("/data/{symbol}", response_model=List[OHLCV])
def get_data(symbol: str, period: str = "1y"):
    data = DataService.fetch_history(symbol, period=period)
    if not data:
        raise HTTPException(status_code=404, detail="Data not found")
    return data

@router.get("/search")
def search_symbols(query: str):
    return DataService.search_symbols(query)

@router.post("/backtest")
def run_backtest(symbol: str, initial_capital: float = 10000.0):
    data = DataService.fetch_history(symbol, period="2y") # Fetch enough data
    if not data:
        raise HTTPException(status_code=404, detail="Data not found")
    
    result = BacktestService.run_sma_cross_backtest(data, initial_capital=initial_capital)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.get("/portfolio", response_model=Portfolio)
def get_portfolio(db: Session = Depends(get_db)):
    service = PortfolioService(db)
    return service.get_portfolio()

@router.get("/alerts")
def get_alerts():
    # Placeholder for alerts
    return {"alerts": []}
