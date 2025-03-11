import AuthForm from "@/components/auth-form";
import Starfield from "@/components/StarBackground";
import BackgroundMusic from "@/components/BackgroundMusic";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_bottom,#1B2735_0%,#090A0F_100%)] flex items-center justify-center p-4">
      <Starfield
        starCount={1500}
        starColor={[255, 255, 255]}
        speedFactor={0.07}
        backgroundColor="black"
      />
      <AuthForm />
      <BackgroundMusic />
    </div>
  );
}
