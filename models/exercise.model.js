const Mongose = require('mongoose');

const ExerciseSchema = Mongose.Schema(
    {
        user_id: { type: String, require: true},
        description : String,
        duration: Number,
        date: Date,
    }
);

const Exercise = Mongose.model("Exercise", ExerciseSchema);
module.exports = Exercise;