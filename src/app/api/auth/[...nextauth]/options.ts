import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from 'bcryptjs'
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";


export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any, req): Promise<any> {
                dbConnect();
                try {
                    const user = await UserModel.findOne({
                        $or: [
                            { username: credentials.identifier }, //credentials.identifier can use this as well
                            { email: credentials.identifier }
                        ]
                    })
                    if (!user) {
                        throw new Error('User not found')
                    }
                    if (!user.isVerified) {
                        throw new Error('Please verify user before login')
                    }
                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)
                    if (isPasswordCorrect)
                        return user
                    else
                        throw new Error('Incorrect Password')
                } catch (error: any) {
                    throw new Error(error)
                }
            }
        })
    ],
    callbacks: {
        async session({ session, user, token }) {
            if(session){
                session.user._id = user._id?.toString()
                session.user.isVerified = user.isVerified
                session.user.isAcceptingMessage = user.isAcceptingMessage
                session.user.username = user.username
            }
            return session
          },
          async jwt({ token, user }) {
              if(user){
                  //try passing the complete user 
                  token._id = user._id?.toString()
                  token.isVerified = user.isVerified
                  token.isAcceptingMessage = user.isAcceptingMessage
                  token.username = user.username
                    //update token to get more info
              }
            return token
          }
      
    },
    pages: {
        signIn: '/sign-in' //need to check these
    },
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET
}