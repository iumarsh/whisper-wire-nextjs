import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User, getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import mongoose from "mongoose";


export async function GET(request: Request){
    dbConnect();
    try {
        const session = await getServerSession(authOptions)
        const user: User = session?.user as User
        // const userId = user?._id;
        //on agreegate it doesn't work as userId is a string
        const userId = new mongoose.Types.ObjectId(user?._id)
        if (!session || session?.user) {
            return Response.json({ success: false, message: "Not Authenticated" }, { status: 401 })
        }
        const _user = await UserModel.aggregate([
            {$match: {id: userId}},
            {$unwind: "$messages"},
            {$sort: {"messages.createdAt": -1}},
            {$group: {_id: "$_id", messages: {$push: "$messages"}}}
        ])
        if(!_user || _user.length === 0){
            return Response.json({ success: false, message: "User not found" }, { status: 404 })
        }
        return Response.json({ success: true, messages: _user[0].messages }, { status: 200 })
        
    } catch (error) {
        
    }
}