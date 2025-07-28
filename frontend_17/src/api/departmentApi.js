import api from "./api";

export const getAllDepartments = async () => {
  const res = await api.get("/api/department/all");
  return res.data;
};

export const createDepartment = async (data) => {
  const res = await api.post("/api/department/create", data);
  return res.data;
};

export const updateDepartment = async (id, data) => {
  const res = await api.put(`/api/department/${id}`, data);
  return res.data;
};

export const deleteDepartment = async (id) => {
  const res = await api.delete(`/api/department/${id}`);
  return res.data;
};
