import dbConnect from "@/lib/dbConnect";
import {z} from 'zod'
import UserModel from "@/model/User";
import { usernameValidation } from "@/schema/signUpSchema";


const UserNameQuerySchema = z.object({
    username: usernameValidation
})
export async function GET(request: Request) {
    //you can use this to restrict the method to only GET for previous next versions
    // if(request.method !== 'GET'){
    //     return Response.json({success: false, message: "Method not allowed"}, {status: 405})
    // }
    await dbConnect()
    try {
        const {searchParams}  = new URL(request.url);
        // const {username} = UserNameQuerySchema.parse(searchParams)
        const queryParams = {
            username: searchParams.get('username')
        }
        //validate username using zod
        const result = UserNameQuerySchema.safeParse(queryParams)
        if(!result.success){
            const usernameError = result.error.format().username?._errors || []
            return Response.json({
                    success: false, 
                    message: usernameError?.join(", ") || "Invalid query parameters"
                }, 
                {status: 400}
            )
        }
        const {username} = result.data;
        const existingVerifiedUser = await UserModel.findOne({username, isVerified: true})
        if (existingVerifiedUser){
            return Response.json({success: false, message: "Username already taken"}, {status: 400})
        }
        return Response.json({success: true, message: "Username is unique"}, {status: 200})

    } catch (error) {
        console.error("Error in check-username-unique route", error)
        return Response.json({success: false, message: "Error checking username"}, {status: 500})
    }
}