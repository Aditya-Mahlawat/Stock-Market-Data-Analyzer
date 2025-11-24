from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .db import Base

class TradeSQL(Base):
    __tablename__ = "trades"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime)
    symbol = Column(String, index=True)
    trade_type = Column(String)
    price = Column(Float)
    quantity = Column(Integer)
    pnl = Column(Float, default=0.0)

class HoldingSQL(Base):
    __tablename__ = "holdings"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, unique=True, index=True)
    quantity = Column(Integer)

class PortfolioSnapshotSQL(Base):
    __tablename__ = "portfolio_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, default=None)
    cash = Column(Float)
    total_value = Column(Float)
