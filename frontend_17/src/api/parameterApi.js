import api from "./api";

export const getParameter = async () =>
  (await api.get("/api/setting/parameter")).data;

export const createParameter = async (data) =>
  (await api.post("/api/setting/parameter", data)).data;

export const updateParameter = async (id, data) =>
  (await api.put(`/api/setting/parameter/${id}`, data)).data;

export const deleteParameter = async (id) =>
  (await api.delete(`/api/setting/parameter/${id}`)).data;
