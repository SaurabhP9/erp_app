// export default function Help() {
//   return <div>Help Page</div>;
// }
import React from "react";
import { Container, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const helpTopics = [
  {
    title: "How to Submit a Ticket",
    content:
      "Go to the 'Ticket' tab and click 'Add Ticket'. Fill out the required fields and click Submit. You can also upload attachments if needed."
  },
  {
    title: "How to Add a New User",
    content:
      "Navigate to the 'User' tab and click on 'Add User'. Enter the necessary information including name, email, role, and save the entry."
  },
  {
    title: "Timesheet Entry Guide",
    content:
      "To add a timesheet, click on the 'Timesheet' tab, then 'Add Entry'. Select the project, task, date, and duration. Submit the entry."
  },
  {
    title: "Using the Dashboard",
    content:
      "The dashboard provides a quick overview of all ticket statuses, employee workload, and client activity. Use the Home tab for summary statistics."
  },
  {
    title: "Report Generation",
    content:
      "Use the 'Reports' tab to generate daily, weekly, or custom reports based on ticket, employee, or project filters."
  }
];

export default function Help() {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Help & User Guide
      </Typography>
      <Typography variant="body2" gutterBottom color="gray">
        Home -&gt; Help
      </Typography>

      {helpTopics.map((topic, index) => (
        <Accordion key={index} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">{topic.title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{topic.content}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Container>
  );
}
