import { apiRequest } from "./queryClient";
import type { RegisterData, LoginData, OtpData } from "@shared/schema";

export async function registerUser(data: RegisterData) {
  return await apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function loginUser(data: LoginData) {
  return await apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function verifyOTP(data: OtpData) {
  return await apiRequest("/api/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function resendOTP(userId: string, type: 'email' | 'sms' = 'email') {
  return await apiRequest("/api/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify({ userId, type }),
  });
}

export async function logoutUser() {
  return await apiRequest("/api/auth/logout", {
    method: "POST",
  });
}

export async function getCurrentUser() {
  return await apiRequest("/api/auth/user", {
    method: "GET",
  });
}
