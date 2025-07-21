import api from "./api";

export const getAllOrganizations = async () =>
  (await api.get("/api/setting/organization")).data;

export const getOrganizationById = async (id) =>
  (await api.get(`/api/setting/organization/${id}`)).data;

export const createOrganization = async (data) =>
  (await api.post("/api/setting/organization", data)).data;

export const updateOrganization = async (id, data) =>
  (await api.put(`/api/setting/organization/${id}`, data)).data;

export const deleteOrganization = async (id) =>
  (await api.delete(`/api/setting/organization/${id}`)).data;
