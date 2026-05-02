"""
FitTracker Flask Application Factory
"""
from __future__ import annotations

from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


def create_app(config_class=None) -> Flask:
    """Application factory."""
    app = Flask(__name__)

    # Config
    if config_class is None:
        from config import get_config
        config_class = get_config()
    app.config.from_object(config_class)

    # Extensions
    db.init_app(app)

    # Import models BEFORE migrate so Alembic can detect them
    with app.app_context():
        from app import models  # noqa: F401 — registers all models with SQLAlchemy

    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(
        app,
        resources={r"/api/*": {"origins": app.config.get("CORS_ORIGINS", ["*"])}},
        supports_credentials=True,
    )

    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"error": "Token has expired", "code": "token_expired"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"error": "Invalid token", "code": "invalid_token"}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"error": "Authorization required", "code": "authorization_required"}), 401

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.workouts import workouts_bp
    from app.routes.progress import progress_bp
    from app.routes.profile import profile_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(workouts_bp, url_prefix="/api/workouts")
    app.register_blueprint(progress_bp, url_prefix="/api/progress")
    app.register_blueprint(profile_bp, url_prefix="/api/profile")

    # Health check
    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "app": "FitTracker API v1"})

    return app
