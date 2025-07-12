import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Shield, ArrowLeft } from "lucide-react";
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
  const [generatedOTP, setGeneratedOTP] = useState("123456"); // Developer mode

  // Extract userId from URL params
  const urlParams = new URLSearchParams(location.split("?")[1]);
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

  const handleResendOTP = async () => {
    try {
      const result = await resendOTP(userId!, 'email');
      if (result.success) {
        toast({
          title: "OTP Sent",
          description: "A new OTP has been sent to your email.",
        });
        setTimer(300); // Reset timer
        setGeneratedOTP(Math.floor(100000 + Math.random() * 900000).toString()); // Generate new OTP for demo
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
              <p className="text-gray-600">Enter the OTP sent to your email address</p>
            </div>

            {/* OTP Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* OTP Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
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

              {/* Developer Mode Console */}
              <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm">
                <div className="flex items-center mb-2">
                  <span className="text-white">Developer Console</span>
                </div>
                <div>Generated OTP: <span className="text-yellow-400">{generatedOTP}</span></div>
                <div className="text-gray-400 text-xs mt-1">// TODO: Integrate with Twilio API for production</div>
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
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading || timer === 0}
              >
                {isLoading ? "Verifying..." : "Verify Account"}
              </Button>

              {/* Resend OTP */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-primary hover:text-primary/80 font-medium"
                  disabled={timer > 0}
                >
                  {timer > 0 ? `Resend OTP in ${formatTime(timer)}` : "Resend OTP"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
