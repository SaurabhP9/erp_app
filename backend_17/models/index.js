const mongoose = require("mongoose");

// Load all models
const User = require("./user");
const Employee = require("./employee");
const Project = require("./project");
const Department = require("./department");
const Status = require("./status");
const Priority = require("./priority");
const Organization = require("./organization");
const Parameter = require("./parameters");
const Category = require("./category");
const Ticket = require("./ticket");
const Log = require("./log");
const ActivityLog = require("./activityLog");
const Counter = require('./counters');


// Export as an object
module.exports = {
  mongoose,
  User,
  Employee,
  Project,
  Department,
  Status,
  Priority,
  Organization,
  Parameter,
  Category,
  Ticket,
  Log,
  Counter,
  ActivityLog,
};
