import express, { urlencoded } from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv"
import connectDB from "./Configs/db.config.js";
import router from "./Routes/auth.routes.js";
import medicineRouter from "./Routes/medicine.routes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


//in-built middlewares
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))
app.options(/.*/, cors());
app.use(express.json());
app.use(cookieParser());


app.use(urlencoded({ extended: true, limit: "16kb" }));
//define api
app.use("/api/auth", router);
app.use("/api/medicines", medicineRouter);



// connectDB().then(() => {
//     app.listen(PORT, () => console.log("Server running on Port : ", PORT)
//     )
// })
//     .catch((error) => {
//         console.error("Error Occured while starting the server", error)
//     })

try {
    connectDB()
    .then(() => {
    app.listen(PORT, () => console.log("Server running on Port : ", PORT)
    )
})
    .catch((error) => {
        console.error("Error Occured while starting the server", error)
    })
} catch (error) {
    console.error("Unable to start the server",error);
}