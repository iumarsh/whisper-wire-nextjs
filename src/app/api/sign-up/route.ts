import dbConnect from "@/lib/dbConnect";
import UserModel, { User } from "@/model/User";

import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";


export async function POST(request: Request) {
    await dbConnect();

    try {
        console.log("hekki asdas")
        const {email, password, username } = await request.json();
        const existingUserVerifiedByUsername = await UserModel.findOne({username, isVerified: true})
        if(existingUserVerifiedByUsername){
            return new Response(
                JSON.stringify({
                        success: false,
                        message: 'Username already taken',
                    }),
                    { status: 400 }
              );
        }
        const existingUserByEmail = await UserModel.findOne({email})
        let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        if(existingUserByEmail){
            if(existingUserByEmail.isVerified){
                return new Response(
                    JSON.stringify({
                            success: false,
                            message: 'User already exists with this email',
                        }),
                        { status: 400 }
                  ); 
            }else{
                const hashPassword = await bcrypt.hash(password, 10);
                existingUserByEmail.password = hashPassword;
                // existingUserByEmail.password = password;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000),
                await existingUserByEmail.save();
            }
        }else{
            const hashPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1) //can use this too
            let newUser = new UserModel({
                username,
                email,
                password: hashPassword,
                // password: password,
                verifyCode,
                verifyCodeExpiry: new Date(Date.now() + 3600000),
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            })

            await newUser.save()


        }
        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        )
        if(!emailResponse.success){
            return new Response(
                JSON.stringify({
                        success: false,
                        message: emailResponse.message,
                    }),
                    { status: 500 }
              );
        }
        return new Response(
            JSON.stringify({
                    success: true,
                    message: "User registered successfully. Please verify your email",
                }),
                { status: 200 }
          );


    } catch (error) {
        console.error("Error registering user", error)
        return new Response(
            JSON.stringify({
                    success: false,
                    message: 'Username is already taken',
                }),
                { status: 400 }
          );
    }
}