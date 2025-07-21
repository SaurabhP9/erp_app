import api from "./api";

export const getAllCategories = async () => {
  const res = await api.get("/api/category/all");
  return res.data;
};

export const createCategory = async (data) => {
  const res = await api.post("/api/category/create", data);
  console.log("response is ", res);
  return res.data;
};

export const updateCategory = async (id, data) => {
  const res = await api.put(`/api/category/${id}`, data);
  return res.data;
};

export const deleteCategory = async (id) => {
  const res = await api.delete(`/api/category/${id}`);
  console.log("delete resposne ", res);
  return res.data;
};
