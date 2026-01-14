import mongoose from "mongoose";

const productMetaSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  images: [String],
  colors: [String],
  storages: [String],

  specs: {
    display: String,
    cpu: String,
    camera: String,
    battery: String,
    memory: String
  },

  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 }

}, { timestamps: true });

export const ProductMeta = mongoose.model(
  "ProductMeta",
  productMetaSchema
);
