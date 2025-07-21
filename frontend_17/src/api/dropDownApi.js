import api from "./api";

export const getAllProjects = async () => {
  const res = await api.get("/api/project/all");
  return res.data;
};

export const getAllDepartments = async () => {
  const res = await api.get("/api/department/all");
  return res.data;
};

export const getAllCategories = async () => {
  const res = await api.get("/api/category/all");
  return res.data;
};

export const getAllPriorities = async () => {
  const res = await api.get("/api/priority/all");
  return res.data;
};
