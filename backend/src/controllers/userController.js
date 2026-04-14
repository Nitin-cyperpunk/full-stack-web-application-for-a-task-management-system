const User = require('../models/User');

async function listUsers(req, res) {
  const users = await User.find().select('email role').sort({ email: 1 }).lean();
  const data = users.map((u) => ({
    id: String(u._id),
    email: u.email,
    role: u.role,
  }));
  res.json({ data });
}

module.exports = { listUsers };
