import api from "./api";

export const sendTicketEmail = async (emailPayload) => {
  try {
    const res = await api.post("/api/email/send-email", emailPayload);
    return res.data;
  } catch (error) {
    console.error("Email API failed:", error);
    throw error;
  }
};
