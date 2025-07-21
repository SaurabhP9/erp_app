const Log = require("../models/Log");

async function createLog({ loginId, action, ip, userAgent }) {
  await Log.create({
    loginId,
    loginTime: new Date().toISOString(),
    loginIP: ip,
    loginUserAgent: userAgent
  });
}
