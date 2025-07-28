import api from "./api";

export const getAllProjects = async () => {
  const res = await api.get("/api/project/all");
  return res.data;
};

export const createProject = async (projectData) => {
  const res = await api.post("/api/project/create", projectData);
  return res.data;
};

export const updateProject = async (id, projectData) => {
  const res = await api.put(`/api/project/update/${id}`, projectData);
  return res.data;
};

export const deleteProject = async (id) => {
  const res = await api.delete(`/api/project/${id}`);
  return res.data;
};
