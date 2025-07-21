import api from "./api";

export const getHomeSummary = async () => {
  const res = await api.get("/api/home/");
  console.log(res.data);
  return res.data;
};

export const getTicketSummaryByRole = async (role) => {
  const res = await api.get(`/api/home/${role}`);
  return res.data.userSummary;
};
