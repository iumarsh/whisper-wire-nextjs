import {z} from 'zod'

const usernameValidation = z
    .string()
    .min(2, 'Username must be 2 characters long')
    .max(20, 'Username cannot be longer than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username must not contain special character')

export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email({message: 'Invalid email address'}),
    password: z.string().min(6, {message: 'Must be alteast 6 characters long'})
})