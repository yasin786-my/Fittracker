"""
Progress / History routes: calendar, trends, streaks
"""
from __future__ import annotations

from datetime import date, timedelta
from typing import Any

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy import func

from app import db
from app.models import DailySummary, WorkoutSession

progress_bp = Blueprint("progress", __name__)


@progress_bp.get("/calendar")
@jwt_required()
def calendar():
    """Return calendar data for a given month."""
    user_id = int(get_jwt_identity())
    year = request.args.get("year", date.today().year, type=int)
    month = request.args.get("month", date.today().month, type=int)

    month = max(1, min(12, month))

    # Date range for the month
    from calendar import monthrange
    _, days_in_month = monthrange(year, month)
    start = date(year, month, 1)
    end = date(year, month, days_in_month)

    summaries = (
        DailySummary.query
        .filter(
            DailySummary.user_id == user_id,
            DailySummary.date >= start,
            DailySummary.date <= end,
        )
        .all()
    )

    # Sessions for sessions count per day
    sessions = (
        WorkoutSession.query
        .filter(
            WorkoutSession.user_id == user_id,
            WorkoutSession.status == "completed",
            func.date(WorkoutSession.started_at) >= start,
            func.date(WorkoutSession.started_at) <= end,
        )
        .all()
    )

    sessions_by_date: dict[str, int] = {}
    for s in sessions:
        d = s.started_at.date().isoformat()
        sessions_by_date[d] = sessions_by_date.get(d, 0) + 1

    summaries_map: dict[str, dict[str, Any]] = {s.date.isoformat(): s.to_dict() for s in summaries}

    calendar_days = []
    for day_num in range(1, days_in_month + 1):
        d = date(year, month, day_num)
        iso = d.isoformat()
        summary = summaries_map.get(iso)

        if summary:
            if summary["goal_met"]:
                status = "met"
            elif summary["steps"] > 0 or summary["active_minutes"] > 0:
                status = "partial"
            else:
                status = "missed"
        elif d > date.today():
            status = "future"
        else:
            status = "missed"

        calendar_days.append({
            "date": iso,
            "day": day_num,
            "status": status,
            "summary": summary,
            "sessions_count": sessions_by_date.get(iso, 0),
        })

    return jsonify({
        "year": year,
        "month": month,
        "days": calendar_days,
    })


@progress_bp.get("/trends")
@jwt_required()
def trends():
    """Last 30 days of daily metrics for charts."""
    user_id = int(get_jwt_identity())
    days = request.args.get("days", 30, type=int)
    days = max(7, min(90, days))

    end = date.today()
    start = end - timedelta(days=days - 1)

    summaries = (
        DailySummary.query
        .filter(
            DailySummary.user_id == user_id,
            DailySummary.date >= start,
            DailySummary.date <= end,
        )
        .order_by(DailySummary.date.asc())
        .all()
    )

    summaries_map = {s.date: s for s in summaries}

    step_data = []
    cal_data = []
    active_min_data = []
    sleep_data = []

    for i in range(days):
        d = start + timedelta(days=i)
        s = summaries_map.get(d)
        iso = d.isoformat()
        step_data.append({"date": iso, "value": s.steps if s else 0})
        cal_data.append({"date": iso, "value": s.calories_burned if s else 0})
        active_min_data.append({"date": iso, "value": s.active_minutes if s else 0})
        sleep_data.append({"date": iso, "value": s.sleep_hours if s else 0})

    return jsonify({
        "steps": step_data,
        "calories": cal_data,
        "active_minutes": active_min_data,
        "sleep": sleep_data,
    })


@progress_bp.get("/strength-prs")
@jwt_required()
def strength_prs():
    """Personal records per exercise (max weight lifted)."""
    user_id = int(get_jwt_identity())

    sessions = (
        WorkoutSession.query
        .filter_by(user_id=user_id, workout_type="Strength", status="completed")
        .all()
    )

    prs: dict[str, dict[str, Any]] = {}
    for session in sessions:
        for exercise in session.exercises:
            sets = exercise.sets
            for s in sets:
                weight = s.get("weight_kg", 0) or 0
                if weight > 0:
                    existing = prs.get(exercise.name, {})
                    if weight > existing.get("max_weight", 0):
                        prs[exercise.name] = {
                            "name": exercise.name,
                            "max_weight": weight,
                            "reps": s.get("reps", 0),
                            "date": session.started_at.date().isoformat(),
                            "session_id": session.id,
                        }

    return jsonify({"prs": list(prs.values())})


@progress_bp.get("/streak")
@jwt_required()
def streak():
    user_id = int(get_jwt_identity())

    current_streak = 0
    longest_streak = 0
    temp_streak = 0

    summaries = (
        DailySummary.query
        .filter_by(user_id=user_id)
        .order_by(DailySummary.date.desc())
        .all()
    )

    # Current streak
    check_date = date.today()
    for s in summaries:
        if s.date == check_date and s.goal_met:
            current_streak += 1
            check_date -= timedelta(days=1)
        elif s.date < check_date:
            break

    # Longest streak
    sorted_summaries = sorted(summaries, key=lambda x: x.date)
    prev_date = None
    for s in sorted_summaries:
        if s.goal_met:
            if prev_date and (s.date - prev_date).days == 1:
                temp_streak += 1
            else:
                temp_streak = 1
            longest_streak = max(longest_streak, temp_streak)
            prev_date = s.date
        else:
            temp_streak = 0
            prev_date = None

    return jsonify({
        "current_streak": current_streak,
        "longest_streak": longest_streak,
    })


@progress_bp.get("/day/<string:day_str>")
@jwt_required()
def day_detail(day_str: str):
    """Detailed view for a specific day."""
    user_id = int(get_jwt_identity())
    try:
        target_date = date.fromisoformat(day_str)
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 422

    summary = DailySummary.query.filter_by(user_id=user_id, date=target_date).first()

    sessions = (
        WorkoutSession.query
        .filter(
            WorkoutSession.user_id == user_id,
            WorkoutSession.status == "completed",
            func.date(WorkoutSession.started_at) == target_date,
        )
        .order_by(WorkoutSession.started_at.asc())
        .all()
    )

    # Compare to same weekday last week
    last_week = target_date - timedelta(days=7)
    last_week_summary = DailySummary.query.filter_by(user_id=user_id, date=last_week).first()

    return jsonify({
        "date": day_str,
        "summary": summary.to_dict() if summary else None,
        "sessions": [s.to_dict(include_exercises=True) for s in sessions],
        "comparison": {
            "last_week_date": last_week.isoformat(),
            "last_week_summary": last_week_summary.to_dict() if last_week_summary else None,
        },
    })
