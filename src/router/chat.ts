import { getChat } from "@/fumctions/getChat";
import { getChats } from "@/fumctions/getChats";
import { getMessages } from "@/fumctions/getMessages";
import { readMessages } from "@/fumctions/readMessages";
import { asyncHandler } from "@/handlers/errorHandler";
import { authenticate } from "@/middleware/auth";
import { Router } from "express";


const router = Router();

router.get('/', authenticate, asyncHandler(getChats));
router.post('/chat', authenticate, asyncHandler(getChat));

router.get('/chat/:conversationId/messages', authenticate, asyncHandler(getMessages));

router.patch('/chat/:conversationId/read', authenticate, asyncHandler(readMessages));

export default router;