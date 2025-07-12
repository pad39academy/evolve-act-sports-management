import { apiRequest } from "./queryClient";
import type { RegisterData, LoginData, OtpData } from "@shared/schema";

export async function registerUser(data: RegisterData) {
  const response = await apiRequest("POST", "/api/auth/register", data);
  return response.json();
}

export async function loginUser(data: LoginData) {
  const response = await apiRequest("POST", "/api/auth/login", data);
  return response.json();
}

export async function verifyOTP(data: OtpData) {
  const response = await apiRequest("POST", "/api/auth/verify-otp", data);
  return response.json();
}

export async function resendOTP(userId: string, type: 'email' | 'sms' = 'email') {
  const response = await apiRequest("POST", "/api/auth/resend-otp", { userId, type });
  return response.json();
}

export async function logoutUser() {
  const response = await apiRequest("POST", "/api/auth/logout");
  return response.json();
}

export async function getCurrentUser() {
  const response = await apiRequest("GET", "/api/auth/user");
  return response.json();
}
