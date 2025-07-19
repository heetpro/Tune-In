import type { AuthRequest } from "@/middleware/auth";
import type { Response } from "express";

export const editProfile = async (req: AuthRequest, res: Response) => {
    const { username, displayName, profilePicture, bio, age, gender, intrestedIn, location } = req.body;
    const user = req.user;
    
    // Only update fields that are provided in the request
    if (username !== undefined) user.username = username;
    if (displayName !== undefined) user.displayName = displayName;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (bio !== undefined) user.bio = bio;
    if (age !== undefined) user.age = age;
    if (gender !== undefined) user.gender = gender;
    if (intrestedIn !== undefined) user.intrestedIn = intrestedIn;
    if (location !== undefined) user.location = location;
    
    await user.save();
    return res.status(200).json({ message: "Profile updated successfully" });
}