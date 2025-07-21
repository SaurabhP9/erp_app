import api from "./api";

export const loginUser = async (email, password) => {
  try {
    const response = await api.post("/api/auth/login", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.log(error);
    const message = error.response?.data?.error || "Login failed";
    throw new Error(message);
  }
};
