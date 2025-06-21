import { Router } from "express";
import { authenticate } from "@/middleware/auth";
import { asyncHandler } from "@/handlers/errorHandler";
import { sendFriendRequest } from "@/functions/sendFriendRequest";
import { acceptFriendRequest } from "@/functions/acceptFriendRequest";
import { rejectFriendRequest } from "@/functions/rejectFriendRequest";
import { getFriends } from "@/functions/getFriends";
import { getFriendRequests } from "@/functions/getFriendRequests";
import { removeFriend } from "@/functions/removeFriend";
import { searchUsers } from "@/functions/searchUsers";

const router = Router();

router.get('/', authenticate, asyncHandler(getFriends));

router.get('/search', authenticate, asyncHandler(searchUsers));

router.get('/requests', authenticate, asyncHandler(getFriendRequests));

router.post('/request', authenticate, asyncHandler(sendFriendRequest));

router.put('/request/:requestId/accept', authenticate, asyncHandler(acceptFriendRequest));

router.put('/request/:requestId/reject', authenticate, asyncHandler(rejectFriendRequest));

router.delete('/:friendId', authenticate, asyncHandler(removeFriend));

export default router;