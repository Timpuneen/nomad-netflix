import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getTitles, getGenres, getCountries, getRatings, TitleFilters } from "../api/titles";
import { useAuthStore } from "../store/authStore";

const TYPES = ["Movie", "TV Show"];

export default function BrowsePage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const [filters, setFilters] = useState<TitleFilters>({ page: 1, page_size: 20 });
  const [search, setSearch] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");

  const [titles, setTitles] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [countries, setCountries] = useState<{ id: number; name: string }[]>([]);
  const [ratings, setRatings] = useState<string[]>([]);

  const [selectedType, setSelectedType] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedRating, setSelectedRating] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getGenres().then(setGenres).catch(console.error);
    getCountries().then(setCountries).catch(console.error);
    getRatings().then(setRatings).catch(console.error);
  }, []);

  const fetchTitles = useCallback(async (f: TitleFilters) => {
    setLoading(true);
    try {
      const data = await getTitles(f);
      setTitles(data.results);
      setTotal(data.total);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTitles(filters); }, [filters, fetchTitles]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters((f) => ({ ...f, search: value.trim() || undefined, page: 1 }));
    }, 500);
  };

  const handleFilter = (key: keyof TitleFilters, value: string) => {
    setFilters((f) => ({ ...f, [key]: value || undefined, page: 1 }));
  };

  const handleYearFrom = (value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, 4);
    setYearFrom(clean);
    setFilters((f) => ({ ...f, year_from: clean.length === 4 ? parseInt(clean) : undefined, page: 1 }));
  };

  const handleYearTo = (value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, 4);
    setYearTo(clean);
    setFilters((f) => ({ ...f, year_to: clean.length === 4 ? parseInt(clean) : undefined, page: 1 }));
  };

  const hasActiveFilters = selectedType || selectedGenre || selectedCountry || selectedRating || yearFrom || yearTo || search;

  const resetAll = () => {
    setSearch("");
    setYearFrom("");
    setYearTo("");
    setSelectedType("");
    setSelectedGenre("");
    setSelectedCountry("");
    setSelectedRating("");
    setFilters({ page: 1, page_size: 20 });
  };

  const totalPages = Math.ceil(total / (filters.page_size || 20));

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.logo}>🎬 Netflix Browser</h1>
        <button style={styles.logoutBtn} onClick={() => { logout(); navigate("/login"); }}>
          Выйти
        </button>
      </header>

      <div style={styles.searchRow}>
        <input
          style={styles.searchInput}
          placeholder="Поиск по названию, режиссёру, актёрам..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        {loading && <span style={styles.loadingDot}>⏳</span>}
      </div>

      <div style={styles.filtersRow}>
        <select
          style={styles.select}
          value={selectedType}
          onChange={(e) => { setSelectedType(e.target.value); handleFilter("type", e.target.value); }}
        >
          <option value="">Все типы</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        <select
          style={styles.select}
          value={selectedGenre}
          onChange={(e) => { setSelectedGenre(e.target.value); handleFilter("genre", e.target.value); }}
        >
          <option value="">Все жанры</option>
          {genres.filter(g => g.name.trim()).map((g) => <option key={g.id} value={g.name}>{g.name}</option>)}
        </select>

        <select
          style={styles.select}
          value={selectedCountry}
          onChange={(e) => { setSelectedCountry(e.target.value); handleFilter("country", e.target.value); }}
        >
          <option value="">Все страны</option>
          {countries.filter(c => c.name.trim()).map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>

        <select
          style={styles.select}
          value={selectedRating}
          onChange={(e) => { setSelectedRating(e.target.value); handleFilter("rating", e.target.value); }}
        >
          <option value="">Все рейтинги</option>
          {ratings.filter(r => r && r.trim()).map((r) => <option key={r} value={r}>{r}</option>)}
        </select>

        {/* Year range */}
        <div style={styles.yearRange}>
          <input
            style={styles.yearInput}
            type="text"
            inputMode="numeric"
            placeholder="От"
            maxLength={4}
            value={yearFrom}
            onChange={(e) => handleYearFrom(e.target.value)}
          />
          <span style={styles.yearSep}>—</span>
          <input
            style={styles.yearInput}
            type="text"
            inputMode="numeric"
            placeholder="До"
            maxLength={4}
            value={yearTo}
            onChange={(e) => handleYearTo(e.target.value)}
          />
        </div>

        {hasActiveFilters && (
          <button style={styles.resetBtn} onClick={resetAll}>
            ✕ Сбросить
          </button>
        )}
      </div>

      <p style={styles.count}>
        {loading ? "Загружаем..." : `Найдено: ${total}`}
      </p>

      <div style={styles.grid}>
        {titles.map((t) => (
          <div key={t.show_id} style={styles.card} onClick={() => navigate(`/titles/${t.show_id}`)}>
            <div style={styles.cardType}>{t.type}</div>
            <h3 style={styles.cardTitle}>{t.title}</h3>
            <p style={styles.cardMeta}>{t.release_year} · {t.rating} · {t.duration}</p>
            <p style={styles.cardGenres}>{t.genres.map((g: any) => g.name).join(", ")}</p>
            <p style={styles.cardDesc}>{t.description?.slice(0, 120)}...</p>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button style={styles.pageBtn} disabled={filters.page === 1}
            onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) - 1 }))}>
            ← Назад
          </button>
          <span style={{ color: "#999" }}>Стр. {filters.page} из {totalPages}</span>
          <button style={styles.pageBtn} disabled={filters.page === totalPages}
            onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) + 1 }))}>
            Вперёд →
          </button>
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
    display: "flex", alignItems: "center", gap: "0.75rem",
    padding: "1.5rem 2rem 0.5rem",
  },
  searchInput: {
    flex: 1, padding: "0.75rem 1rem", borderRadius: "6px",
    border: "1px solid #333", background: "#1f1f1f", color: "#fff", fontSize: "1rem",
  },
  loadingDot: { fontSize: "1.2rem" },
  filtersRow: {
    display: "flex", gap: "0.75rem", padding: "0.75rem 2rem",
    flexWrap: "wrap", alignItems: "center",
  },
  select: {
    padding: "0.6rem 0.8rem", borderRadius: "6px", border: "1px solid #333",
    background: "#1f1f1f", color: "#ccc", fontSize: "0.9rem", cursor: "pointer",
  },
  yearRange: { display: "flex", alignItems: "center", gap: "0.4rem" },
  yearInput: {
    width: "70px", padding: "0.6rem 0.5rem", borderRadius: "6px",
    border: "1px solid #333", background: "#1f1f1f", color: "#ccc",
    fontSize: "0.9rem", textAlign: "center",
  },
  yearSep: { color: "#666", fontSize: "0.9rem" },
  resetBtn: {
    padding: "0.6rem 1rem", borderRadius: "6px", border: "1px solid #555",
    background: "transparent", color: "#aaa", fontSize: "0.85rem", cursor: "pointer",
  },
  count: { color: "#666", padding: "0 2rem 0.5rem", fontSize: "0.9rem" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "1.25rem", padding: "0 2rem",
  },
  card: {
    background: "#1f1f1f", borderRadius: "10px", padding: "1.25rem",
    cursor: "pointer", border: "1px solid #2a2a2a",
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
