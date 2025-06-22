import cloudinary from "@/lib/cloudnary";
import type { AuthRequest } from "@/middleware/auth";
import Message from "@/models/Message";
import type { Response } from "express";

export const sendMessage = async (req: AuthRequest, res: Response) => {
    try {
        const { text, image } = req.body
        const { id: receiverId } = req.params;
        const senderId = req.user._id.toString();
        
        let imageUrl = null;
        if (image) {
            const uploadUri = await cloudinary.uploader.upload(image);
            imageUrl = uploadUri.secure_url;
        }
        
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });
        await newMessage.save();


        res.status(201).json(newMessage);

    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
}