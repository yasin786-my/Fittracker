"""
FitTracker SQLAlchemy Models
"""
from __future__ import annotations

import json
from datetime import datetime, date
from typing import Optional, Any

from app import db


class User(db.Model):
    __tablename__ = "users"

    id: int = db.Column(db.Integer, primary_key=True)
    email: str = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash: str = db.Column(db.String(255), nullable=False)

    # Profile
    name: Optional[str] = db.Column(db.String(100), nullable=True)
    age: Optional[int] = db.Column(db.Integer, nullable=True)
    gender: Optional[str] = db.Column(db.String(20), nullable=True)
    height_cm: Optional[float] = db.Column(db.Float, nullable=True)
    weight_kg: Optional[float] = db.Column(db.Float, nullable=True)
    goal: Optional[str] = db.Column(db.String(50), nullable=True)

    # Settings
    daily_step_goal: int = db.Column(db.Integer, default=8000)
    daily_active_min_goal: int = db.Column(db.Integer, default=30)
    weekly_active_min_goal: int = db.Column(db.Integer, default=150)
    units_system: str = db.Column(db.String(10), default="metric")  # metric | imperial
    onboarding_complete: bool = db.Column(db.Boolean, default=False)

    created_at: datetime = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at: datetime = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    daily_summaries = db.relationship(
        "DailySummary", backref="user", lazy="dynamic", cascade="all, delete-orphan"
    )
    workout_sessions = db.relationship(
        "WorkoutSession", backref="user", lazy="dynamic", cascade="all, delete-orphan"
    )

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "age": self.age,
            "gender": self.gender,
            "height_cm": self.height_cm,
            "weight_kg": self.weight_kg,
            "goal": self.goal,
            "daily_step_goal": self.daily_step_goal,
            "daily_active_min_goal": self.daily_active_min_goal,
            "weekly_active_min_goal": self.weekly_active_min_goal,
            "units_system": self.units_system,
            "onboarding_complete": self.onboarding_complete,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self) -> str:
        return f"<User {self.email}>"


class DailySummary(db.Model):
    __tablename__ = "daily_summaries"
    __table_args__ = (
        db.UniqueConstraint("user_id", "date", name="uq_user_date"),
    )

    id: int = db.Column(db.Integer, primary_key=True)
    user_id: int = db.Column(
        db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    date: date = db.Column(db.Date, nullable=False, index=True)

    # Activity metrics
    steps: int = db.Column(db.Integer, default=0)
    active_minutes: int = db.Column(db.Integer, default=0)
    calories_burned: int = db.Column(db.Integer, default=0)
    distance_km: float = db.Column(db.Float, default=0.0)

    # Sleep
    sleep_hours: float = db.Column(db.Float, default=0.0)
    sleep_quality: Optional[int] = db.Column(db.Integer, nullable=True)  # 1-5

    # Computed
    readiness_score: Optional[int] = db.Column(db.Integer, nullable=True)  # 0-100
    goal_met: bool = db.Column(db.Boolean, default=False)

    created_at: datetime = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at: datetime = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    def compute_readiness(self) -> int:
        """Rule-based readiness score (0-100)."""
        score = 50  # baseline

        # Sleep bonus/penalty
        if self.sleep_hours >= 8:
            score += 25
        elif self.sleep_hours >= 7:
            score += 15
        elif self.sleep_hours >= 6:
            score += 5
        elif self.sleep_hours < 5:
            score -= 20
        else:
            score -= 10

        # Activity bonus (previous activity — estimated from steps)
        if self.steps >= 10000:
            score += 15
        elif self.steps >= 7000:
            score += 10
        elif self.steps >= 4000:
            score += 5
        elif self.steps < 2000:
            score -= 10

        return max(0, min(100, score))

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "date": self.date.isoformat() if self.date else None,
            "steps": self.steps,
            "active_minutes": self.active_minutes,
            "calories_burned": self.calories_burned,
            "distance_km": self.distance_km,
            "sleep_hours": self.sleep_hours,
            "sleep_quality": self.sleep_quality,
            "readiness_score": self.readiness_score,
            "goal_met": self.goal_met,
        }

    def __repr__(self) -> str:
        return f"<DailySummary user={self.user_id} date={self.date}>"


class WorkoutSession(db.Model):
    __tablename__ = "workout_sessions"

    id: int = db.Column(db.Integer, primary_key=True)
    user_id: int = db.Column(
        db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    workout_type: str = db.Column(db.String(50), nullable=False)  # Walk/Run/Strength/Yoga/HIIT/Custom
    started_at: datetime = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    ended_at: Optional[datetime] = db.Column(db.DateTime, nullable=True)
    duration_min: Optional[int] = db.Column(db.Integer, nullable=True)

    # Metrics
    steps: int = db.Column(db.Integer, default=0)
    distance_km: float = db.Column(db.Float, default=0.0)
    calories_burned: int = db.Column(db.Integer, default=0)
    avg_heart_rate: Optional[int] = db.Column(db.Integer, nullable=True)

    # Notes & extras
    notes: Optional[str] = db.Column(db.Text, nullable=True)
    extra_data: Optional[str] = db.Column(db.Text, nullable=True)  # JSON blob

    status: str = db.Column(db.String(20), default="active")  # active | completed | cancelled

    created_at: datetime = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    exercises = db.relationship(
        "Exercise", backref="session", lazy="dynamic", cascade="all, delete-orphan"
    )

    @property
    def extra(self) -> dict[str, Any]:
        if self.extra_data:
            try:
                return json.loads(self.extra_data)
            except (json.JSONDecodeError, TypeError):
                return {}
        return {}

    @extra.setter
    def extra(self, value: dict[str, Any]) -> None:
        self.extra_data = json.dumps(value) if value else None

    def to_dict(self, include_exercises: bool = True) -> dict[str, Any]:
        data: dict[str, Any] = {
            "id": self.id,
            "user_id": self.user_id,
            "workout_type": self.workout_type,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "ended_at": self.ended_at.isoformat() if self.ended_at else None,
            "duration_min": self.duration_min,
            "steps": self.steps,
            "distance_km": self.distance_km,
            "calories_burned": self.calories_burned,
            "avg_heart_rate": self.avg_heart_rate,
            "notes": self.notes,
            "status": self.status,
            "extra": self.extra,
        }
        if include_exercises:
            data["exercises"] = [e.to_dict() for e in self.exercises]
        return data

    def __repr__(self) -> str:
        return f"<WorkoutSession id={self.id} type={self.workout_type}>"


class Exercise(db.Model):
    __tablename__ = "exercises"

    id: int = db.Column(db.Integer, primary_key=True)
    session_id: int = db.Column(
        db.Integer, db.ForeignKey("workout_sessions.id", ondelete="CASCADE"), nullable=False
    )

    name: str = db.Column(db.String(100), nullable=False)
    order_index: int = db.Column(db.Integer, default=0)
    sets_data: Optional[str] = db.Column(db.Text, nullable=True)  # JSON: [{reps, weight_kg, completed}]
    notes: Optional[str] = db.Column(db.String(255), nullable=True)

    created_at: datetime = db.Column(db.DateTime, default=datetime.utcnow)

    @property
    def sets(self) -> list[dict[str, Any]]:
        if self.sets_data:
            try:
                return json.loads(self.sets_data)
            except (json.JSONDecodeError, TypeError):
                return []
        return []

    @sets.setter
    def sets(self, value: list[dict[str, Any]]) -> None:
        self.sets_data = json.dumps(value) if value else None

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "session_id": self.session_id,
            "name": self.name,
            "order_index": self.order_index,
            "sets": self.sets,
            "notes": self.notes,
        }

    def __repr__(self) -> str:
        return f"<Exercise name={self.name} session={self.session_id}>"
