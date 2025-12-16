import { useState } from "react";
import api from "../api/api";

function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/posts", {
        title,
        content,
      });

      setMessage("Post created successfully ✅");
      setTitle("");
      setContent("");
    } catch (err) {
      setMessage(
        err.response?.data?.error || "Failed to create post ❌"
      );
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "auto" }}>
      <h2>Create New Post</h2>

      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Post Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <textarea
          placeholder="Write your content here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="6"
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <button style={{ padding: "10px" }}>
          Publish
        </button>
      </form>
    </div>
  );
}

export default CreatePost;
