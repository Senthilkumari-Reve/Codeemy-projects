import express from "express";
import postsRouter from "./routes/posts.js";
import { initDb } from "./database.js";

const app = express();
app.get("/", (req, res) => {
  res.send("🚀 Blog API is running. Try /api/posts");
});

app.use(express.json());



// initialize DB
initDb();

// routes
app.use("/api/posts", postsRouter);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
