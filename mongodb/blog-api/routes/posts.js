import express from "express";
import { openDb } from "../database.js";

const router = express.Router();

// GET all posts
router.get("/", async (req, res) => {
  const db = await openDb();
  const posts = await db.all("SELECT * FROM posts ORDER BY created_at DESC");
  res.json(posts);
});

// GET a single post
router.get("/:id", async (req, res) => {
  const db = await openDb();
  const post = await db.get("SELECT * FROM posts WHERE id = ?", [req.params.id]);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
});

// CREATE new post
router.post("/", async (req, res) => {
  const { title, content, author } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Title & content required" });
  }

  const now = new Date().toISOString();
  const db = await openDb();

  const result = await db.run(
    "INSERT INTO posts (title, content, author, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
    [title, content, author || "Anonymous", now, now]
  );

  res.status(201).json({ id: result.lastID, title, content, author });
});

// UPDATE post
router.put("/:id", async (req, res) => {
  const { title, content, author } = req.body;
  const now = new Date().toISOString();

  const db = await openDb();
  const existing = await db.get("SELECT * FROM posts WHERE id = ?", [req.params.id]);
  if (!existing) return res.status(404).json({ error: "Post not found" });

  await db.run(
    "UPDATE posts SET title = ?, content = ?, author = ?, updated_at = ? WHERE id = ?",
    [
      title ?? existing.title,
      content ?? existing.content,
      author ?? existing.author,
      now,
      req.params.id
    ]
  );

  res.json({ message: "Post updated!" });
});

// DELETE post
router.delete("/:id", async (req, res) => {
  const db = await openDb();
  const result = await db.run("DELETE FROM posts WHERE id = ?", [req.params.id]);

  if (result.changes === 0)
    return res.status(404).json({ error: "Post not found" });

  res.json({ message: "Deleted successfully" });
});

export default router;
