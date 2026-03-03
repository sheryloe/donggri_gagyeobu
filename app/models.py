from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class Asset(Base):
    """자산 테이블 (계좌, 카드, 현금 등)"""
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # 자산명 (예: 신한은행, KB카드)
    type = Column(String, nullable=False)  # 'bank', 'card', 'cash', 'investment'
    balance = Column(Float, default=0.0)  # 현재 잔액
    created_at = Column(DateTime, default=datetime.utcnow)

    # 관계 정의
    transactions = relationship("Transaction", back_populates="asset")
    fixed_expenses = relationship("FixedExpense", back_populates="asset")
    investments = relationship("Investment", back_populates="asset")


class Transaction(Base):
    """거래 내역 테이블"""
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    type = Column(String, nullable=False)  # 'income', 'expense', 'transfer'
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    category = Column(String)  # '식비', '교통', '통신' 등
    description = Column(Text)  # 내용 설명
    amount = Column(Float, nullable=False)  # 금액
    created_at = Column(DateTime, default=datetime.utcnow)

    # 관계
    asset = relationship("Asset", back_populates="transactions")


class FixedExpense(Base):
    """고정 지출 테이블 (할부, 구독료 등)"""
    __tablename__ = "fixed_expenses"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, nullable=False)  # 카테고리
    description = Column(String, nullable=False)  # 내용
    amount = Column(Float, nullable=False)  # 월 납입액
    start_month = Column(String, nullable=False)  # 시작 월 (YYYY-MM)
    end_month = Column(String)  # 종료 월 (NULL이면 무기한)
    day_of_month = Column(Integer, default=1)  # 매월 결제일
    asset_id = Column(Integer, ForeignKey("assets.id"))  # 결제 자산
    is_active = Column(Boolean, default=True)  # 활성화 여부
    created_at = Column(DateTime, default=datetime.utcnow)

    # 관계
    asset = relationship("Asset", back_populates="fixed_expenses")


class Investment(Base):
    """투자 자산 테이블 (주식, 코인 등)"""
    __tablename__ = "investments"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    symbol = Column(String, nullable=False)  # 종목 코드 (AAPL, BTC-USD)
    name = Column(String)  # 종목명
    type = Column(String, nullable=False)  # 'stock', 'crypto', 'etf'
    quantity = Column(Float, nullable=False)  # 보유 수량
    average_buy_price = Column(Float, nullable=False)  # 평균 매수가
    current_price = Column(Float)  # 현재가 (배치 업데이트)
    roi = Column(Float)  # 수익률 (%)
    last_updated = Column(DateTime)  # 마지막 업데이트 시각
    created_at = Column(DateTime, default=datetime.utcnow)

    # 관계
    asset = relationship("Asset", back_populates="investments")
    transactions = relationship("InvestmentTransaction", back_populates="investment")


class InvestmentTransaction(Base):
    """투자 거래 내역 (매수/매도 기록)"""
    __tablename__ = "investment_transactions"

    id = Column(Integer, primary_key=True, index=True)
    investment_id = Column(Integer, ForeignKey("investments.id"), nullable=False)
    date = Column(Date, nullable=False)
    type = Column(String, nullable=False)  # 'buy', 'sell'
    quantity = Column(Float, nullable=False)  # 거래 수량
    price = Column(Float, nullable=False)  # 거래 단가
    fee = Column(Float, default=0.0)  # 수수료
    total_amount = Column(Float, nullable=False)  # 총 금액
    created_at = Column(DateTime, default=datetime.utcnow)

    # 관계
    investment = relationship("Investment", back_populates="transactions")
class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, nullable=False, unique=True)  # 카테고리당 1개
    amount = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False)   # expense / income / investment / fixed
    name = Column(String, nullable=False)
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
