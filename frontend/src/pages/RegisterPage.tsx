import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const validateUsername = (username: string): string | null => {
  if (username.length < 3) return "Имя пользователя должно быть не менее 3 символов";
  if (username.length > 30) return "Имя пользователя должно быть не более 30 символов";
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return "Имя пользователя может содержать только буквы, цифры, _ и -";
  }
  return null;
};

const validateEmail = (email: string): string | null => {
  if (!email) return "Email обязателен";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Некорректный формат email";
  }
  return null;
};

const validatePassword = (password: string): string | null => {
  if (password.length < 6) return "Пароль должен быть не менее 6 символов";
  if (password.length > 100) return "Пароль должен быть не более 100 символов";
  if (!/[A-Za-z]/.test(password)) return "Пароль должен содержать хотя бы одну букву";
  if (!/\d/.test(password)) return "Пароль должен содержать хотя бы одну цифру";
  return null;
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, login } = useAuthStore();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    // Client-side validation
    const errors: Record<string, string> = {};
    const usernameError = validateUsername(form.username);
    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);

    if (usernameError) errors.username = usernameError;
    if (emailError) errors.email = emailError;
    if (passwordError) errors.password = passwordError;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      await login(form.username, form.password);
      navigate("/");
    } catch (err: any) {
      const detail = err?.response?.data?.detail || "Ошибка регистрации";
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
        <h2 style={styles.title}>Регистрация</h2>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <input
              style={{
                ...styles.input,
                ...(fieldErrors.username ? styles.inputError : {}),
              }}
              placeholder="Имя пользователя"
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
                ...(fieldErrors.email ? styles.inputError : {}),
              }}
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                setFieldErrors((prev) => ({ ...prev, email: "" }));
              }}
              required
            />
            {fieldErrors.email && (
              <p style={styles.fieldError}>{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <input
              style={{
                ...styles.input,
                ...(fieldErrors.password ? styles.inputError : {}),
              }}
              type="password"
              placeholder="Пароль(>=6 символов, буква + цифра)"
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
