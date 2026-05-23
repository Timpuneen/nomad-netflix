import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTitle } from "../api/titles";

export default function TitlePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getTitle(id)
      .then((data) => {
        if (!data) {
          navigate("/404", { replace: true });
        } else {
          setTitle(data);
        }
      })
      .catch(() => {
        navigate("/404", { replace: true });
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div style={styles.center}><p style={{ color: "#aaa" }}>Загрузка...</p></div>;
  if (!title) return <div style={styles.center}><p style={{ color: "#aaa" }}>Не найдено</p></div>;

  return (
    <div style={styles.page}>
      <button style={styles.back} onClick={() => navigate(-1)}>← Назад</button>

      <div style={styles.card}>
        <div style={styles.typeBadge}>{title.type}</div>
        <h1 style={styles.title}>{title.title}</h1>

        <div style={styles.metaRow}>
          {title.release_year && <span style={styles.meta}>{title.release_year}</span>}
          {title.rating && <span style={styles.meta}>{title.rating}</span>}
          {title.duration && <span style={styles.meta}>{title.duration}</span>}
        </div>

        {title.description && <p style={styles.desc}>{title.description}</p>}

        <div style={styles.section}>
          {title.genres?.length > 0 && (
            <div style={styles.tagGroup}>
              <span style={styles.label}>Жанры:</span>
              {title.genres.map((g: any) => (
                <span key={g.id} style={styles.tag}>{g.name}</span>
              ))}
            </div>
          )}

          {title.countries?.length > 0 && (
            <div style={styles.tagGroup}>
              <span style={styles.label}>Страны:</span>
              {title.countries.map((c: any) => (
                <span key={c.id} style={styles.tag}>{c.name}</span>
              ))}
            </div>
          )}

          {title.director && (
            <p style={styles.infoLine}><span style={styles.label}>Режиссёр:</span> {title.director}</p>
          )}

          {title.cast && (
            <p style={styles.infoLine}><span style={styles.label}>В ролях:</span> {title.cast}</p>
          )}

          {title.date_added && (
            <p style={styles.infoLine}><span style={styles.label}>Добавлено:</span> {title.date_added}</p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#141414", padding: "2rem" },
  center: {
    minHeight: "100vh", background: "#141414",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  back: {
    background: "transparent", border: "1px solid #333", color: "#aaa",
    padding: "0.4rem 1rem", borderRadius: "6px", cursor: "pointer", marginBottom: "1.5rem",
  },
  card: {
    background: "#1f1f1f", borderRadius: "12px", padding: "2rem",
    maxWidth: "800px", margin: "0 auto",
  },
  typeBadge: {
    display: "inline-block", fontSize: "0.8rem", color: "#e50914",
    border: "1px solid #e50914", borderRadius: "4px",
    padding: "0.1rem 0.6rem", marginBottom: "0.75rem",
  },
  title: { color: "#fff", fontSize: "2rem", margin: "0 0 0.75rem" },
  metaRow: { display: "flex", gap: "0.75rem", marginBottom: "1.25rem" },
  meta: {
    background: "#2a2a2a", color: "#ccc", padding: "0.25rem 0.75rem",
    borderRadius: "4px", fontSize: "0.85rem",
  },
  desc: { color: "#bbb", lineHeight: 1.7, marginBottom: "1.5rem", fontSize: "0.95rem" },
  section: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  tagGroup: { display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" },
  tag: {
    background: "#2a2a2a", color: "#ddd", padding: "0.2rem 0.6rem",
    borderRadius: "4px", fontSize: "0.82rem",
  },
  label: { color: "#666", fontSize: "0.85rem", marginRight: "0.25rem" },
  infoLine: { color: "#bbb", fontSize: "0.9rem", margin: 0 },
};
