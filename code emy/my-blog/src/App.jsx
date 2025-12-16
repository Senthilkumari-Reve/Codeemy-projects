// CLEAN + FIXED VERSION OF App.jsx (NO uuid, NO auto-mount, FULLY VITE-COMPATIBLE)

import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";

// ---------- Utilities ----------
const STORAGE_KEY = "react_blog_posts_v1";
const THEME_KEY = "react_blog_theme_v1";

const nowISO = () => new Date().toISOString();

function loadPosts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return samplePosts();
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load posts:", e);
    return samplePosts();
  }
}

function savePosts(posts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function loadTheme() {
  return localStorage.getItem(THEME_KEY) || "light";
}

function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

function uid() {
  return crypto.randomUUID();
}

function samplePosts() {
  const p1 = {
    id: uid(),
    title: "Welcome — First Post",
    content: "This is a starter blog. Edit or delete this post and start writing your story.",
    category: "General",
    createdAt: nowISO(),
    updatedAt: nowISO(),
    comments: [{ id: uid(), author: "Admin", text: "Nice start!", createdAt: nowISO() }],
  };
  const p2 = {
    id: uid(),
    title: "React Tips",
    content: "Use hooks wisely. Keep components focused. Lift state up when necessary.",
    category: "Tech",
    createdAt: nowISO(),
    updatedAt: nowISO(),
    comments: [],
  };
  const arr = [p1, p2];
  savePosts(arr);
  return arr;
}

// ---------- App Shell ----------
export default function App() {
  return (
    <BrowserRouter>
      <RootApp />
    </BrowserRouter>
  );
}

function RootApp() {
  const [posts, setPosts] = useState(() => loadPosts());
  const [theme, setTheme] = useState(() => loadTheme());

  useEffect(() => savePosts(posts), [posts]);
  useEffect(() => saveTheme(theme), [theme]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const addPost = (post) => {
    setPosts((prev) => [
      {
        ...post,
        id: uid(),
        createdAt: nowISO(),
        updatedAt: nowISO(),
        comments: [],
      },
      ...prev,
    ]);
  };

  const updatePost = (id, patch) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: nowISO() } : p)));
  };

  const deletePost = (id) => {
    if (!confirm("Delete this post?")) return;
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const addComment = (postId, author, text) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [...p.comments, { id: uid(), author, text, createdAt: nowISO() }],
            }
          : p
      )
    );
  };

  const uniqueCategories = useMemo(() => {
    const set = new Set(posts.map((p) => p.category || "Uncategorized"));
    return ["All", ...Array.from(set)];
  }, [posts]);

  return (
    <div className={`app-shell ${theme}`} style={{ minHeight: "100vh", transition: "background 200ms" }}>
      <Header theme={theme} setTheme={setTheme} />
      <main style={{ padding: "20px", maxWidth: 1000, margin: "0 auto" }}>
        <Routes>
          <Route path="/" element={<Home posts={posts} categories={uniqueCategories} onDelete={deletePost} />} />
          <Route
            path="/post/:id"
            element={<PostDetail posts={posts} onDelete={deletePost} onComment={addComment} />}
          />
          <Route path="/new" element={<Editor onSave={addPost} categories={uniqueCategories} />} />
          <Route
            path="/edit/:id"
            element={<Editor posts={posts} onSave={(id, data) => updatePost(id, data)} categories={uniqueCategories} />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

// ---------- UI Components ----------
function Header({ theme, setTheme }) {
  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 24px",
        borderBottom: "1px solid var(--muted)",
      }}
    >
      <div>
        <Link to="/" style={{ textDecoration: "none", color: "var(--text)" }}>
          <h1 style={{ margin: 0 }}>✨ MiniBlog</h1>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Write. Share. Repeat.</div>
        </Link>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Link
          to="/new"
          style={{ padding: "8px 12px", borderRadius: 8, background: "var(--accent)", color: "#fff", textDecoration: "none" }}
        >
          + New Post
        </Link>
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          style={{ padding: 8, borderRadius: 8, border: "1px solid var(--muted)", background: "transparent" }}
        >
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer style={{ padding: "24px", textAlign: "center", color: "var(--muted)" }}>
      Built with ❤️ — MiniBlog starter
    </footer>
  );
}

function Home({ posts, categories, onDelete }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = posts.filter((p) => {
    const q = query.trim().toLowerCase();
    const matchQuery = !q || p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q);
    const matchCat = category === "All" || (p.category || "Uncategorized") === category;
    return matchQuery && matchCat;
  });

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <SearchBar value={query} onChange={setQuery} />
        <CategoryFilter categories={categories} value={category} onChange={setCategory} />
      </div>

      <section>
        {filtered.length === 0 ? (
          <div>No posts match your search. Create one!</div>
        ) : (
          filtered.map((p) => <PostCard key={p.id} post={p} onDelete={onDelete} />)
        )}
      </section>
    </div>
  );
}

function SearchBar({ value, onChange }) {
  return (
    <input
      placeholder="Search posts..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ flex: 1, minWidth: 180, padding: 8, borderRadius: 8, border: "1px solid var(--muted)" }}
    />
  );
}

function CategoryFilter({ categories, value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ padding: 8, borderRadius: 8, border: "1px solid var(--muted)" }}
    >
      {categories.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}

function PostCard({ post, onDelete }) {
  return (
    <article style={{ border: "1px solid var(--muted)", padding: 12, borderRadius: 8, marginBottom: 12 }}>
      <Link to={`/post/${post.id}`} style={{ textDecoration: "none", color: "var(--text)" }}>
        <h3 style={{ margin: "0 0 6px 0" }}>{post.title}</h3>
      </Link>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>
        {post.category} • {new Date(post.createdAt).toLocaleString()}
      </div>
      <p
        style={{
          margin: 0,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {post.content}
      </p>
      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        <Link to={`/post/${post.id}`} style={{ textDecoration: "none" }}>
          Read
        </Link>
        <Link to={`/edit/${post.id}`} style={{ textDecoration: "none" }}>
          Edit
        </Link>
        <button onClick={() => onDelete(post.id)} style={{ background: "transparent", border: "none", color: "var(--muted)" }}>
          Delete
        </button>
      </div>
    </article>
  );
}

function PostDetail({ posts, onDelete, onComment }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = posts.find((p) => p.id === id);
  if (!post) return <div>Post not found. <button onClick={() => navigate("/")}>Go home</button></div>;

  return (
    <article>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0 }}>{post.title}</h2>
          <div style={{ color: "var(--muted)", fontSize: 13 }}>
            {post.category} • {new Date(post.createdAt).toLocaleString()}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link to={`/edit/${post.id}`}>Edit</Link>
          <button
            onClick={() => {
              onDelete(post.id);
              navigate("/");
            }}
          >
            Delete
          </button>
        </div>
      </div>

      <div style={{ marginTop: 16, whiteSpace: "pre-wrap" }}>{post.content}</div>

      <section style={{ marginTop: 24 }}>
        <h3>
          Comments ({post.comments.length})
        </h3>
        <CommentSection post={post} onAdd={(author, text) => onComment(post.id, author, text)} />
      </section>
    </article>
  );
}

function CommentSection({ post, onAdd }) {
  const [author, setAuthor] = useState("Guest");
  const [text, setText] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(author || "Guest", text.trim());
    setText("");
  };

  return (
    <div>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Your name"
          style={{ padding: 8, borderRadius: 6, border: "1px solid var(--muted)" }}
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          style={{ padding: 8, borderRadius: 6, border: "1px solid var(--muted)" }}
          rows={3}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" style={{ padding: "8px 12px", borderRadius: 6 }}>
            Add Comment
          </button>
        </div>
      </form>

      <div style={{ marginTop: 12 }}>
        {post.comments.length === 0 ? (
          <div style={{ color: "var(--muted)" }}>No comments yet — be first.</div>
        ) : (
          post.comments.map((c) => (
            <div key={c.id} style={{ borderTop: "1px solid var(--muted)", paddingTop: 8, marginTop: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                {c.author}{" "}
                <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: 12 }}>
                  • {new Date(c.createdAt).toLocaleString()}
                </span>
              </div>
              <div style={{ whiteSpace: "pre-wrap" }}>{c.text}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Editor({ onSave, posts = [], categories }) {
  const params = useParams();
  const navigate = useNavigate();
  const editingId = params.id;
  const editingPost = posts.find((p) => p.id === editingId);

  const [title, setTitle] = useState(editingPost ? editingPost.title : "");
  const [content, setContent] = useState(editingPost ? editingPost.content : "");
  const [category, setCategory] = useState(
    editingPost ? editingPost.category : categories[1] || "General"
  );

  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title);
      setContent(editingPost.content);
      setCategory(editingPost.category);
    }
  }, [editingId]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("Title and content required");
      return;
    }
    if (editingPost) {
      onSave(editingId, {
        title: title.trim(),
        content: content.trim(),
        category,
      });
    } else {
      onSave({
        title: title.trim(),
        content: content.trim(),
        category,
      });
    }
    navigate("/");
  };

  return (
    <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ padding: 10, borderRadius: 8, border: "1px solid var(--muted)" }}
      />
      <input
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={{ padding: 10, borderRadius: 8, border: "1px solid var(--muted)" }}
        list="cats"
      />
      <datalist id="cats">
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <textarea
        placeholder="Write your post here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={10}
        style={{ padding: 12, borderRadius: 8, border: "1px solid var(--muted)", whiteSpace: "pre-wrap" }}
      />

      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" style={{ padding: "10px 14px", borderRadius: 8 }}>
          {editingPost ? "Save Changes" : "Publish"}
        </button>
        <button type="button" onClick={() => navigate(-1)} style={{ padding: "10px 14px", borderRadius: 8 }}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function NotFound() {
  return (
    <div>
      <h2>404 — Not found</h2>
      <Link to="/">Go home</Link>
    </div>
  );
}

// ---------- Minimal CSS injection ----------
const css = `
:root{
  --bg:#ffffff; --surface:#ffffff; --text:#0f1724; --muted:#8892a6; --accent:#2563eb;
}
[data-theme='dark']{ --bg:#0b1220; --surface:#071026; --text:#e6eef8; --muted:#9fb3d6; --accent:#60a5fa }
body{margin:0;background:var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial}
.app-shell{background:var(--bg)}
header, footer{background:var(--surface)}
a{color:var(--accent)}
button{cursor:pointer}
`;
const styleTag = document.createElement("style");
styleTag.innerHTML = css;
document.head.appendChild(styleTag);

