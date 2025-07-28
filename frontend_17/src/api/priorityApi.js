import api from "./api";

export const getAllPriorities = async () => {
  const res = await api.get("/api/priority/all");
  return res.data;
};

export const createPriority = async (data) => {
  const res = await api.post("/api/priority/create", data);
  return res.data;
};

export const updatePriority = async (id, data) => {
  const res = await api.put(`/api/priority/${id}`, data);
  return res.data;
};

export const deletePriority = async (id) => {
  const res = await api.delete(`/api/priority/${id}`);
  return res.data;
};
