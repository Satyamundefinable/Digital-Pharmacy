import express from "express"
import { addToCart, getCartMedicines, showMedicines } from "../Controllers/medicine.controller.js";
import userAuth from "../Middlewares/userAuth.middleware.js";

const medicineRouter = express.Router();

medicineRouter.get("/medicine",showMedicines);
medicineRouter.post("/add-medicine", userAuth, addToCart);
medicineRouter.get("/get-cart", userAuth, getCartMedicines);


export default medicineRouter