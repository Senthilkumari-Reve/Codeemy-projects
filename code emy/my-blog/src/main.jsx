import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ---------- Mount for vite preview when this file used as main.jsx replacement ----------
if (!window.__MINIBLOG_MOUNTED__) {
  try {
    const rootEl = document.getElementById('root') || (() => { const d=document.createElement('div'); d.id='root'; document.body.appendChild(d); return d })()
    createRoot(rootEl).render(<App />)
    window.__MINIBLOG_MOUNTED__ = true
  } catch(e){
    console.warn('Mount skipped (likely running inside full app).', e)
  }
}
