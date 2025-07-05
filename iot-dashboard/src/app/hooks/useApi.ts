import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(cfg => {
  const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

// Generic GET
export const get = async <TResponse>(url: string): Promise<TResponse> => {
  const res = await api.get<TResponse>(url);
  return res.data;
};

// Generic POST
export const post = async <TResponse, TRequest = unknown>(
  url: string,
  data?: TRequest
): Promise<TResponse> => {
  const res = await api.post<TResponse>(url, data);
  return res.data;
};

// Generic PUT
export const put = async <TResponse, TRequest = unknown>(
  url: string,
  data?: TRequest
): Promise<TResponse> => {
  const res = await api.put<TResponse>(url, data);
  return res.data;
};

// Generic DELETE
export const del = async <TResponse>(url: string): Promise<TResponse> => {
  const res = await api.delete<TResponse>(url);
  return res.data;
};
