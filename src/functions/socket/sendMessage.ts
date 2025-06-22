import type { AuthRequest } from "@/middleware/auth";
import cloudinary from "@/lib/cloudinary";

export const sendMessage = async (req: AuthRequest, res: Response) => {
    try {
        const { text, image } = req.body
        const { id: receiverId } = req.params;
        const senderId = req.user._id.toString();
        
        let imageUrl = null;
        if (image) {
            const imageUrl = await cloudinary.uploader.upload(image, {
                resource_type: 'image',
                folder: 'messages',
            });
        }
        

    } catch (error) {
        
    }
}