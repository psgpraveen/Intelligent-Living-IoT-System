import axios from "axios";
const api = axios.create({ baseURL: "http://localhost:3001/api", headers: { "Content-Type": "application/json" } });
api.interceptors.request.use(cfg => {
  const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
export const get = <T = any>(u: string) => api.get<T>(u).then(r => r.data);
export const post = <T = any>(u: string, d: any) => api.post<T>(u, d).then(r => r.data);
export const put = <T = any>(u: string, d: any) => api.put<T>(u, d).then(r => r.data);
export const del = <T = any>(u: string) => api.delete<T>(u).then(r => r.data);
