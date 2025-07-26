import { Router } from "express";
import type { Request, Response } from "express";
import { spotifyService } from "@/lib/spotify";
import { asyncHandler } from "@/handlers/errorHandler";
import { getCallback } from "@/functions/getCallback";
import { authenticate } from "@/middleware/auth";
import { getProfile } from "@/functions/spotify/getProfile";
import { setUsername } from "@/functions/setUsername";
import { checkOnboarding } from "@/functions/checkOnboarding";
import { sendFriendRequest } from "@/functions/sendFriendRequest";
import { acceptFriendRequest } from "@/functions/acceptFriendRequest";
import { rejectFriendRequest } from "@/functions/rejectFriendRequest";
import { getFriends } from "@/functions/getFriends";
import { getFriendRequests } from "@/functions/getFriendRequests";
import { removeFriend } from "@/functions/removeFriend";
import { searchUsers } from "@/functions/searchUsers";
import { getLogout } from "@/functions/getLogout";
import { getMessages } from "@/functions/socket/getMessages";
import { getUsersToChat } from "@/functions/socket/getUsersToChat";
import { sendMessage } from "@/functions/socket/sendMessage";
import { syncSpotifyData } from "@/functions/spotify/syncSpotifyData";
import { getMusicProfile } from "@/functions/spotify/getMusicProfile";
import { getTopArtists } from "@/functions/spotify/getTopArtists";
import { getTopTracks } from "@/functions/spotify/getTopTracks";
import { getRecentTracks } from "@/functions/spotify/getRecentTracks";
import { getPlaylists } from "@/functions/spotify/getPlaylists";
import { getCurrentTrack } from "@/functions/spotify/getCurrentTrack";
import { getTopGenres } from "@/functions/spotify/getTopGenres";
import { getAudioFeatures } from "@/functions/spotify/getAudioFeatures";
import { checkUserExists } from "@/functions/checkUserExists";
import { editProfile } from "@/functions/editProfile";
import { getUserProfile } from "@/functions/user/getUserProfile";
import { getMyProfile } from "@/functions/spotify/getMyProfile";

const router = Router();
const spotify = new spotifyService();

router.get('/spotify/login', (req, res) => {
    const authUrl = spotify.getAuthUrl();
    res.redirect(authUrl);
});

router.post('/logout', asyncHandler(getLogout));
router.get('/spotify/callback', asyncHandler(getCallback));
router.get('/profile/me', authenticate, asyncHandler(getProfile));
router.get('/profile/:id', authenticate, asyncHandler(getUserProfile));


router.get('/auth/check', authenticate, asyncHandler(checkUserExists));
router.post('/username', authenticate, asyncHandler(setUsername));
router.post('/profile/edit', authenticate, asyncHandler(editProfile));

router.get('/onboarding', authenticate, asyncHandler(checkOnboarding));

router.get('/messages/users', authenticate, asyncHandler(getUsersToChat));
router.get('/messages/:id', authenticate, asyncHandler(getMessages));

router.post('/messages/send/:id', authenticate, asyncHandler(sendMessage));

router.get('/spotify/sync', authenticate, asyncHandler(syncSpotifyData));
router.get('/spotify/profile', authenticate, asyncHandler(getMyProfile));
router.get('/spotify/profile/:id', authenticate, asyncHandler(getMusicProfile));
router.get('/spotify/top-artists', authenticate, asyncHandler(getTopArtists));
router.get('/spotify/top-tracks', authenticate, asyncHandler(getTopTracks));
router.get('/spotify/recent-tracks', authenticate, asyncHandler(getRecentTracks));
router.get('/spotify/playlists', authenticate, asyncHandler(getPlaylists));
router.get('/spotify/current-track', authenticate, asyncHandler(getCurrentTrack));
router.get('/spotify/top-genres', authenticate, asyncHandler(getTopGenres));
router.get('/spotify/audio-features', authenticate, asyncHandler(getAudioFeatures));


router.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});


router.get('/friends', authenticate, asyncHandler(getFriends));
router.get('/search', authenticate, asyncHandler(searchUsers));
router.get('/requests', authenticate, asyncHandler(getFriendRequests));
router.post('/request', authenticate, asyncHandler(sendFriendRequest));
router.put('/request/:requestId/accept', authenticate, asyncHandler(acceptFriendRequest));
router.put('/request/:requestId/reject', authenticate, asyncHandler(rejectFriendRequest));
router.delete('/:friendId', authenticate, asyncHandler(removeFriend));

export default router;