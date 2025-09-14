import api from "./api";

export const getHomeSummary = async () => {
  const res = await api.get("/api/home/");
  return res.data;
};

export const getTicketSummaryByRole = async (role) => {
  const res = await api.get(`/api/home/${role}`);
  return res.data.userSummary;
};

export const getEmployeeTicketSummary = async (employeeId) => {
  if (!employeeId) throw new Error("User ID is required to fetch summary");

  try {
    const { data } = await api.get(`/api/home/emp/summary/${employeeId}`);
    return data?.ticketSummary || [];
  } catch (error) {
    console.error("Failed to fetch employee ticket summary:", error.response?.data || error.message);
    throw error;
  }
};