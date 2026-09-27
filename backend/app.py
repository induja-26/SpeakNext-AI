from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)

DATABASE = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "database",
    "speaknext.db"
)


# =========================
# DATABASE CONNECTION
# =========================

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


# =========================
# INITIALIZE DATABASE
# =========================

def initialize_database():

    os.makedirs(
        os.path.dirname(DATABASE),
        exist_ok=True
    )

    conn = get_db_connection()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            activity TEXT NOT NULL,
            score INTEGER DEFAULT 0,
            completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    conn.commit()
    conn.close()


# Create database tables when server starts
initialize_database()


# =========================
# HOME
# =========================

@app.route("/")
def home():

    return jsonify({
        "status": "success",
        "message": "SpeakNext AI Backend is Running!"
    })


# =========================
# API TEST
# =========================

@app.route("/api/test")
def test():

    return jsonify({
        "status": "success",
        "message": "Frontend and Backend connection is working!"
    })


# =========================
# REGISTER
# =========================

@app.route("/api/register", methods=["POST"])
def register():

    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:

        return jsonify({
            "status": "error",
            "message": "All fields are required."
        }), 400

    conn = get_db_connection()

    existing_user = conn.execute(
        "SELECT id FROM users WHERE email = ?",
        (email,)
    ).fetchone()

    if existing_user:

        conn.close()

        return jsonify({
            "status": "error",
            "message": "Email already registered."
        }), 409

    conn.execute(
        """
        INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)
        """,
        (name, email, password)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "status": "success",
        "message": "Registration successful!"
    }), 201


# =========================
# LOGIN
# =========================

@app.route("/api/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:

        return jsonify({
            "status": "error",
            "message": "Email and password are required."
        }), 400

    conn = get_db_connection()

    user = conn.execute(
        """
        SELECT id, name, email, password
        FROM users
        WHERE email = ?
        """,
        (email,)
    ).fetchone()

    conn.close()

    if user is None:

        return jsonify({
            "status": "error",
            "message": "User not found."
        }), 404

    if user["password"] != password:

        return jsonify({
            "status": "error",
            "message": "Invalid password."
        }), 401

    return jsonify({
        "status": "success",
        "message": "Login successful!",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
    }), 200


# =========================
# DATABASE TEST
# =========================

@app.route("/api/database-test")
def database_test():

    conn = get_db_connection()

    users_count = conn.execute(
        "SELECT COUNT(*) AS count FROM users"
    ).fetchone()["count"]

    progress_count = conn.execute(
        "SELECT COUNT(*) AS count FROM progress"
    ).fetchone()["count"]

    conn.close()

    return jsonify({
        "status": "success",
        "message": "Database connection is working!",
        "users": users_count,
        "progress_records": progress_count
    })


# =========================
# SAVE USER PROGRESS
# =========================

@app.route("/api/progress", methods=["POST"])
def add_progress():

    data = request.get_json()

    user_id = data.get("user_id")
    activity = data.get("activity")
    score = data.get("score", 0)

    if not user_id or not activity:

        return jsonify({
            "status": "error",
            "message": "User ID and activity are required."
        }), 400

    conn = get_db_connection()

    conn.execute(
        """
        INSERT INTO progress (user_id, activity, score)
        VALUES (?, ?, ?)
        """,
        (user_id, activity, score)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "status": "success",
        "message": "Progress saved successfully!"
    }), 201


# =========================
# GET USER PROGRESS
# =========================

@app.route("/api/progress/<int:user_id>", methods=["GET"])
def get_progress(user_id):

    conn = get_db_connection()

    result = conn.execute(
        """
        SELECT COUNT(*) AS count
        FROM progress
        WHERE user_id = ?
        """,
        (user_id,)
    ).fetchone()

    conn.close()

    return jsonify({
        "status": "success",
        "completed_activities": result["count"]
    })


# =========================
# AI CHAT
# =========================

@app.route("/api/chat", methods=["POST"])
def chat():

    data = request.get_json()

    user_message = data.get(
        "message",
        ""
    ).strip().lower()

    if not user_message:

        return jsonify({
            "status": "error",
            "message": "Message is required."
        }), 400

    if "hello" in user_message or "hi" in user_message:

        response = (
            "Hello! 👋 Welcome to SpeakNext AI. "
            "How can I help you practice English today?"
        )

    elif "interview" in user_message:

        response = (
            "For interviews, speak clearly, give specific examples, "
            "and keep your answers structured."
        )

    elif "english" in user_message:

        response = (
            "You can improve your English by practicing vocabulary, "
            "grammar, speaking and interview questions every day."
        )

    elif "python" in user_message:

        response = (
            "Python is a beginner-friendly programming language "
            "used for web development, automation and data science."
        )

    elif "html" in user_message:

        response = (
            "HTML is used to structure the content of web pages."
        )

    elif "css" in user_message:

        response = (
            "CSS is used to style and design web pages."
        )

    elif "javascript" in user_message:

        response = (
            "JavaScript is used to add interactive and dynamic "
            "features to websites."
        )

    elif "thank" in user_message:

        response = (
            "You're welcome! 😊 Keep learning and practicing with SpeakNext."
        )

    else:

        response = (
            "That's a good question! Keep practicing your "
            "English communication skills."
        )

    return jsonify({
        "status": "success",
        "response": response
    })


# =========================
# START SERVER
# =========================

if __name__ == "__main__":

    app.run(
        debug=True
    )