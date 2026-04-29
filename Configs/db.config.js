import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_DB_URL}`)
            .then((res) => {
                console.log("mongoDB Connection Initialized");
                console.log(mongoose.connection.name);
            })
            .catch((error) => {
                console.log("Error Occured while Connecting To MongoDB",error);
                process.exit(1);
            })

    } catch (error) {
        console.error("Can not connect to Database",error);        
    }
}

export default connectDB