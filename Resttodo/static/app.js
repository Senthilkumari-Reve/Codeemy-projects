// static/app.js
const apiBase = "/api/todos";

async function fetchTodos() {
  const res = await fetch(apiBase);
  const todos = await res.json();
  const container = document.getElementById("todos");
  container.innerHTML = "";
  if (!todos.length) {
    container.innerHTML = "<p>No todos yet.</p>";
    return;
  }
  todos.forEach(t => {
    const div = document.createElement("div");
    div.className = "todo" + (t.done ? " done" : "");
    div.innerHTML = `
      <strong>${escapeHtml(t.title)}</strong>
      <div>${escapeHtml(t.description || "")}</div>
      <div style="margin-top:8px;">
        <small>Created: ${new Date(t.created_at).toLocaleString()}</small>
      </div>
      <div style="margin-top:8px;">
        <button onclick="toggleDone(${t.id}, ${t.done})">${t.done ? "Mark undone" : "Mark done"}</button>
        <button onclick="deleteTodo(${t.id})">Delete</button>
      </div>
    `;
    container.appendChild(div);
  });
}

async function createTodo() {
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  if (!title) { alert("Title required"); return; }
  await fetch(apiBase, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description })
  });
  document.getElementById("title").value = "";
  document.getElementById("description").value = "";
  fetchTodos();
}

async function toggleDone(id, current) {
  await fetch(`${apiBase}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ done: !current })
  });
  fetchTodos();
}

async function deleteTodo(id) {
  if (!confirm("Delete this todo?")) return;
  await fetch(`${apiBase}/${id}`, { method: "DELETE" });
  fetchTodos();
}

function escapeHtml(s) {
  if (!s) return "";
  return s.replace(/[&<>"']/g, function(m) {
    return ({ "&": "&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[m];
  });
}

// load on start
fetchTodos();
