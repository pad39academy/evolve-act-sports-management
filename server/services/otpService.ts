import { storage } from "../storage";
import type { InsertOtp } from "@shared/schema";

export class OTPService {
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async createOTP(userId: number, type: 'email' | 'sms'): Promise<string> {
    // Check if there's already a valid OTP for this user
    const existingOtp = await storage.getValidOtpForUser(userId);
    
    if (existingOtp) {
      // Return the existing OTP
      console.log(`Using existing OTP for user ${userId}: ${existingOtp.otp}`);
      return existingOtp.otp;
    }

    const otp = this.generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5); // OTP expires in 5 minutes

    const otpData: InsertOtp = {
      userId,
      otp,
      type: 'both', // Use 'both' to indicate it works for both email and SMS
      expiresAt,
    };

    await storage.createOtp(otpData);
    
    // Developer mode: Log OTP to console
    console.log(`Generated OTP for user ${userId}: ${otp}`);
    
    return otp;
  }

  async verifyOTP(userId: number, otp: string): Promise<boolean> {
    const otpRecord = await storage.getValidOtp(userId, otp);
    
    if (!otpRecord) {
      return false;
    }

    // Mark OTP as used
    await storage.markOtpAsUsed(otpRecord.id);
    
    return true;
  }

  async sendOTPEmail(email: string, otp: string): Promise<void> {
    // Developer mode: Just log to console
    console.log(`Email OTP to ${email}: ${otp}`);
    
    // TODO: Implement actual email sending with Nodemailer
    // const transporter = nodemailer.createTransporter({...});
    // await transporter.sendMail({
    //   to: email,
    //   subject: 'Evolve Act - Account Verification',
    //   html: `Your verification code is: <strong>${otp}</strong>`
    // });
  }

  async sendOTPSMS(phoneNumber: string, otp: string): Promise<void> {
    // Developer mode: Just log to console
    console.log(`SMS OTP to ${phoneNumber}: ${otp}`);
    
    // TODO: Implement Twilio integration
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //   body: `Your Evolve Act verification code is: ${otp}`,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phoneNumber
    // });
  }
}

export const otpService = new OTPService();
