"""
Workout session routes: start, update, end, exercises
"""
from __future__ import annotations

from datetime import datetime
from typing import Any

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app import db
from app.models import DailySummary, Exercise, User, WorkoutSession

workouts_bp = Blueprint("workouts", __name__)

VALID_TYPES = {"Walk", "Run", "Strength", "Yoga", "HIIT", "Custom", "Cycling", "Swimming"}


def _calories_estimate(workout_type: str, duration_min: int, weight_kg: float) -> int:
    """Simple MET-based calorie estimate."""
    MET_MAP = {
        "Walk": 3.5,
        "Run": 8.0,
        "Cycling": 6.0,
        "Swimming": 7.0,
        "Strength": 4.5,
        "HIIT": 9.0,
        "Yoga": 2.5,
        "Custom": 4.0,
    }
    met = MET_MAP.get(workout_type, 4.0)
    weight = weight_kg or 70.0
    return int(met * weight * (duration_min / 60))


@workouts_bp.post("/start")
@jwt_required()
def start_session():
    user_id = int(get_jwt_identity())
    data: dict[str, Any] = request.get_json(silent=True) or {}

    workout_type = data.get("workout_type", "Custom")
    if workout_type not in VALID_TYPES:
        workout_type = "Custom"

    # Cancel any lingering active sessions
    old_active = (
        WorkoutSession.query
        .filter_by(user_id=user_id, status="active")
        .all()
    )
    for old in old_active:
        old.status = "cancelled"

    session = WorkoutSession(
        user_id=user_id,
        workout_type=workout_type,
        started_at=datetime.utcnow(),
        status="active",
    )
    db.session.add(session)
    db.session.commit()

    return jsonify({"session": session.to_dict()}), 201


@workouts_bp.patch("/<int:session_id>")
@jwt_required()
def update_session(session_id: int):
    user_id = int(get_jwt_identity())
    session = WorkoutSession.query.filter_by(id=session_id, user_id=user_id).first()
    if not session:
        return jsonify({"error": "Session not found"}), 404

    data: dict[str, Any] = request.get_json(silent=True) or {}
    updatable = ["steps", "distance_km", "calories_burned", "avg_heart_rate", "notes"]
    for field in updatable:
        if field in data:
            setattr(session, field, data[field])

    db.session.commit()
    return jsonify({"session": session.to_dict()})


@workouts_bp.post("/<int:session_id>/end")
@jwt_required()
def end_session(session_id: int):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    session = WorkoutSession.query.filter_by(id=session_id, user_id=user_id).first()
    if not session:
        return jsonify({"error": "Session not found"}), 404

    if session.status == "completed":
        return jsonify({"session": session.to_dict()})

    data: dict[str, Any] = request.get_json(silent=True) or {}

    session.ended_at = datetime.utcnow()
    session.status = "completed"
    session.notes = data.get("notes", session.notes)

    # Duration
    delta = session.ended_at - session.started_at
    session.duration_min = max(1, int(delta.total_seconds() / 60))

    # Update from final data
    for field in ["steps", "distance_km", "calories_burned"]:
        if field in data:
            setattr(session, field, data[field])

    # Auto-estimate calories if not provided
    if not session.calories_burned and user:
        session.calories_burned = _calories_estimate(
            session.workout_type, session.duration_min, user.weight_kg or 70.0
        )

    # Roll up into daily summary
    from datetime import date as date_cls
    today = date_cls.today()
    summary = DailySummary.query.filter_by(user_id=user_id, date=today).first()
    if not summary:
        summary = DailySummary(user_id=user_id, date=today)
        db.session.add(summary)

    summary.active_minutes = (summary.active_minutes or 0) + session.duration_min
    summary.steps = (summary.steps or 0) + (session.steps or 0)
    summary.calories_burned = (summary.calories_burned or 0) + (session.calories_burned or 0)
    summary.distance_km = (summary.distance_km or 0.0) + (session.distance_km or 0.0)
    summary.readiness_score = summary.compute_readiness()

    # Check goal
    from app.routes.dashboard import _compute_goal_pct
    goal_pct = _compute_goal_pct(summary, user)
    summary.goal_met = goal_pct >= 80

    db.session.commit()

    return jsonify({
        "session": session.to_dict(),
        "daily_summary": summary.to_dict(),
        "goal_pct": goal_pct,
    })


@workouts_bp.delete("/<int:session_id>")
@jwt_required()
def cancel_session(session_id: int):
    user_id = int(get_jwt_identity())
    session = WorkoutSession.query.filter_by(id=session_id, user_id=user_id).first()
    if not session:
        return jsonify({"error": "Session not found"}), 404

    session.status = "cancelled"
    db.session.commit()
    return jsonify({"message": "Session cancelled"})


@workouts_bp.post("/<int:session_id>/exercises")
@jwt_required()
def add_exercise(session_id: int):
    user_id = int(get_jwt_identity())
    session = WorkoutSession.query.filter_by(id=session_id, user_id=user_id).first()
    if not session:
        return jsonify({"error": "Session not found"}), 404

    data: dict[str, Any] = request.get_json(silent=True) or {}
    name = data.get("name", "").strip()
    if not name:
        return jsonify({"error": "Exercise name is required"}), 422

    order = data.get("order_index", 0)
    exercise = Exercise(
        session_id=session_id,
        name=name,
        order_index=order,
        notes=data.get("notes", ""),
    )
    exercise.sets = data.get("sets", [])
    db.session.add(exercise)
    db.session.commit()

    return jsonify({"exercise": exercise.to_dict()}), 201


@workouts_bp.patch("/<int:session_id>/exercises/<int:exercise_id>")
@jwt_required()
def update_exercise(session_id: int, exercise_id: int):
    user_id = int(get_jwt_identity())
    session = WorkoutSession.query.filter_by(id=session_id, user_id=user_id).first()
    if not session:
        return jsonify({"error": "Session not found"}), 404

    exercise = Exercise.query.filter_by(id=exercise_id, session_id=session_id).first()
    if not exercise:
        return jsonify({"error": "Exercise not found"}), 404

    data: dict[str, Any] = request.get_json(silent=True) or {}
    if "name" in data:
        exercise.name = data["name"]
    if "sets" in data:
        exercise.sets = data["sets"]
    if "notes" in data:
        exercise.notes = data["notes"]

    db.session.commit()
    return jsonify({"exercise": exercise.to_dict()})


@workouts_bp.delete("/<int:session_id>/exercises/<int:exercise_id>")
@jwt_required()
def delete_exercise(session_id: int, exercise_id: int):
    user_id = int(get_jwt_identity())
    session = WorkoutSession.query.filter_by(id=session_id, user_id=user_id).first()
    if not session:
        return jsonify({"error": "Session not found"}), 404

    exercise = Exercise.query.filter_by(id=exercise_id, session_id=session_id).first()
    if not exercise:
        return jsonify({"error": "Exercise not found"}), 404

    db.session.delete(exercise)
    db.session.commit()
    return jsonify({"message": "Exercise deleted"})


@workouts_bp.get("/")
@jwt_required()
def list_sessions():
    user_id = int(get_jwt_identity())
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    workout_type = request.args.get("type", None)

    query = WorkoutSession.query.filter_by(user_id=user_id, status="completed")
    if workout_type:
        query = query.filter_by(workout_type=workout_type)

    paginated = query.order_by(WorkoutSession.started_at.desc()).paginate(
        page=page, per_page=min(per_page, 50), error_out=False
    )

    return jsonify({
        "sessions": [s.to_dict(include_exercises=False) for s in paginated.items],
        "total": paginated.total,
        "pages": paginated.pages,
        "page": page,
    })


@workouts_bp.get("/<int:session_id>")
@jwt_required()
def get_session(session_id: int):
    user_id = int(get_jwt_identity())
    session = WorkoutSession.query.filter_by(id=session_id, user_id=user_id).first()
    if not session:
        return jsonify({"error": "Session not found"}), 404
    return jsonify({"session": session.to_dict(include_exercises=True)})
