import api from "./api";

export const getAllTimesheets = async () => {
    console.log(
        "fetching timesheet "
    );
  const res = await api.get("/api/timesheet/all");
  console.log("fetched -> ", res.data);
  return res.data;
};


// fetch timesheet for by userId based and trigger for client and employee.
export const getTimesheetByUserId = async (userId) => {
  const res = await api.get(`/api/timesheet/user/${userId}`);
  return res.data;
};


export const getTimesheetByEmployeeId = async (empId) => {
  console.log("sending empId is ",empId);
  const res = await api.get(`/api/timesheet/employee/${empId}`);
  console.log("TImesheet get response ", res.data);
  return res.data;
};

export const addTimesheet = async (formData) => {
  console.log("Submitting Timesheet data:", formData);

  try {
    const res = await api.post("/api/timesheet/add", formData);
    return res.data;
  } catch (err) {
    console.error("Failed to add timesheet:", err.response?.data || err.message);
    throw err;
  }
};
