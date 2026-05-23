import api from "./client";

// ── Auth ─────────────────────────────────────────────────────────────────────

export const login = async (username: string, password: string) => {
  const form = new URLSearchParams({ username, password });
  const { data } = await api.post("/auth/login", form);
  return data as { access_token: string; token_type: string };
};

export const register = async (username: string, email: string, password: string) => {
  const { data } = await api.post("/auth/register", { username, email, password });
  return data;
};

export const getMe = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

export const deleteMe = async () => {
  await api.delete("/auth/me");
};

// ── Titles ────────────────────────────────────────────────────────────────────

export interface TitleFilters {
  search?: string;
  type?: string;
  genre?: string;
  country?: string;
  rating?: string;
  release_year?: number;
  year_from?: number;
  year_to?: number;
  page?: number;
  page_size?: number;
}

export const getTitles = async (filters: TitleFilters = {}) => {
  const { data } = await api.get("/titles", { params: filters });
  return data;
};

export const getTitle = async (showId: string) => {
  const { data } = await api.get(`/titles/${showId}`);
  return data;
};

export const getGenres = async () => {
  const { data } = await api.get("/titles/genres");
  return data as { id: number; name: string }[];
};

export const getCountries = async () => {
  const { data } = await api.get("/titles/countries");
  return data as { id: number; name: string }[];
};

export const getRatings = async () => {
  const { data } = await api.get("/titles/ratings");
  return data as string[];
};
