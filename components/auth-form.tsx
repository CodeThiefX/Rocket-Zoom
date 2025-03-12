"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { signInOrSignUp } from "@/lib/auth-helpers";
import Image from "next/image";
import "@/app/fonts.css";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState(""); // Add this
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const validateForm = () => {
    if (!username.trim()) {
      setError("Username is required");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (!isLogin && !address.trim()) {
      setError("Wallet address is required");
      return false;
    }
    if (!isLogin && (address.length < 32 || address.length > 44)) {
      setError("Solana wallet address must be between 32 and 44 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { user, isNew } = await signInOrSignUp(
        username.toLowerCase(),
        password,
        isLogin ? undefined : address.trim() // Add address parameter
      );

      if (user) {
        localStorage.setItem("userId", user.id);
        toast.success(
          isNew ? "Account created successfully!" : "Welcome back!"
        );
        // Add a small delay and use replace instead of push
        setTimeout(() => {
          router.push("/game");
        }, 100);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-none text-white">
      <CardHeader className="space-y-1 flex items-center text-center">
        <div className="mx-auto p-2 rounded-full bg-yellow-600 mb-4 aspect-square flex items-center justify-center">
          <Image src="/rocket.png" alt="Rocket" width={32} height={32} />
        </div>
        <CardTitle className="text-xl font-bold font-space">
          {isLogin ? "WELCOME BACK!" : "CREATE ACCOUNT"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 font-para">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              disabled={isLoading}
              className="bg-white/20 border-white/20 text-white placeholder:text-white/70"
              autoComplete="username"
            />
          </div>
          <div className="space-y-2 relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              disabled={isLoading}
              className="bg-white/20 border-white/20 text-white placeholder:text-white/70"
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[15px] -translate-y-1/2 text-black hover:text-black/80"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
            </button>
          </div>
          {!isLogin && (
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Solana Wallet Address"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setError("");
                }}
                disabled={isLoading}
                className="bg-white/20 border-white/20 text-white placeholder:text-white/70"
                required
              />
              <p className="text-yellow-400 text-xs">
                ⚠️ Please verify your wallet address carefully. You won{`'`}t be
                able to change it after signing up.
              </p>
            </div>
          )}
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button
            type="submit"
            className="w-full bg-yellow-600 hover:bg-yellow-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isLogin ? "Signing In..." : "Creating Account..."}
              </>
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Sign Up"
            )}
          </Button>
          <p className="text-center text-sm font-para">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setUsername("");
                setPassword("");
              }}
              className="text-yellow-400 hover:text-yellow-300 font-para"
              disabled={isLoading}
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
