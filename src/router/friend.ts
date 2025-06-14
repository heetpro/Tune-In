import { Router } from "express";
import { authenticate } from "@/middleware/auth";
import { asyncHandler } from "@/handlers/errorHandler";
import { sendFriendRequest } from "@/functions/sendFriendRequest";
import { acceptFriendRequest } from "@/functions/acceptFriendRequest";
import { rejectFriendRequest } from "@/functions/rejectFriendRequest";
import { getFriends } from "@/functions/getFriends";
import { getFriendRequests } from "@/functions/getFriendRequests";
import { removeFriend } from "@/functions/removeFriend";

const router = Router();

// Get all friends
router.get('/', authenticate, asyncHandler(getFriends));

// Get all friend requests (incoming and outgoing)
router.get('/requests', authenticate, asyncHandler(getFriendRequests));

// Send a friend request
router.post('/request', authenticate, asyncHandler(sendFriendRequest));

// Accept a friend request
router.put('/request/:requestId/accept', authenticate, asyncHandler(acceptFriendRequest));

// Reject a friend request
router.put('/request/:requestId/reject', authenticate, asyncHandler(rejectFriendRequest));

// Remove a friend
router.delete('/:friendId', authenticate, asyncHandler(removeFriend));

export default router; 