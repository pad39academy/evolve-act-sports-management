import { Link } from "wouter";
import { Trophy, Users, Smartphone, Shield, UserPlus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-green-600 rounded-lg flex items-center justify-center">
                <Trophy className="text-white h-6 w-6" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Evolve Act</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-600 hover:text-primary transition-colors">Support</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-green-600 rounded-full mb-6">
              <Trophy className="text-white h-10 w-10" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Sports Event Management
              <span className="text-primary"> Made Simple</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Streamline your sports events with our comprehensive management platform. From registration to results, manage everything in one place.
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Register Card */}
            <Card className="hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <UserPlus className="text-green-600 h-8 w-8" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">New User</h3>
                <p className="text-gray-600 mb-6">Create your account and join thousands of sports professionals managing events efficiently.</p>
                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                  <Link href="/register">Get Started</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Login Card */}
            <Card className="hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <LogIn className="text-primary h-8 w-8" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Existing User</h3>
                <p className="text-gray-600 mb-6">Welcome back! Sign in to access your dashboard and manage your sports events.</p>
                <Button asChild className="w-full">
                  <Link href="/login">Sign In</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Features Preview */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="text-orange-600 h-6 w-6" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Multi-Role Management</h4>
              <p className="text-sm text-gray-600">Support for admins, managers, players, and hotel coordinators</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Smartphone className="text-primary h-6 w-6" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Mobile Friendly</h4>
              <p className="text-sm text-gray-600">Access your events from anywhere on any device</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="text-green-600 h-6 w-6" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Secure & Reliable</h4>
              <p className="text-sm text-gray-600">Enterprise-grade security with OTP verification</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-green-600 rounded-lg flex items-center justify-center">
                  <Trophy className="text-white h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Evolve Act</h3>
              </div>
              <p className="text-gray-400">Professional sports event management platform for organizations of all sizes.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Evolve Act. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
