import api from "./api";

// Fetch all comments for a ticket
export const getCommentsByTicket = async (ticketId) => {
  const userRole = localStorage.getItem("role");
  const res = await api.get(`/api/comments/${ticketId}?userRole=${userRole}`);
  return res.data;
};


// Create a new comment
export const createComment = async (data) => {
  console.log("Comment creation ", data);
  const res = await api.post("/api/comments", data);
  console.log("Comment creation  respinse ", res.data);
  return res.data;
};

// React to a comment (e.g. like/love)
export const reactToComment = async (commentId, reactionType) => {
  const res = await api.patch(`/api/comments/react/${commentId}`, {
    type: reactionType,
  });
  return res.data;
};

// Delete a comment
export const deleteComment = async (commentId) => {
  const res = await api.delete(`/api/comments/${commentId}`);
  return res.data;
};

// Update a comment
export const updateComment = async (commentId, updatedText) => {
  const res = await api.put(`/api/comments/${commentId}`, {
    comment: updatedText,
  });
  return res.data;
};
