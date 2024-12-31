import {z} from 'zod';

export const messageSchema = z.object({
    message: z.string().min(10,"message must be of 10 characters").max(300,"message must be of 300 characters")
})