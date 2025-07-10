import type { AuthRequest } from "@/middleware/auth";
import { User } from "@/models/User";
import type { Response } from "express";

/**
 * Check if a user exists in the database based on authentication token
 * @param req Request with user data from auth middleware
 * @param res Response object
 * @returns JSON response with exists boolean
 */
export const checkUserExists = async (req: AuthRequest, res: Response) => {
    try {
        // Auth middleware already checks if the token is valid and user exists
        // If we reach here, it means user exists and isn't banned
        
        // Return minimal user info - just existence confirmation
        return res.status(200).json({
            exists: true,
            userId: req.user._id
        });
    } catch (error) {
        console.error('Error checking user existence:', error);
        return res.status(500).json({ error: "Failed to check user existence" });
    }
}; 