import api from "./api"; // this is your axios instance

// Get all employees
export const getAllEmployees = async () =>
  (await api.get("/api/employee/")).data;

// Create employee
export const createEmployee = async (data) =>
  (await api.post("/api/employee/create", data)).data;

// Update employee by ID
export const updateEmployee = async (id, data) =>
  (await api.put(`/api/employee/${id}`, data)).data;

// Delete employee by ID
export const deleteEmployee = async (id) =>
  (await api.delete(`/api/employee/${id}`)).data;
