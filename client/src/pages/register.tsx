import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "wouter";
import { ArrowLeft, UserPlus, Eye, EyeOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { registerUser } from "@/lib/auth";
import { registerSchema, type RegisterData, countryCodes } from "@shared/schema";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "",
      organization: "",
      password: "",
      confirmPassword: "",
      mobileCountryCode: "+91",
      mobileNumber: "",
      whatsappCountryCode: "+91",
      whatsappNumber: "",
    },
  });

  const password = form.watch("password");
  const confirmPassword = form.watch("confirmPassword");

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    return { minLength, hasUpperCase, hasLowerCase, hasNumber };
  };

  const passwordValidation = validatePassword(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const onSubmit = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const result = await registerUser(data);
      console.log("Registration result:", result);
      if (result.success) {
        toast({
          title: "Registration Successful",
          description: "Redirecting to OTP verification...",
        });
        console.log("Redirecting to OTP verification with userId:", result.user.id);
        // Use direct URL navigation with query parameters
        const otpUrl = `/verify-otp?userId=${result.user.id}`;
        console.log("Navigating to:", otpUrl);
        window.location.href = otpUrl;
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="shadow-xl">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-8 relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 top-0"
                asChild
              >
                <Link href="/">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="text-white h-8 w-8" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
              <p className="text-gray-600">Join Evolve Act and start managing your sports events</p>
            </div>

            {/* Registration Form */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    {...form.register("firstName")}
                    placeholder="Enter your first name"
                    className="mt-2"
                  />
                  {form.formState.errors.firstName && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    {...form.register("lastName")}
                    placeholder="Enter your last name"
                    className="mt-2"
                  />
                  {form.formState.errors.lastName && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="Enter your email address"
                  className="mt-2"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <Label htmlFor="role">Role *</Label>
                <Select onValueChange={(value) => form.setValue("role", value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="state_admin_manager">State Admin Manager</SelectItem>
                    <SelectItem value="lead_admin">Lead Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="event_manager">Event Manager</SelectItem>
                    <SelectItem value="team_manager">Team Manager</SelectItem>
                    <SelectItem value="player">Player</SelectItem>
                    <SelectItem value="hotel_manager">Hotel Manager</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.role && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.role.message}</p>
                )}
              </div>

              {/* Organization */}
              <div>
                <Label htmlFor="organization">Organization *</Label>
                <Input
                  id="organization"
                  {...form.register("organization")}
                  placeholder="Enter your organization name"
                  className="mt-2"
                />
                {form.formState.errors.organization && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.organization.message}</p>
                )}
              </div>

              {/* Password Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative mt-2">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...form.register("password")}
                      placeholder="Enter password"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {password && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p className="mb-1">Password must contain:</p>
                      <ul className="space-y-1">
                        <li className={`flex items-center ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-400'}`}>
                          <Check className="h-3 w-3 mr-1" />
                          At least 8 characters
                        </li>
                        <li className={`flex items-center ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-400'}`}>
                          <Check className="h-3 w-3 mr-1" />
                          One uppercase letter
                        </li>
                        <li className={`flex items-center ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-gray-400'}`}>
                          <Check className="h-3 w-3 mr-1" />
                          One lowercase letter
                        </li>
                        <li className={`flex items-center ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                          <Check className="h-3 w-3 mr-1" />
                          One number
                        </li>
                      </ul>
                    </div>
                  )}
                  {form.formState.errors.password && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.password.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative mt-2">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      {...form.register("confirmPassword")}
                      placeholder="Confirm password"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {passwordsMatch && (
                    <div className="mt-2 text-sm text-green-600 flex items-center">
                      <Check className="h-3 w-3 mr-1" />
                      Passwords match
                    </div>
                  )}
                  {form.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              {/* Mobile Number (Mandatory) */}
              <div>
                <Label htmlFor="mobileNumber">Mobile Number *</Label>
                <div className="flex gap-2 mt-2">
                  <Select onValueChange={(value) => form.setValue("mobileCountryCode", value)} defaultValue="+91">
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Code" />
                    </SelectTrigger>
                    <SelectContent>
                      {countryCodes.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.flag} {country.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="mobileNumber"
                    type="tel"
                    {...form.register("mobileNumber")}
                    placeholder="Enter your mobile number"
                    className="flex-1"
                  />
                </div>
                {form.formState.errors.mobileNumber && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.mobileNumber.message}</p>
                )}
                {form.formState.errors.mobileCountryCode && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.mobileCountryCode.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-600">For SMS OTP verification</p>
              </div>

              {/* WhatsApp Number (Optional) */}
              <div>
                <Label htmlFor="whatsappNumber">WhatsApp Number (Optional)</Label>
                <div className="flex gap-2 mt-2">
                  <Select onValueChange={(value) => form.setValue("whatsappCountryCode", value)} defaultValue="+91">
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Code" />
                    </SelectTrigger>
                    <SelectContent>
                      {countryCodes.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.flag} {country.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="whatsappNumber"
                    type="tel"
                    {...form.register("whatsappNumber")}
                    placeholder="Enter your WhatsApp number"
                    className="flex-1"
                  />
                </div>
                {form.formState.errors.whatsappNumber && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.whatsappNumber.message}</p>
                )}
                {form.formState.errors.whatsappCountryCode && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.whatsappCountryCode.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-600">For WhatsApp notifications</p>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-3">
                <Checkbox id="terms" required />
                <Label htmlFor="terms" className="text-sm text-gray-700">
                  I agree to the <Link href="#" className="text-primary hover:text-primary/80 font-medium">Terms of Service</Link> and <Link href="#" className="text-primary hover:text-primary/80 font-medium">Privacy Policy</Link>
                </Label>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            {/* Login Link */}
            <div className="text-center mt-6">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
