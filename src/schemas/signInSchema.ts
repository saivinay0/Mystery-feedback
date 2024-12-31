import {z} from 'zod';

export const signInSchema = z.object({
    identifier: z.string().min(3,"identifier must of 3 characters").max(20),
    password: z.string().min(8,{message: "password must be of 8 characters"}),
})