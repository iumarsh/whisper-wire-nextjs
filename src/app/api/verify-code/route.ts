import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { username, code } = await request.json();
        const decodedUser = decodeURIComponent(username)
        const user = await UserModel.findOne({
            username: decodedUser,
        })

        if(!user){
            return Response.json({
                        success: false,
                        message: 'User not found',
                    },
                    { status: 400 }
              );
        }
        const isCodeValid = user.verifyCode === code && new Date(user.verifyCodeExpiry) > new Date();
        if (!isCodeValid){
            return Response.json(
                    {
                        success: false,
                        message: 'Invalid code or code expired, Please signup again to get a valid code',
                    },
                    { status: 400 }
              );
        }
        user.isVerified = true;
        user.save();
        return Response.json({success: true, message: "User verified successfully"}, {status: 200})
        
    }catch(error){
        console.error("Error in verify-code route", error)
        return Response.json({success: false, message: "Error verifying user"}, {status: 500})
    }
}