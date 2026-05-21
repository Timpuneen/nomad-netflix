import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getTitles, getGenres, getCountries, getRatings, TitleFilters } from "../api/titles";
import { useAuthStore } from "../store/authStore";

const TYPES = ["Movie", "TV Show"];

export default function BrowsePage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const [filters, setFilters] = useState<TitleFilters>({ page: 1, page_size: 20 });
  const [search, setSearch] = useState("");

  const [titles, setTitles] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [countries, setCountries] = useState<{ id: number; name: string }[]>([]);
  const [ratings, setRatings] = useState<string[]>([]);

  // Load filter options once
  useEffect(() => {
    getGenres().then(setGenres).catch(console.error);
    getCountries().then(setCountries).catch(console.error);
    getRatings().then(setRatings).catch(console.error);
  }, []);

  const fetchTitles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTitles(filters);
      setTitles(data.results);
      setTotal(data.total);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchTitles(); }, [fetchTitles]);

  const handleSearch = () => {
    setFilters((f) => ({ ...f, search: search || undefined, page: 1 }));
  };

  const handleFilter = (key: keyof TitleFilters, value: string) => {
    setFilters((f) => ({ ...f, [key]: value || undefined, page: 1 }));
  };

  const totalPages = Math.ceil(total / (filters.page_size || 20));

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.logo}>🎬 Netflix Browser</h1>
        <button style={styles.logoutBtn} onClick={() => { logout(); navigate("/login"); }}>
          Выйти
        </button>
      </header>

      {/* Search bar */}
      <div style={styles.searchRow}>
        <input
          style={styles.searchInput}
          placeholder="Поиск по названию, режиссёру, актёрам..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button style={styles.searchBtn} onClick={handleSearch}>Найти</button>
      </div>

      {/* Filters */}
      <div style={styles.filtersRow}>
        <select style={styles.select} onChange={(e) => handleFilter("type", e.target.value)}>
          <option value="">Тип</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        <select style={styles.select} onChange={(e) => handleFilter("genre", e.target.value)}>
          <option value="">Жанр</option>
          {genres.map((g) => <option key={g.id} value={g.name}>{g.name}</option>)}
        </select>

        <select style={styles.select} onChange={(e) => handleFilter("country", e.target.value)}>
          <option value="">Страна</option>
          {countries.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>

        <select style={styles.select} onChange={(e) => handleFilter("rating", e.target.value)}>
          <option value="">Рейтинг</option>
          {ratings.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>

        <input
          style={{ ...styles.select, width: "120px" }}
          type="number"
          placeholder="Год"
          min={1900}
          max={2030}
          onChange={(e) => handleFilter("release_year", e.target.value)}
        />
      </div>

      {/* Results count */}
      <p style={styles.count}>
        {loading ? "Загружаем..." : `Найдено: ${total}`}
      </p>

      {/* Grid */}
      <div style={styles.grid}>
        {titles.map((t) => (
          <div
            key={t.show_id}
            style={styles.card}
            onClick={() => navigate(`/titles/${t.show_id}`)}
          >
            <div style={styles.cardType}>{t.type}</div>
            <h3 style={styles.cardTitle}>{t.title}</h3>
            <p style={styles.cardMeta}>{t.release_year} · {t.rating} · {t.duration}</p>
            <p style={styles.cardGenres}>
              {t.genres.map((g: any) => g.name).join(", ")}
            </p>
            <p style={styles.cardDesc}>{t.description?.slice(0, 120)}...</p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            style={styles.pageBtn}
            disabled={filters.page === 1}
            onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) - 1 }))}
          >← Назад</button>
          <span style={{ color: "#999" }}>
            Стр. {filters.page} из {totalPages}
          </span>
          <button
            style={styles.pageBtn}
            disabled={filters.page === totalPages}
            onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) + 1 }))}
          >Вперёд →</button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#141414", padding: "0 0 3rem" },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "1rem 2rem", background: "#0d0d0d", borderBottom: "1px solid #222",
  },
  logo: { color: "#e50914", fontSize: "1.4rem", margin: 0 },
  logoutBtn: {
    background: "transparent", border: "1px solid #555", color: "#aaa",
    padding: "0.4rem 1rem", borderRadius: "6px", cursor: "pointer",
  },
  searchRow: {
    display: "flex", gap: "0.75rem", padding: "1.5rem 2rem 0.5rem",
  },
  searchInput: {
    flex: 1, padding: "0.75rem 1rem", borderRadius: "6px",
    border: "1px solid #333", background: "#1f1f1f", color: "#fff", fontSize: "1rem",
  },
  searchBtn: {
    padding: "0.75rem 1.5rem", background: "#e50914", color: "#fff",
    border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600,
  },
  filtersRow: {
    display: "flex", gap: "0.75rem", padding: "0.75rem 2rem",
    flexWrap: "wrap",
  },
  select: {
    padding: "0.6rem 0.8rem", borderRadius: "6px", border: "1px solid #333",
    background: "#1f1f1f", color: "#ccc", fontSize: "0.9rem", cursor: "pointer",
  },
  count: { color: "#666", padding: "0 2rem 0.5rem", fontSize: "0.9rem" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "1.25rem",
    padding: "0 2rem",
  },
  card: {
    background: "#1f1f1f", borderRadius: "10px", padding: "1.25rem",
    cursor: "pointer", border: "1px solid #2a2a2a",
    transition: "border-color 0.2s",
  },
  cardType: {
    display: "inline-block", fontSize: "0.75rem", color: "#e50914",
    border: "1px solid #e50914", borderRadius: "4px",
    padding: "0.1rem 0.5rem", marginBottom: "0.5rem",
  },
  cardTitle: { color: "#fff", margin: "0.25rem 0", fontSize: "1rem" },
  cardMeta: { color: "#888", fontSize: "0.8rem", margin: "0.25rem 0" },
  cardGenres: { color: "#666", fontSize: "0.78rem", margin: "0.25rem 0" },
  cardDesc: { color: "#aaa", fontSize: "0.85rem", marginTop: "0.5rem", lineHeight: 1.4 },
  pagination: {
    display: "flex", justifyContent: "center", alignItems: "center",
    gap: "1.5rem", padding: "2rem",
  },
  pageBtn: {
    padding: "0.5rem 1.2rem", background: "#1f1f1f", color: "#fff",
    border: "1px solid #333", borderRadius: "6px", cursor: "pointer",
  },
};
