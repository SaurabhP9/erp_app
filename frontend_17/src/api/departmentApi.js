import api from "./api";

export const getAllDepartments = async () => {
  const res = await api.get("/api/department/all");
  return res.data;
};

export const createDepartment = async (data) => {
  console.log("while creating ", data);
  const res = await api.post("/api/department/create", data);
  console.log("create response →", res);
  return res.data;
};

export const updateDepartment = async (id, data) => {
  const res = await api.put(`/api/department/${id}`, data);
  console.log("update response →", res);
  return res.data;
};

export const deleteDepartment = async (id) => {
  const res = await api.delete(`/api/department/${id}`);
  console.log("delete response →", res);
  return res.data;
};
