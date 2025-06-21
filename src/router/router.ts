import { Router } from "express";
import type { Request, Response } from "express";
import { spotifyService } from "@/lib/spotify";
import { asyncHandler } from "@/handlers/errorHandler";
import { getCallback } from "@/functions/getCallback";
import { authenticate } from "@/middleware/auth";
import { getProfile } from "@/functions/getProfile";
import { setUsername } from "@/functions/setUsername";
import { checkOnboarding } from "@/functions/checkOnboarding";
import { sendFriendRequest } from "@/functions/sendFriendRequest";
import { acceptFriendRequest } from "@/functions/acceptFriendRequest";
import { rejectFriendRequest } from "@/functions/rejectFriendRequest";
import { getFriends } from "@/functions/getFriends";
import { getFriendRequests } from "@/functions/getFriendRequests";
import { removeFriend } from "@/functions/removeFriend";
import { searchUsers } from "@/functions/searchUsers";

const router = Router();
const spotify = new spotifyService();

router.get('/spotify/login', (req, res) => {
    const authUrl = spotify.getAuthUrl();
    res.redirect(authUrl);
});

router.get('/spotify/callback', asyncHandler(getCallback));
router.get('/profile/me', authenticate, asyncHandler(getProfile));
router.post('/username', authenticate, asyncHandler(setUsername));
router.get('/onboarding', authenticate, asyncHandler(checkOnboarding));

router.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});


router.get('/', authenticate, asyncHandler(getFriends));
router.get('/search', authenticate, asyncHandler(searchUsers));
router.get('/requests', authenticate, asyncHandler(getFriendRequests));
router.post('/request', authenticate, asyncHandler(sendFriendRequest));
router.put('/request/:requestId/accept', authenticate, asyncHandler(acceptFriendRequest));
router.put('/request/:requestId/reject', authenticate, asyncHandler(rejectFriendRequest));
router.delete('/:friendId', authenticate, asyncHandler(removeFriend));

export default router;