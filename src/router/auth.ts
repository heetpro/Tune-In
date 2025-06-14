import { Router } from "express";
import type { Request, Response } from "express";
import { spotifyService } from "@/lib/spotify";
import { asyncHandler } from "@/handlers/errorHandler";
import { getCallback } from "@/functions/getCallback";
import { authenticate } from "@/middleware/auth";
import { getProfile } from "@/functions/getProfile";
import { setUsername } from "@/functions/setUsername";
import { checkOnboarding } from "@/functions/checkOnboarding";

const router = Router();
const spotify = new spotifyService();

router.get('/spotify/login', (req, res) => {
    const authUrl = spotify.getAuthUrl();
    res.redirect(authUrl);
});

router.get('/spotify/callback', asyncHandler(getCallback));

router.get('/profile/me', authenticate, asyncHandler(getProfile));

// Username and onboarding routes
router.post('/username', authenticate, asyncHandler(setUsername));
router.get('/onboarding', authenticate, asyncHandler(checkOnboarding));

export default router;