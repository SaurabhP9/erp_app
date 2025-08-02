import api from "./api";

export const getAllTimesheets = async () => {
  const res = await api.get("/api/timesheet/all");

  return res.data;
};

// fetch timesheet for by userId based and trigger for client and employee.
export const getTimesheetByUserId = async (userId) => {
  const res = await api.get(`/api/timesheet/user/${userId}`);
  return res.data;
};

export const getTimesheetByEmployeeId = async (empId) => {
  const res = await api.get(`/api/timesheet/employee/${empId}`);
  return res.data;
};

export const addTimesheet = async (formData) => {
  try {
    console.log(formData);
    const res = await api.post("/api/timesheet/add", formData);
    console.log("Res", res.data);
    return res.data;
  } catch (err) {
    console.error(
      "Failed to add timesheet:",
      err.response?.data || err.message
    );
    throw err;
  }
};
