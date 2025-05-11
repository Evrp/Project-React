import mongoose from "mongoose";

const GmailSchema = new mongoose.Schema({
  email: String,
  genres: [String],
  subGenres: {
    type: Map,
    of: [String],
    default: {},
  },
});

export const Filter = mongoose.model("Filters", GmailSchema);
