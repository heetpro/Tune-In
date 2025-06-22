import type { Request, Response } from "express";

export const getLogout = async (req: Request, res: Response) => {
    res.clearCookie('token');
        res.status(200).json({ message: 'Logged out successfully' })
};
