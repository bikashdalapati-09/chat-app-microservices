import mongoose from "mongoose";

const connectDB = async() => {
    const url = process.env.MONGO_URI;

    if(!url){
        throw new Error("MONGO_URI is not defined in env file")
    }

    try {
        await mongoose.connect(url, {
            dbName: "Chatappmicroservices"
        })
        console.log("DB connected successfully")
    } catch (error) {
        console.error("Failed to connect DB", error)
        process.exit(1);
    }
}

export default connectDB