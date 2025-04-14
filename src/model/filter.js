
import mongoose from "mongoose";

const GmailSchema = new mongoose.Schema({

    email: String,

    genres: {
        type: [String],
        default: [],
    },
});

export const Filter = mongoose.model("Filters", GmailSchema);  
