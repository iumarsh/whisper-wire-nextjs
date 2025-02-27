import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User, getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST(request: Request) {
    dbConnect();
    try {
        const session = await getServerSession(authOptions)
        const user : User = session?.user as User
        const { acceptMessages } = await request.json();
        const userId = user?._id;
        if(!session || session?.user){
            return Response.json({success:false, message: "Not Authenticated"}, {status: 401})
        }
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { isAcceptingMessage: acceptMessages },
            {new: true}
        )
        if (!updatedUser){
            return Response.json({success:false, message: "Failed to update the acceptance status"}, {status: 400})
        }
        return Response.json({success:true, message: "Messages acceptance status"}, {status: 200})

    } catch (error) {
        return Response.json({success:false, message: "Error accepting messages"}, {status: 500})
    }
}

export async function GET(request: Request) {
    dbConnect();
    try {
        const session = await getServerSession(authOptions);
        const user : User = session?.user as User
        const userId = user?._id;
        if (!session || session?.user) {
            return Response.json({ success: false, message: "Not Authenticated" }, { status: 401 })
        }
        const foundUser = await UserModel.findById(userId)
        if (!foundUser) {
            return Response.json({ success: false, message: "User not found" }, { status: 404 })
        }
        return Response.json({ success: true, isAcceptingMessage: foundUser.isAcceptingMessage }, { status: 200 })
    } catch (error) {
        return Response.json({ success: false, message: "Error accepting messages" }, { status: 500 })
    }
}