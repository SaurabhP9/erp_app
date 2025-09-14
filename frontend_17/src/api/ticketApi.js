// src/api/ticketApi.js
import api from "./api";

export const getAllTickets = async () => {
  const res = await api.get("/api/ticket");
  return res.data;
};

export const createTicket = async (formData) => {
  const res = await api.post("/api/ticket/create", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};



export const updateTicket = async (id, ticketData) => {

  const res = await api.put(`/api/ticket/${id}`, ticketData, {
    headers: {
      "Content-Type": "multipart/form-data",
    }});

  return res.data;
};

export const deleteTicket = async (id) => {
  const res = await api.delete(`/api/ticket/${id}`);
  return res.data;
};

export const getReportTickets = async () => {
  const res = await api.get("/api/ticket/report");
  return res.data;
};

// src/api/ticketApi.js
export const getTicketsByUserId = async (userId) => {
  const res = await api.get(`/api/ticket/user/${userId}`);
  return res.data;
};

export const getTicketsByEmployeeId = async (empId) => {
  
  const res = await api.get(`/api/ticket/employee/${empId}`);
  return res.data;
};

export const getFilterTickets = async (filters) => {
  const res = await api.post("/api/ticket/report", filters);
  return res.data;
};

export const getHandoverTicketsByUser = async (userId) => {
  const res = await api.get(`/api/ticket/handover/by/${userId}`);
  return res.data;
};

export const deleteAttachment = async (ticketId, publicId) => {
  const res = await api.delete(
    `/api/ticket/${ticketId}/attachment/${encodeURIComponent(publicId)}`
  );
  return res.data;
};