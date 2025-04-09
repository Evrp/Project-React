import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: String,
  image: String,
  price: String,
  link: String,
  createdAt: { type: Date, default: Date.now }
});

export const Product = mongoose.model("Product", ProductSchema);
