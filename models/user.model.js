const Mongose = require('mongoose');

const UserSchema = Mongose.Schema(
    {
        username: String,
    }
);

const User = Mongose.model("User", UserSchema);
module.exports = User;