"use client";

import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Rocket,
  Star,
  Trophy,
  Loader2,
  LogOut,
  Zap,
  Award,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Starfield from "@/components/StarBackground";
import StarBackground from "@/components/StarBackground2";
import Image from "next/image";
import BackgroundMusic from "@/components/BackgroundMusic";
import "../fonts.css";

// Type definitions
type LeaderboardEntry = {
  username: string;
  score: number;
  rank: number;
};

export default function GamePage() {
  const [score, setScore] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(1);
  const [lastClickTime, setLastClickTime] = useState(Date.now());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedScore, setLastSavedScore] = useState(0);
  const [speedPercentage, setSpeedPercentage] = useState(20); // For the speed progress bar
  const controls = useAnimation();
  const starsControl = useAnimation();
  const router = useRouter();
  const [lastTapTime, setLastTapTime] = useState(Date.now());

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        router.push("/");
        return;
      }

      // Fetch user profile data first
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError || !profileData) {
        throw new Error("User profile not found");
      }

      setUser(profileData);

      // Initialize score record if it doesn't exist
      const { data, error } = await supabase.rpc("initialize_player_score", {
        initial_score: 0,
        player_id: userId,
      });

      if (error) {
        console.error("Error:", error);
        return;
      }

      // Update score from initialization response
      if (data?.success && typeof data.score === "number") {
        setScore(data.score);
        setLastSavedScore(data.score);
        return; // Skip additional score fetch since we have the latest score
      }

      // Then fetch scores (only if initialization didn't return a score)
      const { data: scoreData, error: scoreError } = await supabase
        .from("scores")
        .select("score")
        .eq("user_id", userId)
        .single();

      if (scoreError) {
        console.error("Error fetching score:", scoreError);
      } else if (scoreData) {
        setScore(scoreData.score);
        setLastSavedScore(scoreData.score);
      }

      await fetchLeaderboard();
    } catch (err: any) {
      toast.error(err.message || "Error loading user data");
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  };

  // Add useEffect for interval-based score syncing
  useEffect(() => {
    let syncInterval: NodeJS.Timeout;

    if (user && score !== lastSavedScore) {
      syncInterval = setInterval(async () => {
        if (!isSaving && score !== lastSavedScore) {
          setIsSaving(true);
          try {
            const userId = localStorage.getItem("userId");

            const { data, error } = await supabase.rpc("update_player_score", {
              player_score: score,
              player_id: userId,
            });

            if (error) {
              console.error("Error updating score:", error);
              return;
            }
            setLastSavedScore(score);
            await fetchLeaderboard();
          } catch (err: any) {
            toast.error("Error saving score: " + err.message);
          } finally {
            setIsSaving(false);
          }
        }
      }, 5000);
    }

    return () => {
      if (syncInterval) clearInterval(syncInterval);
    };
  }, [user, score, lastSavedScore, isSaving]);

  // Update speed percentage whenever gameSpeed changes
  useEffect(() => {
    setSpeedPercentage(Math.min((gameSpeed / 5) * 100, 100));
  }, [gameSpeed]);

  // Add gradual deceleration when user stops tapping
  useEffect(() => {
    const decelerationInterval = setInterval(() => {
      const currentTime = Date.now();
      // If it's been more than 1 second since last tap, gradually decrease speed
      if (currentTime - lastTapTime > 1000 && gameSpeed > 1) {
        setGameSpeed((prev) => Math.max(prev - 0.05, 1));
      }
    }, 100);

    return () => clearInterval(decelerationInterval);
  }, [lastTapTime, gameSpeed]);

  const handleClick = async () => {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastClickTime;

    // Increase speed based on click frequency
    if (timeDiff < 300) {
      setGameSpeed((prev) => Math.min(prev + 0.2, 5));
    } else {
      setGameSpeed((prev) => Math.max(prev - 0.1, 1));
    }

    setLastClickTime(currentTime);
    setLastTapTime(currentTime); // Update last tap time for deceleration
    const newScore = score + Math.floor(gameSpeed);
    setScore(newScore);

    // Animate stars
    starsControl.start({
      y: [-20, -40],
      opacity: [1, 0],
      transition: { duration: 0.5 },
    });
  };

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase.rpc("get_leaderboard");

      if (error) {
        console.error("Error fetching leaderboard:", error);
        return;
      }

      if (data.success && data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
    }
  };

  // Call fetchLeaderboard in useEffect
  useEffect(() => {
    fetchLeaderboard();
    // Set up polling interval to refresh leaderboard
    const interval = setInterval(fetchLeaderboard, 5000); // every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    router.push("/");
  };

  const getUserRank = () => {
    const userEntry = leaderboard.find(
      (entry) => entry.username === user?.username
    );
    return userEntry?.rank || "N/A";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_bottom,#1B2735_0%,#090A0F_100%)] flex items-center justify-center">
        <div className="text-white text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-xl font-para">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_bottom,#1B2735_0%,#090A0F_100%)] p-4 md:p-8 relative overflow-hidden">
      {/* <Starfield
        starCount={1000}
        starColor={[255, 255, 255]}
        speedFactor={0.02}
        backgroundColor="black"
      /> */}
      <StarBackground />
      <div className="max-w-5xl mx-auto relative z-10">
        <header className="flex flex-col sm:flex-row justify-between items-center my-8 gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-bold text-white font-para">
              ROCKET ZOOM
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-[#181a25] backdrop-blur-sm px-4 py-2 rounded-full text-white font-para">
              <span className="font-semibold">{user?.username}</span>
              {getUserRank() !== "N/A" && (
                <span className="ml-2 bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full">
                  #{getUserRank()}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-white hover:bg-white/10 hover:text-white font-para"
              size="sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Game area - takes 3/5 of the space on desktop */}
          <div className="md:col-span-3 space-y-6">
            <Card className="bg-black/30 backdrop-blur-lg border-gray-500/20 text-white overflow-hidden">
              <CardHeader className="pb-0">
                <CardTitle className="flex justify-between items-center">
                  <div className="flex items-center gap-2 font-space">
                    <Award className="h-5 w-5 text-yellow-400" />
                    <span className="text-xs">YOUR SCORE</span>
                  </div>
                  <div className="text-4xl font-bold text-gray-300 font-para">
                    {score}
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-6 pb-8">
                <div className="relative h-48 mb-8 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Stars animation */}
                    {/* <div className="relative w-full h-full">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={starsControl}
                          initial={{ opacity: 0 }}
                          className="absolute"
                          style={{
                            left: `${20 + i * 15}%`,
                            top: "60%",
                          }}
                        >
                          <Star
                            className="text-yellow-400"
                            size={i % 2 === 0 ? 16 : 20}
                          />
                        </motion.div>
                      ))}
                    </div> */}

                    {/* Rocket animation */}
                    <div className="relative">
                      {/* <Rocket size={80} className="text-white" /> */}
                      <Image
                        src="/rocket.png"
                        alt="Rocket"
                        width={80}
                        height={80}
                        className={`relative -top-[${-80 + speedPercentage}]`}
                        style={{ top: -(-80 + speedPercentage) }}
                      />
                      {/* <motion.div
                        animate={{
                          height: [20, 40, 20],
                          transition: {
                            duration: 0.3,
                            repeat: Number.POSITIVE_INFINITY,
                          },
                        }}
                        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-10 bg-gradient-to-t from-orange-500 via-yellow-400 to-transparent rounded-full"
                        style={{
                          zIndex: -1,
                          opacity: 0.8,
                        }} 
                      /> */}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-gray-300 font-para">
                        Rocket Speed
                      </span>
                    </div>
                    <span className="text-sm font-medium font-para">
                      {gameSpeed.toFixed(1)}x
                    </span>
                  </div>
                  <Progress
                    value={speedPercentage}
                    className="h-2 bg-gray-700"
                  />

                  <Button
                    onClick={handleClick}
                    className="w-full mt-4 bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 text-white border-none shadow-lg shadow-gray-900/30 font-para"
                    size="lg"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <span className="text-lg font-bold">TAP TO BOOST!</span>
                    )}
                  </Button>

                  <p className="text-xs text-center text-gray-400 mt-2 font-para">
                    Tap faster to increase your rocket speed and earn more
                    points!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard - takes 2/5 of the space on desktop */}
          <div className="md:col-span-2">
            <Card className="bg-black/30 backdrop-blur-lg border-gray-500/20 text-white h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2 font-space">
                  <Trophy className="text-yellow-400 h-6 w-6" />
                  <span className="text-xs">LEADERBOARD</span>
                  <Trophy className="text-yellow-400 h-6 w-6" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin font-para">
                  {leaderboard.map((entry, index) => {
                    const isCurrentUser = entry.username === user?.username;
                    const rankColors = {
                      1: "bg-yellow-500 text-black",
                      2: "bg-gray-300 text-black",
                      3: "bg-amber-700 text-white",
                    };

                    return (
                      <div
                        key={entry.username}
                        className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                          isCurrentUser
                            ? "bg-[#181a25] border border-gray-400/50"
                            : "bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              rankColors[
                                entry.rank as keyof typeof rankColors
                              ] || "bg-[181a25] text-white"
                            }`}
                          >
                            {entry.rank}
                          </div>
                          <div
                            className={`${isCurrentUser ? "font-bold" : ""}`}
                          >
                            {entry.username}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs">(You)</span>
                            )}
                          </div>
                        </div>
                        <div className="font-bold text-lg">
                          {entry.score.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                  {leaderboard.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>No scores yet. Be the first!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <BackgroundMusic />
    </div>
  );
}

function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 w-full bg-gray-700 rounded-full", className)}>
      <div
        className="h-full bg-gradient-to-r from-red-600 to-yellow-600 rounded-full transition-all duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
