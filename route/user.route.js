const express = require('express');
const router = express.Router();
const { GetAllUsers, CreateUser, CreateExercise, GetUserLogs } = require("../controllers/activity.controller.js");

// get all users
router.get('/', GetAllUsers);
// create new user
router.post('/', CreateUser);
// create new exercise
router.post('/:id/exercises', CreateExercise);
// get user logs
router.get('/:id/logs', GetUserLogs);

// export module
module.exports = router;