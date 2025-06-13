import { Router } from "express";
import type { Request, Response } from "express";
import { spotifyService } from "@/lib/spotify";
import { asyncHandler } from "@/handlers/errorHandler";
import { getCallback } from "@/fumctions/getCallback";
import { authenticate } from "@/middleware/auth";
import { getProfile } from "@/fumctions/getProfile";


const router = Router();
const spotify = new spotifyService();

router.get('/login', (req, res) => {
    const authUrl = spotify.getAuthUrl();
    res.redirect(authUrl);
});


router.get('/login/callback', asyncHandler(getCallback));


router.get('/profile/me', authenticate, asyncHandler(getProfile));

export default router;