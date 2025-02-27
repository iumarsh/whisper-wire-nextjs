import { resend } from "@/lib/resend";
import { ApiResponse } from "@/types/ApiResponse";
import VerificationEmail from "../../emails/VerificationEmail";

export const sendVerificationEmail = async (
    email : string,
    username: string,
    verifyCode: string
): Promise<ApiResponse> => {
    try {
        debugger;
        await resend.emails.send({
            from: 'onboarding@resend.dev', //your domain
            to: email,
            subject: 'Whisper Wire | Verification Code',
            react: VerificationEmail({username, otp: verifyCode}),
          });
        return {success: true, message: "Verification email sent successfully!"}
          
    } catch (error) {
        return {success: false, message: "Failed to send verification email!"}
    }
}