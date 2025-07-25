import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Shield, ArrowLeft, Mail, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { verifyOTP, resendOTP } from "@/lib/auth";

export default function OTPVerification() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes
  const [activeTab, setActiveTab] = useState("email");
  const [generatedOTP, setGeneratedOTP] = useState(""); // Developer mode

  // Extract userId from URL params using window.location.search
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get("userId");



  useEffect(() => {
    if (!userId) {
      setLocation("/register");
      return;
    }

    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [userId, setLocation]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    
    if (otpString.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter all 6 digits.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyOTP({ otp: otpString, userId: userId! });
      if (result.success) {
        toast({
          title: "Account Verified",
          description: "Your account has been successfully verified!",
        });
        setLocation("/login");
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid or expired OTP.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async (type: 'email' | 'sms' = 'email') => {
    try {
      const result = await resendOTP(userId!, type);
      if (result.success) {
        toast({
          title: "OTP Sent",
          description: `A new OTP has been sent to your ${type === 'email' ? 'email' : 'mobile number'}.`,
        });
        setTimer(300); // Reset timer
      }
    } catch (error: any) {
      toast({
        title: "Resend Failed",
        description: error.message || "Failed to resend OTP.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <Card className="shadow-xl">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-white h-8 w-8" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Account</h2>
              <p className="text-gray-600">We've sent verification codes to both your email and mobile number</p>
            </div>

            {/* Verification Method Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
              <Button
                type="button"
                variant={activeTab === "email" ? "default" : "ghost"}
                onClick={() => setActiveTab("email")}
                className="flex-1 flex items-center gap-2 justify-center"
              >
                <Mail className="h-4 w-4" />
                Email
              </Button>
              <Button
                type="button"
                variant={activeTab === "sms" ? "default" : "ghost"}
                onClick={() => setActiveTab("sms")}
                className="flex-1 flex items-center gap-2 justify-center"
              >
                <Smartphone className="h-4 w-4" />
                SMS
              </Button>
            </div>

            {/* OTP Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center mb-4">
                <p className="text-gray-600">
                  Enter the OTP sent to your {activeTab === "email" ? "email address" : "mobile number"}
                </p>
              </div>

              {/* OTP Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter {activeTab === "email" ? "Email" : "SMS"} OTP
                </label>
                <div className="flex space-x-3 justify-center">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg font-semibold"
                    />
                  ))}
                </div>
              </div>



              {/* Timer */}
              <div className="text-center">
                <p className="text-gray-600">
                  Code expires in <span className="font-semibold text-primary">{formatTime(timer)}</span>
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : `Verify ${activeTab === "email" ? "Email" : "SMS"} OTP`}
              </Button>

              {/* Resend OTP */}
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleResendOTP(activeTab as 'email' | 'sms')}
                  disabled={timer > 0}
                  className="text-sm text-gray-600 hover:text-primary"
                >
                  {timer > 0 ? `Resend available in ${formatTime(timer)}` : `Resend ${activeTab === "email" ? "Email" : "SMS"} OTP`}
                </Button>
              </div>
            </form>

            {/* Back to Register */}
            <div className="text-center mt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setLocation("/register")}
                className="text-gray-600 hover:text-gray-800 flex items-center justify-center mx-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Register
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
