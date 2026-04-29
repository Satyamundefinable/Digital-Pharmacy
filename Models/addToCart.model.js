import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    items : [
        {
            medicine : {
                type : mongoose.Schema.Types.ObjectId,
                ref : "Medicine",
                required : true
            },
            quantity : {
                type : Number,
                default : 0
            }
        }
    ]   
});

const cart = mongoose.model("Cart",cartSchema);
export default cart;