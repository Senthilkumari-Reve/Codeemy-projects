# app.py
# Simple TODO REST API using Flask + SQLite (no ORM).
# Run: pip install flask flask-cors
# Then: python app.py

from flask import Flask, request, jsonify, g, send_from_directory
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime

DB_PATH = "todos.db"

app = Flask(__name__, static_folder="static")
CORS(app)  # allow frontend to access API (for dev)

# ---------------------------
# Database helpers
# ---------------------------
def get_db():
    db = getattr(g, "_db", None)
    if db is None:
        db = g._db = sqlite3.connect(DB_PATH)
        db.row_factory = sqlite3.Row
    return db

def init_db():
    if not os.path.exists(DB_PATH):
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
        CREATE TABLE todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            done INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """)
        conn.commit()
        conn.close()
        print("Database created at", DB_PATH)
    else:
        print("Database already exists:", DB_PATH)

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, "_db", None)
    if db is not None:
        db.close()

def row_to_dict(row):
    if row is None:
        return None
    return {
        "id": row["id"],
        "title": row["title"],
        "description": row["description"],
        "done": bool(row["done"]),
        "created_at": row["created_at"],
        "updated_at": row["updated_at"]
    }

# ---------------------------
# Routes: REST API
# ---------------------------

@app.route("/api/todos", methods=["GET"])
def list_todos():
    """
    GET /api/todos
    Optional query params:
      - done=true|false  (filter by done state)
      - q=search-term    (search title/description)
    """
    db = get_db()
    q = request.args.get("q", "").strip()
    done_param = request.args.get("done", None)

    sql = "SELECT * FROM todos"
    params = []
    where_clauses = []

    if done_param is not None:
        if done_param.lower() in ("true", "1"):
            where_clauses.append("done = 1")
        elif done_param.lower() in ("false", "0"):
            where_clauses.append("done = 0")
    if q:
        where_clauses.append("(title LIKE ? OR description LIKE ?)")
        params.extend([f"%{q}%", f"%{q}%"])

    if where_clauses:
        sql += " WHERE " + " AND ".join(where_clauses)

    sql += " ORDER BY created_at DESC"
    cur = db.execute(sql, params)
    rows = cur.fetchall()
    todos = [row_to_dict(r) for r in rows]
    return jsonify(todos), 200

@app.route("/api/todos/<int:todo_id>", methods=["GET"])
def get_todo(todo_id):
    db = get_db()
    cur = db.execute("SELECT * FROM todos WHERE id = ?", (todo_id,))
    row = cur.fetchone()
    if row is None:
        return jsonify({"error": "Todo not found"}), 404
    return jsonify(row_to_dict(row)), 200

@app.route("/api/todos", methods=["POST"])
def create_todo():
    """
    POST /api/todos
    Body (JSON): { "title": "...", "description": "...", "done": false }
    """
    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400

    title = (data.get("title") or "").strip()
    description = data.get("description") or ""
    done = bool(data.get("done", False))

    if not title:
        return jsonify({"error": "Title is required"}), 400

    now = datetime.utcnow().isoformat()
    db = get_db()
    cur = db.execute(
        "INSERT INTO todos (title, description, done, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
        (title, description, 1 if done else 0, now, now)
    )
    db.commit()
    todo_id = cur.lastrowid
    cur = db.execute("SELECT * FROM todos WHERE id = ?", (todo_id,))
    row = cur.fetchone()
    return jsonify(row_to_dict(row)), 201

@app.route("/api/todos/<int:todo_id>", methods=["PUT", "PATCH"])
def update_todo(todo_id):
    """
    PUT /api/todos/<id>
    Body (JSON): { "title": "...", "description": "...", "done": true/false }
    """
    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400

    fields = {}
    if "title" in data:
        title = (data.get("title") or "").strip()
        if not title:
            return jsonify({"error": "Title cannot be empty"}), 400
        fields["title"] = title
    if "description" in data:
        fields["description"] = data.get("description") or ""
    if "done" in data:
        fields["done"] = 1 if bool(data.get("done")) else 0

    if not fields:
        return jsonify({"error": "No updatable fields provided"}), 400

    db = get_db()
    # build SET clause
    set_clause = ", ".join([f"{k} = ?" for k in fields.keys()])
    params = list(fields.values())
    params.append(datetime.utcnow().isoformat())  # updated_at
    params.append(todo_id)

    sql = f"UPDATE todos SET {set_clause}, updated_at = ? WHERE id = ?"
    cur = db.execute(sql, params)
    db.commit()

    if cur.rowcount == 0:
        return jsonify({"error": "Todo not found"}), 404

    cur = db.execute("SELECT * FROM todos WHERE id = ?", (todo_id,))
    row = cur.fetchone()
    return jsonify(row_to_dict(row)), 200

@app.route("/api/todos/<int:todo_id>", methods=["DELETE"])
def delete_todo(todo_id):
    db = get_db()
    cur = db.execute("DELETE FROM todos WHERE id = ?", (todo_id,))
    db.commit()
    if cur.rowcount == 0:
        return jsonify({"error": "Todo not found"}), 404
    return jsonify({"deleted": todo_id}), 200

# ---------------------------
# Frontend (static) route
# ---------------------------
@app.route("/", methods=["GET"])
def index():
    return send_from_directory(app.static_folder, "index.html")

# ---------------------------
# App start
# ---------------------------
if __name__ == "__main__":
    init_db()
    # dev server
    app.run(host="0.0.0.0", port=5000, debug=True)
