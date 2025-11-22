const jwt = require('jsonwebtoken');

const generateToken = (customer) => {
  return jwt.sign(
    {
      id_customer: customer.id_customer,
      email: customer.email,
      name: customer.name,
      phone: customer.phone
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
  );
};

module.exports = generateToken;