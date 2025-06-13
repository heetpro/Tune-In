import { getChat } from "@/fumctions/getChat";
import { getChats } from "@/fumctions/getChats";
import { getMessages } from "@/fumctions/getMessages";
import { asyncHandler } from "@/handlers/errorHandler";
import { authenticate } from "@/middleware/auth";
import { Router } from "express";


const router = Router();

router.get('/', authenticate, asyncHandler(getChats));
router.get('/chat', authenticate, asyncHandler(getChat));

router.get('/chat/:conversationId/messages', authenticate, asyncHandler(getMessages));

export default router;