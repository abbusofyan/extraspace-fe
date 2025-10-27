import { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import api from "@/api/api";
import { AuthContext } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();
    const { setUser } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await api.post("/auth/Login", formData);
            navigate("/auth/otp-verification?token="+res.data.data.access_token);
        } catch (error: any) {
            toast({
                title: "Login Failed",
                description: error.response ?.data ?.message || "Invalid credentials",
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
                        <img src="/lovable-uploads/8a3676ea-7052-477d-b7ab-b5993aeb9edf.png" alt="Extra Space Self Storage Logo" className="h-12" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Get Price System</CardTitle>
                    <p className="text-muted-foreground">Sign in to your account</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing In...
    							</>
                            ) : (
                                    "Sign In"
                                )}
                        </Button>

                        <div className="text-center">
                            <Link to="/auth/forgot-password" className="text-sm text-primary hover:underline">
                                Forgot your password?
              				</Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
