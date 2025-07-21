import api from "./api"; 

export const getAllUsers = async () => {
  const res = await api.get("/api/user/all");
  return res.data;
};
export const getAllUsersByRole = async (role) => {
  const res = await api.get(`/api/user/by-role/${role}`);
  return res.data;
}

export const createUser = async (userData) => {
    console.log("user data -..",userData)
  const res = await api.post("/api/user/create", userData);
  console.log("response os _>",res.data);
  return res.data;
};

export const updateUser = async (id, userData) => {
  console.log("updateing user -> ", userData);
  const res = await api.put(`/api/user/${id}`, userData);
  console.log("response after updating ",res);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await api.delete(`/api/user/${id}`);
  return res.data;
};

//change password for employee and client role.
export const changePassword = async (oldPassword, newPassword) => {
  const res = await api.post("/api/user/change-password", {
    oldPassword,
    newPassword
  });
  return res.data;
};
