const User = require('../models/user.model.js');
const Exercise = require('../models/exercise.model.js');


// Get all users info app.get('/api/users',
const GetAllUsers = async (req, res) => {
    const users = await User.find({}).select("_id username");
    if (!users) {
        res.send("No users");
    } else {
        res.json(users);
    }
}

// Create new user into Database   app.post('/api/users',
const CreateUser = async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Crate new exercise tracker app.post('/api/users/:_id/exercises',
const CreateExercise = async (req, res) => {
    const id = req.params.id;
    const { description, duration, date } = req.body;

    try {
        const user = await User.findById(id);
        if (!user) {
            res.send("Could not find user");
        } else {
            const excerciseObj = new Exercise({
                user_id: user._id,
                description,
                duration,
                date: date ? new Date(date) : new Date()
            })
            const exercise = await excerciseObj.save();
            res.json({
                _id: user._id,
                username: user.username,
                description: exercise.description,
                duration: exercise.duration,
                date: new Date(exercise.date).toDateString()
            });
        }
    } catch (error) {
        console.log(error);
        res.send("There was an error saving the exercise");
    }
}

// Get user logs 
const GetUserLogs = async (req, res) => {

    // create querry and select user
    const { from, to, limit } = req.query;
    const { id } = req.params;
    const user = await User.findById(id);

    // check user status
    if (!user) {
        res.send("Could not find user")
        return;
    }

    // add querry on user logs
    let dateObj = {}
    if (from) {
        dateObj["$gte"] = new Date(from)
    }
    if (to) {
        dateObj["$lte"] = new Date(to)
    }
    let filter = {
        user_id: id
    }
    if (from || to) {
        filter.date = dateObj;
    }
    const exercises = await Exercise.find(filter).limit(+limit ?? 500);
    const log = exercises.map(e => ({
        _id: e._id,
        description: e.description,
        duration: e.duration,
        date: e.date.toDateString()
    }))

    // user logs respond
    res.json({
        username: user.username,
        count: exercises.length,
        _id: user._id,
        log
    });

}

// Delete a user and cascade-delete their exercises
const DeleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            res.status(404).json({ message: "Could not find user" });
            return;
        }
        await Exercise.deleteMany({ user_id: id });
        res.status(200).json({ message: "User and their exercises deleted", _id: user._id, username: user.username });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Delete a single exercise entry belonging to a user
const DeleteExercise = async (req, res) => {
    const { id, exerciseId } = req.params;

    try {
        const exercise = await Exercise.findOneAndDelete({ _id: exerciseId, user_id: id });
        if (!exercise) {
            res.status(404).json({ message: "Could not find exercise for this user" });
            return;
        }
        res.status(200).json({ message: "Exercise deleted", _id: exercise._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Edit a user's username (rejects duplicates against other users)
const EditUser = async (req, res) => {
    const { id } = req.params;
    const { username } = req.body;

    if (!username) {
        res.status(400).json({ message: "Username is required" });
        return;
    }

    try {
        const existing = await User.findOne({ username, _id: { $ne: id } });
        if (existing) {
            res.status(409).json({ message: "That username is already taken" });
            return;
        }

        const user = await User.findByIdAndUpdate(id, { username }, { new: true });
        if (!user) {
            res.status(404).json({ message: "Could not find user" });
            return;
        }
        res.status(200).json({ _id: user._id, username: user.username });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Edit an existing exercise entry belonging to a user
const EditExercise = async (req, res) => {
    const { id, exerciseId } = req.params;
    const { description, duration, date } = req.body;

    const update = {};
    if (description !== undefined) update.description = description;
    if (duration !== undefined) update.duration = duration;
    if (date !== undefined) update.date = new Date(date);

    try {
        const exercise = await Exercise.findOneAndUpdate(
            { _id: exerciseId, user_id: id },
            update,
            { new: true }
        );
        if (!exercise) {
            res.status(404).json({ message: "Could not find exercise for this user" });
            return;
        }
        res.status(200).json({
            _id: exercise._id,
            description: exercise.description,
            duration: exercise.duration,
            date: new Date(exercise.date).toDateString()
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// export function
module.exports = {
    GetAllUsers,
    CreateUser,
    CreateExercise,
    GetUserLogs,
    DeleteUser,
    DeleteExercise,
    EditUser,
    EditExercise
}