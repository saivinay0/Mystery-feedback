import {z} from 'zod';

export const usernamevalidation = z.string().min(3,"username must of 3 characters").max(20);

export const signUpSchema = z.object({
    username: usernamevalidation,
    email: z.string().email({message: "Invalid email"}),
    password: z.string().min(8,{message: "password must be of 8 characters"}),
})