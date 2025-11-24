from sqlalchemy.orm import Session
from ..models.sql_models import TradeSQL, HoldingSQL, PortfolioSnapshotSQL
from ..models.schemas import Trade, Portfolio
from datetime import datetime

class PortfolioService:
    def __init__(self, db: Session):
        self.db = db

    def get_portfolio(self) -> Portfolio:
        # For simplicity, we calculate from trades or keep a running balance.
        # Here we assume we have a snapshot or calculate it.
        # Let's assume we start with 100k cash if no snapshot exists.
        
        snapshot = self.db.query(PortfolioSnapshotSQL).order_by(PortfolioSnapshotSQL.date.desc()).first()
        holdings_sql = self.db.query(HoldingSQL).all()
        
        holdings_dict = {h.symbol: h.quantity for h in holdings_sql}
        
        if not snapshot:
            cash = 100000.0
            total_value = 100000.0 # Assuming no holdings value initially or we need to fetch prices
        else:
            cash = snapshot.cash
            total_value = snapshot.total_value # This might be stale
            
        return Portfolio(
            cash=cash,
            holdings=holdings_dict,
            total_value=total_value
        )

    def execute_trade(self, trade: Trade):
        # 1. Record Trade
        db_trade = TradeSQL(
            date=trade.date,
            symbol=trade.symbol,
            trade_type=trade.trade_type,
            price=trade.price,
            quantity=trade.quantity,
            pnl=trade.pnl
        )
        self.db.add(db_trade)
        
        # 2. Update Holdings
        holding = self.db.query(HoldingSQL).filter(HoldingSQL.symbol == trade.symbol).first()
        if not holding:
            holding = HoldingSQL(symbol=trade.symbol, quantity=0)
            self.db.add(holding)
        
        if trade.trade_type == "BUY":
            holding.quantity += trade.quantity
            # Update Cash (decrease)
            # We need to track cash somewhere persistent. 
            # For now, let's assume we update the latest snapshot or create a new one.
        elif trade.trade_type == "SELL":
            holding.quantity -= trade.quantity
            # Update Cash (increase)
            
        self.db.commit()
        self.db.refresh(db_trade)
        return db_trade
