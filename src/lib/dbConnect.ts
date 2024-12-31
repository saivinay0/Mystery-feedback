import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number;
};

const connection: ConnectionObject = {};

const dbConnect = async () => {
    if (connection.isConnected) {
        console.log("Using existing connection");
        return;
    }
    try{
        const db = await mongoose.connect(process.env.MONGO_URI || "",{});

    connection.isConnected = db.connections[0].readyState;
    }
    catch(err){
        console.log(err);
        process.exit(1);
    }

    
};
export default dbConnect;