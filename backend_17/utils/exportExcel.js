const ExcelJS = require("exceljs");

exports.generateExcel = async (tickets) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Tickets");

  sheet.columns = [
    { header: "Ticket No", key: "ticketNo" },
    { header: "Description", key: "description" },
    { header: "Project", key: "project" },
    { header: "Category", key: "category" },
    { header: "Priority", key: "priority" },
    { header: "Status", key: "status" },
    { header: "User Name", key: "userName" },
    { header: "Email", key: "userEmail" },
    { header: "Assigned To", key: "assignedTo" },
    { header: "Created At", key: "createdAt" },
  ];

  tickets.forEach((ticket) => sheet.addRow(ticket));
  return await workbook.xlsx.writeBuffer();
};