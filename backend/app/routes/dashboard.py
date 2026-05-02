"""
Dashboard routes: today's summary, insights, onboarding
"""
from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import Any

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app import db
from app.models import DailySummary, User, WorkoutSession

dashboard_bp = Blueprint("dashboard", __name__)


def _get_or_create_today(user_id: int) -> DailySummary:
    today = date.today()
    summary = DailySummary.query.filter_by(user_id=user_id, date=today).first()
    if not summary:
        summary = DailySummary(user_id=user_id, date=today)
        db.session.add(summary)
        db.session.commit()
    return summary


def _compute_insight(
    user: User,
    summary: DailySummary,
    yesterday: DailySummary | None,
) -> dict[str, str]:
    """Rule-based insight / coach message."""
    hour = datetime.now().hour
    readiness = summary.readiness_score or 50

    if summary.sleep_hours >= 8 and readiness >= 70:
        if user.goal == "Build strength":
            return {
                "emoji": "💪",
                "title": "Great sleep! Prime time to lift.",
                "body": "Your body is recovered and ready. Perfect day for a strength session.",
                "suggested_workout": "Strength",
            }
        elif user.goal == "Run farther":
            return {
                "emoji": "🏃",
                "title": "Well rested — let's run!",
                "body": "High readiness detected. Great time for a longer cardio session.",
                "suggested_workout": "Run",
            }
        else:
            return {
                "emoji": "⚡",
                "title": "You're energized today!",
                "body": "Sleep was solid. Your body is primed — make today count.",
                "suggested_workout": "HIIT",
            }

    if summary.sleep_hours < 6 or readiness < 40:
        return {
            "emoji": "🌿",
            "title": "Low energy? No stress.",
            "body": "Rest days matter too. Even a 15-min walk can lift your mood.",
            "suggested_workout": "Walk",
        }

    if yesterday and yesterday.steps < 3000:
        return {
            "emoji": "👣",
            "title": "Yesterday was quiet — that's okay.",
            "body": "Small steps today will break the streak. Aim for 20 minutes of movement.",
            "suggested_workout": "Walk",
        }

    if hour < 10:
        return {
            "emoji": "🌅",
            "title": "Morning mover!",
            "body": "Starting early sets the tone. A morning session boosts focus all day.",
            "suggested_workout": "Yoga",
        }

    if 10 <= hour < 14:
        return {
            "emoji": "🔥",
            "title": "Mid-day energy window.",
            "body": "Body temperature is peaking — great time for an intense session.",
            "suggested_workout": "HIIT",
        }

    return {
        "emoji": "🎯",
        "title": "Stay consistent.",
        "body": "Every session counts. Even 20 minutes moves the needle.",
        "suggested_workout": "Walk",
    }


def _compute_goal_pct(summary: DailySummary, user: User) -> float:
    """Fused daily goal percentage (0-100)."""
    step_pct = min(100, (summary.steps / max(user.daily_step_goal, 1)) * 100)
    min_pct = min(100, (summary.active_minutes / max(user.daily_active_min_goal, 1)) * 100)
    # Weight: steps 40%, active min 40%, calories 20% (estimate ~300 cal target)
    cal_pct = min(100, (summary.calories_burned / 300) * 100)
    return round(step_pct * 0.4 + min_pct * 0.4 + cal_pct * 0.2, 1)


@dashboard_bp.get("/today")
@jwt_required()
def today():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    summary = _get_or_create_today(user_id)

    # Recompute readiness
    summary.readiness_score = summary.compute_readiness()
    db.session.commit()

    # Yesterday
    yesterday_date = date.today() - timedelta(days=1)
    yesterday = DailySummary.query.filter_by(user_id=user_id, date=yesterday_date).first()

    # Recent sessions today
    today_dt_start = datetime.combine(date.today(), datetime.min.time())
    sessions_today = (
        WorkoutSession.query
        .filter(WorkoutSession.user_id == user_id)
        .filter(WorkoutSession.started_at >= today_dt_start)
        .filter(WorkoutSession.status == "completed")
        .all()
    )

    goal_pct = _compute_goal_pct(summary, user)
    insight = _compute_insight(user, summary, yesterday)

    # Streak
    streak = _compute_streak(user_id)

    return jsonify({
        "summary": summary.to_dict(),
        "goal_pct": goal_pct,
        "readiness_score": summary.readiness_score,
        "insight": insight,
        "streak": streak,
        "sessions_today": [s.to_dict(include_exercises=False) for s in sessions_today],
        "user_goals": {
            "daily_step_goal": user.daily_step_goal,
            "daily_active_min_goal": user.daily_active_min_goal,
        },
    })


def _compute_streak(user_id: int) -> int:
    """Count consecutive days with goal_met=True ending today or yesterday."""
    streak = 0
    check_date = date.today()
    while True:
        s = DailySummary.query.filter_by(user_id=user_id, date=check_date).first()
        if s and s.goal_met:
            streak += 1
            check_date -= timedelta(days=1)
        else:
            break
        if streak > 365:
            break
    return streak


@dashboard_bp.patch("/today")
@jwt_required()
def update_today():
    """Manually update today's summary (steps, sleep, etc.)."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data: dict[str, Any] = request.get_json(silent=True) or {}
    summary = _get_or_create_today(user_id)

    allowed_fields = ["steps", "active_minutes", "calories_burned", "sleep_hours", "sleep_quality", "distance_km"]
    for field in allowed_fields:
        if field in data:
            setattr(summary, field, data[field])

    # Recompute derived
    summary.readiness_score = summary.compute_readiness()
    goal_pct = _compute_goal_pct(summary, user)
    summary.goal_met = goal_pct >= 80

    db.session.commit()
    return jsonify({"summary": summary.to_dict(), "goal_pct": goal_pct})


@dashboard_bp.post("/onboarding")
@jwt_required()
def complete_onboarding():
    """Save onboarding profile data and set initial goals."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data: dict[str, Any] = request.get_json(silent=True) or {}

    GOAL_PRESETS: dict[str, dict[str, int]] = {
        "Build strength": {"daily_step_goal": 7000, "daily_active_min_goal": 30},
        "Lose fat":       {"daily_step_goal": 10000, "daily_active_min_goal": 45},
        "Run farther":    {"daily_step_goal": 8000, "daily_active_min_goal": 40},
        "Daily energy":   {"daily_step_goal": 8000, "daily_active_min_goal": 30},
    }

    user.name = data.get("name", user.name)
    user.age = data.get("age", user.age)
    user.gender = data.get("gender", user.gender)
    user.height_cm = data.get("height_cm", user.height_cm)
    user.weight_kg = data.get("weight_kg", user.weight_kg)

    goal = data.get("goal", user.goal)
    user.goal = goal

    preset = GOAL_PRESETS.get(goal, GOAL_PRESETS["Daily energy"])
    user.daily_step_goal = preset["daily_step_goal"]
    user.daily_active_min_goal = preset["daily_active_min_goal"]
    user.weekly_active_min_goal = preset["daily_active_min_goal"] * 5

    user.onboarding_complete = True
    db.session.commit()

    return jsonify({
        "message": "Profile saved! Let's go 🚀",
        "user": user.to_dict(),
    })
