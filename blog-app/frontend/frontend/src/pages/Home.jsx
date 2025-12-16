import { useEffect, useState } from "react";
import axios from "axios";

const token = localStorage.getItem("token");
let loggedInUserId = null;

const handleDelete = async (id) => {
  if (!window.confirm("Delete this post?")) return;

  try {
    await api.delete(`/posts/${id}`);
    setPosts(posts.filter((p) => p._id !== id));
  } catch (err) {
    alert("Delete failed");
  }
};

const handleEdit = (post) => {
  const newTitle = prompt("Edit title", post.title);
  const newContent = prompt("Edit content", post.content);

  if (!newTitle || !newContent) return;

  api
    .put(`/posts/${post._id}`, {
      title: newTitle,
      content: newContent,
    })
    .then((res) => {
      setPosts(
        posts.map((p) => (p._id === post._id ? res.data : p))
      );
    })
    .catch(() => alert("Edit failed"));
};


if (token) {
  const payload = JSON.parse(atob(token.split(".")[1]));
  loggedInUserId = payload.id;
}


function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/posts")
      .then((res) => {
        setPosts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching posts:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <h2>Loading posts...</h2>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Blog Posts</h1>

      {posts.length === 0 && <p>No posts yet.</p>}

      {posts.map((post) => (
        <div
          key={post._id}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "15px",
            borderRadius: "6px",
          }}
        >
          <h3>{post.title}</h3>
          <p>{post.content}</p>

          {post.author && (
            <small style={{ color: "#555" }}>
                ✍️ {post.author.username}
            </small>
       )}

       {post.author && post.author._id === loggedInUserId && (
  <div style={{ marginTop: "10px" }}>
    <button
      style={{ marginRight: "10px" }}
      onClick={() => handleEdit(post)}
    >
      Edit
    </button>

    <button onClick={() => handleDelete(post._id)}>
      Delete
    </button>
  </div>)}

    
        </div>
      ))}
    </div>
  );
}

export default Home;
