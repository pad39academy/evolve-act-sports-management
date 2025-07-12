import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { forgotPasswordSchema, type ForgotPasswordData } from "@shared/schema";

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      identifier: "",
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordData) => {
      return apiRequest("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      setIsSubmitted(true);
      toast({
        title: "Reset code sent",
        description: "Please check your email and mobile for the reset code.",
      });
      // Navigate to reset password page with userId
      setTimeout(() => {
        setLocation(`/reset-password?userId=${data.userId}`);
      }, 2000);
    },
    onError: (error: any) => {
      console.error("Forgot password error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send reset code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    forgotPasswordMutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Check Your Messages</CardTitle>
            <CardDescription>
              We've sent a reset code to your email and mobile number
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Please check your email and SMS for the 6-digit reset code. You'll be redirected to the reset page shortly.
              </AlertDescription>
            </Alert>
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Didn't receive the code?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => setIsSubmitted(false)}
                >
                  Try again
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email or mobile number to receive a reset code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Email or Mobile Number</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="Enter your email or mobile (+91xxxxxxxxxx)"
                {...form.register("identifier")}
                disabled={forgotPasswordMutation.isPending}
              />
              {form.formState.errors.identifier && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.identifier.message}
                </p>
              )}
            </div>

            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
              <p className="font-medium mb-1">Supported formats:</p>
              <p>• Email: user@example.com</p>
              <p>• Mobile: +91xxxxxxxxxx (with country code)</p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={forgotPasswordMutation.isPending}
            >
              {forgotPasswordMutation.isPending ? "Sending..." : "Send Reset Code"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{" "}
                <Link href="/login" className="text-blue-600 hover:text-blue-500">
                  Back to Login
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}