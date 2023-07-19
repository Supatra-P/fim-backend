import mongoose from "mongoose";

const UserSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            min: 2,
            max: 50,
        },
        email: {
            type: String,
            required: true,
            max: 50,
            unique: true
        },
        password: {
            type: String,
            required: true,
            min: 8,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;