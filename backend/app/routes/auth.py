"""
Authentication routes: register, login, refresh, logout
"""
from __future__ import annotations

import re
from typing import Any

import bcrypt
from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    jwt_required,
)

from app import db
from app.models import User

auth_bp = Blueprint("auth", __name__)

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(12)).decode("utf-8")


def _check_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def _validate_register(data: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    email = data.get("email", "").strip()
    password = data.get("password", "")
    name = data.get("name", "").strip()

    if not email or not EMAIL_RE.match(email):
        errors.append("Valid email is required.")
    if not password or len(password) < 8:
        errors.append("Password must be at least 8 characters.")
    if not name or len(name) < 2:
        errors.append("Name must be at least 2 characters.")
    return errors


@auth_bp.post("/register")
def register():
    data: dict[str, Any] = request.get_json(silent=True) or {}
    errors = _validate_register(data)
    if errors:
        return jsonify({"errors": errors}), 422

    email = data["email"].strip().lower()
    if User.query.filter_by(email=email).first():
        return jsonify({"errors": ["An account with this email already exists."]}), 409

    user = User(
        email=email,
        password_hash=_hash_password(data["password"]),
        name=data.get("name", "").strip(),
    )
    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        "message": "Account created successfully.",
        "user": user.to_dict(),
        "access_token": access_token,
        "refresh_token": refresh_token,
    }), 201


@auth_bp.post("/login")
def login():
    data: dict[str, Any] = request.get_json(silent=True) or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"errors": ["Email and password are required."]}), 422

    user = User.query.filter_by(email=email).first()
    if not user or not _check_password(password, user.password_hash):
        return jsonify({"errors": ["Invalid email or password."]}), 401

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        "message": "Login successful.",
        "user": user.to_dict(),
        "access_token": access_token,
        "refresh_token": refresh_token,
    })


@auth_bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "User not found."}), 404

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "access_token": access_token,
        "user": user.to_dict(),
    })


@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "User not found."}), 404
    return jsonify({"user": user.to_dict()})
