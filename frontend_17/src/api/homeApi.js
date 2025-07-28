import api from "./api";

export const getHomeSummary = async () => {
  console.log("ADmin calling...")
  const res = await api.get("/api/home/");
  console.log("ADmin ", res.data);
  return res.data;
};

export const getTicketSummaryByRole = async (role) => {
  console.log("ADmin calling...");
  const res = await api.get(`/api/home/${role}`);
  console.log("employee ", res.data);
  return res.data.userSummary;
};