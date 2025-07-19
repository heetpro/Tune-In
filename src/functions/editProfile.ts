import type { AuthRequest } from "@/middleware/auth";
import type { Response } from "express";

export const editProfile = async (req: AuthRequest, res: Response) => {
    const { username, displayName, profilePicture, bio, age, gender, intrestedIn, location } = req.body;
    const user = req.user;
    user.username = username;
    user.displayName = displayName;
    user.profilePicture = profilePicture;
    user.bio = bio;
    user.age = age;
    user.gender = gender;
    user.intrestedIn = intrestedIn;
    user.location = location;
    await user.save();
    return res.status(200).json({ message: "Profile updated successfully" });
}