const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
// const verifyToken = require('../middlewares/verifyTokenAdmin'); // import middleware

// Login không cần xác thực
router.post('/login', employeeController.login);

//check token
// router.get('/me', verifyToken, employeeController.getCurrentEmployee);

// Check status cần xác thực token
router.get('/check-status', employeeController.checkEmployeeStatus);

// Các route CRUD nhân viên cần xác thực
router.get('/',  employeeController.getAllEmployees);
router.get('/:id',  employeeController.getEmployeeById);
router.post('/',  employeeController.createEmployee);
router.put('/:id',  employeeController.updateEmployee);
router.put('/block/:id',  employeeController.blockEmployee);

module.exports = router;
