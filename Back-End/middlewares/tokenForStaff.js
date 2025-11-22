const jwt = require('jsonwebtoken');

const generateEmployeeToken = (employee) => {
  return jwt.sign(
    {
      id_employee: employee.id_employee,
      email: employee.email,
      name: employee.name,
      phone: employee.phone,
      role: employee.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

module.exports = generateEmployeeToken;
