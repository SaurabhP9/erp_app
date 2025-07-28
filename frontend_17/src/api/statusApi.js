import api from "./api";

export const getAllStatuses = async () => {
  const res = await api.get("/api/status/all");
  return res.data;
};

export const createStatus = async (statusData) => {
  const res = await api.post("/api/status/create", statusData);
  return res.data;
};

export const updateStatus = async (id, statusData) => {
  const res = await api.put(`/api/status/${id}`, statusData);
  return res.data;
};

export const deleteStatus = async (id) => {
  const res = await api.delete(`/api/status/${id}`);
  return res.data;
};