import { Schema, model, Types } from "mongoose";
import { ref, title } from "process";

interface IProduct {
    productId: Types.ObjectId;
    title: string;
    price: number;
    qty: number;
}

interface IAddress {
    fullName: string;
    phone: string;
    country: string;
    city: string;
    addressLine: string;
    zipCode: string;
}

export interface IOrder {
    userId: Types.ObjectId;
    products: IProduct[];
    address: IAddress;
    shippingMethod: "FREE" | "EXPRESS" | "SCHEDULE";
    shippingPrice: number;
    paymentMethod: "Card" | "PAYPAL";
    subtotal: number;
    tax: number;
    total: number;
    status: "PENDING" | "PAID" | "CANCELLED";
}

const orderSchema = new Schema<IOrder>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

        products: [
            {
                productId: { type: Schema.Types.ObjectId, ref: "Product" },
                title: String,
                price: Number,
                qty: Number
            }
        ],

        address: {
            fullName: String,
            phone: String,
            country: String,
            city: String,
            addressLine: String,
            zipCode: String
        },

        shippingMethod: {
            type: String,
            enum: ["FREE", "EXPRESS", "SCHEDULE"],
            default: "FREE"
        },

        shippingPrice: { type: Number, default: 0 },

        paymentMethod: {
            type: String,
            enum: ["CARD", "PAYPAL"]
        },

        subtotal: Number,
        tax: Number,
        total: Number,

        status: {
            type: String,
            enum: ["PENDING", "PAID", "CANCELLED"],
            default: "PENDING"
        }
    },
    { timestamps: true }
);

export default model<IOrder>("Order", orderSchema);