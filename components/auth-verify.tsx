"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInOrSignUp } from "@/lib/auth-helpers";

export default function AuthVerify() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { user } = await signInOrSignUp(username, password);
      if (user) {
        // Store user ID in localStorage for session management
        localStorage.setItem("userId", user.id);
        router.push("/game"); // or wherever you want to redirect after auth
      }
    } catch (error) {
      setError("Authentication failed. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md p-8">
        <div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
