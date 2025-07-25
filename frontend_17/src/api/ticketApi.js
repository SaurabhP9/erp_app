// src/api/ticketApi.js
import api from "./api";

export const getAllTickets = async () => {
  const res = await api.get("/api/ticket");
  return res.data;
};

export const createTicket = async (formData) => {
  console.log("form data sending while creating", formData);
  const res = await api.post("/api/ticket/create", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  console.log("response is ", res.data);
  return res.data;
};



export const updateTicket = async (id, ticketData) => {
  console.log("form data sending while updating", ticketData);
  const res = await api.put(`/api/ticket/${id}`, ticketData);
  console.log("response while updating", res.data);
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
  console.log("handOver tickets for user ",res.data);
  return res.data;
};