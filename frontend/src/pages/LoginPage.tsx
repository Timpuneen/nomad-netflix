import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const validateLoginField = (value: string): string | null => {
  if (!value || value.trim().length === 0) {
    return "Поле не может быть пустым";
  }
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password || password.length === 0) {
    return "Пароль обязателен";
  }
  return null;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    // Client-side validation
    const errors: Record<string, string> = {};
    const usernameError = validateLoginField(form.username);
    const passwordError = validatePassword(form.password);

    if (usernameError) errors.username = usernameError;
    if (passwordError) errors.password = passwordError;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate("/");
    } catch (err: any) {
      const detail = err?.response?.data?.detail || "Неверный логин или пароль";
      setError(detail);
      setForm((f) => ({ ...f, password: "" }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>🎬 Netflix Browser</h1>
        <h2 style={styles.title}>Войти</h2>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <input
              style={{
                ...styles.input,
                ...(fieldErrors.username ? styles.inputError : {}),
              }}
              placeholder="Логин или Email"
              value={form.username}
              onChange={(e) => {
                setForm({ ...form, username: e.target.value });
                setFieldErrors((prev) => ({ ...prev, username: "" }));
              }}
              required
            />
            {fieldErrors.username && (
              <p style={styles.fieldError}>{fieldErrors.username}</p>
            )}
          </div>

          <div>
            <input
              style={{
                ...styles.input,
                ...(fieldErrors.password ? styles.inputError : {}),
              }}
              type="password"
              placeholder="Пароль"
              value={form.password}
              onChange={(e) => {
                setForm({ ...form, password: e.target.value });
                setFieldErrors((prev) => ({ ...prev, password: "" }));
              }}
              required
            />
            {fieldErrors.password && (
              <p style={styles.fieldError}>{fieldErrors.password}</p>
            )}
          </div>

          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? "Входим..." : "Войти"}
          </button>
        </form>

        <p style={styles.footer}>
          Нет аккаунта? <Link to="/register" style={styles.link}>Зарегистрироваться</Link>
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
    width: "100%", boxSizing: "border-box",
  },
  inputError: {
    border: "1px solid #ff6b6b",
  },
  btn: {
    padding: "0.8rem", borderRadius: "6px", border: "none",
    background: "#e50914", color: "#fff", fontSize: "1rem",
    cursor: "pointer", fontWeight: 600,
  },
  error: { color: "#ff6b6b", textAlign: "center", marginBottom: "0.5rem", fontSize: "0.9rem" },
  fieldError: { color: "#ff6b6b", fontSize: "0.85rem", marginTop: "0.3rem", marginBottom: 0 },
  footer: { color: "#999", textAlign: "center", marginTop: "1.5rem" },
  link: { color: "#e50914", textDecoration: "none" },
};
