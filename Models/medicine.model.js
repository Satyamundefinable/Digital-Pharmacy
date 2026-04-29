import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
    medicineName: {
        type: String,
        required: true,
    },
    companyName: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    form: {
        type: String,
        required: true,
    },
    price: {
        type: String,
        required: true,
    },
    prescription: {
        type: Boolean,
        default : true,
    },
    description: {
        type: String,
        default : ""
    },

}, { timestamps: true });
    
const medicine = mongoose.model("Medicine", medicineSchema)

export default medicine
