const express = require('express');
const router = express.Router();
const { GetAllUsers, CreateUser, CreateExercise, GetUserLogs, DeleteUser, DeleteExercise } = require("../controllers/activity.controller.js");

// get all users
router.get('/', GetAllUsers);
// create new user
router.post('/', CreateUser);
// create new exercise
router.post('/:id/exercises', CreateExercise);
// get user logs
router.get('/:id/logs', GetUserLogs);
// delete a user (cascades to their exercises)
router.delete('/:id', DeleteUser);
// delete a single exercise for a user
router.delete('/:id/exercises/:exerciseId', DeleteExercise);

// export module
module.exports = router;