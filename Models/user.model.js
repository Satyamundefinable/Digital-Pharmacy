import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:
    {
        type: String
    },
    email:
    {
        type: String,
        required: true,
        unique: true

    },
    password:
    {
        type: String,
        required: true
    },
    otp:
    {
        type: String,
        default: ""
    },
    otpExpiryTime:
    {
        type: Date,
    },
    isVerified: 
    {
        type: Boolean,
        default: false
    }
})

const user = new mongoose.model("User", userSchema);

export default user;