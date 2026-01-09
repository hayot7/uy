import { Request, Response } from "express";
import { User } from "../models/user.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        const exist = await User.findOne({ email });
        if (exist) return res.status(400).json({ msg: "User already exists" });

        const hash = await bcrypt.hash(password, 10);

        const user = await User.create({ name, email, password: hash });

        res.json({ msg: "Account created", user });
    } catch (error) {
        res.status(500).json(error);
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Invalid email" });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ msg: "Invalid password" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string);

        res.json({ msg: "Login successful", token });
    } catch (error) {
        res.status(500).json(error);
    }
};

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRES = "7d";

export const registerWithToken = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ msg: "name, email and password required" });

    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ msg: "User already exists" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.status(201).json({ msg: "Account created", user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (error) {
    console.error("registerWithToken error:", error);
    res.status(500).json({ msg: "Server error", error });
  }
};

export const loginWithToken = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: "email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid email or password" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ msg: "Invalid email or password" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.json({ msg: "Login successful", token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error("loginWithToken error:", error);
    res.status(500).json({ msg: "Server error", error });
  }
};