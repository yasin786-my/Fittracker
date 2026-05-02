"""
FitTracker — Flask entry point
"""
from app import create_app, db
from app.models import User, DailySummary, WorkoutSession, Exercise  # noqa: F401

app = create_app()


@app.shell_context_processor
def make_shell_context():
    return {
        "db": db,
        "User": User,
        "DailySummary": DailySummary,
        "WorkoutSession": WorkoutSession,
        "Exercise": Exercise,
    }


if __name__ == "__main__":
    app.run(debug=True, port=5000)
