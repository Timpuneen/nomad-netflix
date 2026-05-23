import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, login } = useAuthStore();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      await login(form.username, form.password);
      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Ошибка регистрации");
      setForm((f) => ({ ...f, password: "" }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>🎬 Netflix Browser</h1>
        <h2 style={styles.title}>Регистрация</h2>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            placeholder="Имя пользователя"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Пароль"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? "Регистрируем..." : "Создать аккаунт"}
          </button>
        </form>

        <p style={styles.footer}>
          Уже есть аккаунт? <Link to="/login" style={styles.link}>Войти</Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh", display: "flex", alignItems: "center",
    justifyContent: "center", background: "#141414",
  },
  card: {
    background: "#1f1f1f", padding: "2.5rem", borderRadius: "12px",
    width: "100%", maxWidth: "400px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
  },
  logo: { color: "#e50914", textAlign: "center", marginBottom: "0.5rem", fontSize: "1.5rem" },
  title: { color: "#fff", textAlign: "center", marginBottom: "1.5rem", fontWeight: 400 },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  input: {
    padding: "0.8rem 1rem", borderRadius: "6px", border: "1px solid #333",
    background: "#2a2a2a", color: "#fff", fontSize: "1rem", outline: "none",
  },
  btn: {
    padding: "0.8rem", borderRadius: "6px", border: "none",
    background: "#e50914", color: "#fff", fontSize: "1rem",
    cursor: "pointer", fontWeight: 600,
  },
  error: { color: "#ff6b6b", textAlign: "center", marginBottom: "0.5rem" },
  footer: { color: "#999", textAlign: "center", marginTop: "1.5rem" },
  link: { color: "#e50914", textDecoration: "none" },
};
