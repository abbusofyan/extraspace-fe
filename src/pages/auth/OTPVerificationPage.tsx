import { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import api from "@/api/api";
import { AuthContext } from "@/context/AuthContext";

export function OTPVerificationPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(120); // 2 minutes
  const [canResend, setCanResend] = useState(false);
  const [searchParams] = useSearchParams();
  const { setUser } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.post("/auth/verify-otp", {
        otp: otp,
        token: searchParams.get("token"),
      });

      if (res.data.success) {
        const { access_token, user } = res.data.data;

        localStorage.setItem("token", access_token);
        setUser(user);

        toast({
          title: "Login Successful",
          description: `Welcome, ${user.name}`,
          variant: "success",
        });

        navigate("/facilities");
      } else {
        toast({
          title: "Error",
          description: res.data.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.log(error);

      toast({
        title: "Login Failed",
        description: error.response?.data?.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setCountdown(120);
    setCanResend(false);
    setIsLoading(true);

    try {
      const res = await api.post("/auth/resend-otp", {
        token: searchParams.get("token"),
      });

      if (res.data.success) {
        navigate("/auth/otp-verification?token=" + res.data.data.access_token);
        toast({
          title: "OTP resent",
          description: "Your new OTP has been sent. Please check your email",
          variant: "success",
        });
      }
    } catch (error: any) {
      toast({
        title: "Resend Failed",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img
              src="/lovable-uploads/8a3676ea-7052-477d-b7ab-b5993aeb9edf.png"
              alt="Extra Space Self Storage Logo"
              className="h-12"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Get Price System</CardTitle>
          <p className="text-muted-foreground">OTP has been sent to your email</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button type="submit" className="w-full" disabled={otp.length !== 6 || isLoading}>
              {isLoading ? "Verifying..." : "Verify"}
            </Button>

            <div className="text-center">
              {canResend ? (
                <Button
                  type="button"
                  variant="link"
                  onClick={handleResendOTP}
                  className="text-primary hover:underline"
                  disabled={isLoading}
                >
                  Resend OTP
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Resend OTP in {formatTime(countdown)}
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
