"""
Profile routes: view/edit user, goal settings
"""
from __future__ import annotations

from typing import Any

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app import db
from app.models import User

profile_bp = Blueprint("profile", __name__)

VALID_GOALS = {"Build strength", "Lose fat", "Run farther", "Daily energy"}
VALID_GENDERS = {"male", "female", "non-binary", "prefer-not-to-say"}
VALID_UNITS = {"metric", "imperial"}


@profile_bp.get("/")
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user.to_dict()})


@profile_bp.patch("/")
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data: dict[str, Any] = request.get_json(silent=True) or {}
    errors: list[str] = []

    if "name" in data:
        name = str(data["name"]).strip()
        if len(name) < 2:
            errors.append("Name must be at least 2 characters.")
        else:
            user.name = name

    if "age" in data:
        age = data["age"]
        if not isinstance(age, int) or not (10 <= age <= 120):
            errors.append("Age must be between 10 and 120.")
        else:
            user.age = age

    if "gender" in data:
        gender = data["gender"]
        if gender not in VALID_GENDERS:
            errors.append(f"Gender must be one of: {', '.join(VALID_GENDERS)}")
        else:
            user.gender = gender

    if "height_cm" in data:
        h = data["height_cm"]
        if not isinstance(h, (int, float)) or not (50 <= h <= 300):
            errors.append("Height must be between 50 and 300 cm.")
        else:
            user.height_cm = float(h)

    if "weight_kg" in data:
        w = data["weight_kg"]
        if not isinstance(w, (int, float)) or not (20 <= w <= 500):
            errors.append("Weight must be between 20 and 500 kg.")
        else:
            user.weight_kg = float(w)

    if "goal" in data:
        goal = data["goal"]
        if goal not in VALID_GOALS:
            errors.append(f"Goal must be one of: {', '.join(VALID_GOALS)}")
        else:
            user.goal = goal

    if "units_system" in data:
        units = data["units_system"]
        if units not in VALID_UNITS:
            errors.append("Units must be 'metric' or 'imperial'.")
        else:
            user.units_system = units

    if "daily_step_goal" in data:
        sg = data["daily_step_goal"]
        if not isinstance(sg, int) or not (1000 <= sg <= 50000):
            errors.append("Step goal must be between 1000 and 50000.")
        else:
            user.daily_step_goal = sg

    if "daily_active_min_goal" in data:
        amg = data["daily_active_min_goal"]
        if not isinstance(amg, int) or not (5 <= amg <= 240):
            errors.append("Active minutes goal must be between 5 and 240.")
        else:
            user.daily_active_min_goal = amg

    if errors:
        return jsonify({"errors": errors}), 422

    db.session.commit()
    return jsonify({"user": user.to_dict()})


@profile_bp.post("/change-password")
@jwt_required()
def change_password():
    import bcrypt
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data: dict[str, Any] = request.get_json(silent=True) or {}
    current = data.get("current_password", "")
    new_pw = data.get("new_password", "")

    if not bcrypt.checkpw(current.encode("utf-8"), user.password_hash.encode("utf-8")):
        return jsonify({"errors": ["Current password is incorrect."]}), 401

    if len(new_pw) < 8:
        return jsonify({"errors": ["New password must be at least 8 characters."]}), 422

    user.password_hash = bcrypt.hashpw(new_pw.encode("utf-8"), bcrypt.gensalt(12)).decode("utf-8")
    db.session.commit()
    return jsonify({"message": "Password updated successfully."})
