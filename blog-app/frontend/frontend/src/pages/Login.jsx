import { useState, useContext } from "react";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const { login } = useContext(AuthContext); // ✅ HOOK AT TOP LEVEL

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      localStorage.setItem("token", res.data.token);
      login(); // ✅ updates auth state

      setMessage("Login successful ✅");
      setEmail("");
      setPassword("");
    } catch (err) {
      setMessage(
        err.response?.data?.error || "Login failed ❌"
      );
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "400px", margin: "auto" }}>
      <h2>Login</h2>
      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <button style={{ padding: "10px", width: "100%" }}>
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
