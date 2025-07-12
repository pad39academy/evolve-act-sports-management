import bcrypt from "bcryptjs";
import { storage } from "../storage";
import { otpService } from "./otpService";
import type { InsertUser, LoginData } from "@shared/schema";

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async registerUser(userData: InsertUser): Promise<{ user: any; success: boolean }> {
    try {
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        throw new Error("User already exists with this email");
      }

      // Hash password
      const hashedPassword = await this.hashPassword(userData.password);

      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Generate and send OTP
      const otp = await otpService.createOTP(user.id, 'email');
      await otpService.sendOTPEmail(user.email, otp);

      // Also send SMS OTP if mobile number provided
      if (userData.mobileNumber) {
        const smsOtp = await otpService.createOTP(user.id, 'sms');
        await otpService.sendOTPSMS(userData.mobileNumber, smsOtp);
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          organization: user.organization,
          isVerified: user.isVerified,
        },
        success: true,
      };
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  async loginUser(loginData: LoginData): Promise<{ user: any; success: boolean }> {
    try {
      const user = await storage.getUserByEmail(loginData.email);
      if (!user) {
        throw new Error("Invalid email or password");
      }

      const isValidPassword = await this.comparePassword(loginData.password, user.password);
      if (!isValidPassword) {
        throw new Error("Invalid email or password");
      }

      if (user.isVerified !== "true") {
        throw new Error("Please verify your account first");
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          organization: user.organization,
          isVerified: user.isVerified,
        },
        success: true,
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async verifyAccount(userId: number, otp: string): Promise<boolean> {
    try {
      const isValidOtp = await otpService.verifyOTP(userId, otp);
      if (!isValidOtp) {
        return false;
      }

      // Mark user as verified
      await storage.updateUserVerification(userId, true);
      return true;
    } catch (error) {
      console.error("OTP verification error:", error);
      return false;
    }
  }
}

export const authService = new AuthService();
