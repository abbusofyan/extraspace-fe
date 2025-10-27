import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "@/api/api"; // adjust path to your axios instance

export default function SetPasswordPage() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center space-y-2">
                    <div className="flex justify-center mb-4">
                        <img
                            src="/lovable-uploads/8a3676ea-7052-477d-b7ab-b5993aeb9edf.png"
                            alt="Extra Space Self Storage Logo"
                            className="h-12"
                        />
                    </div>
                    <CardTitle className="text-2xl font-bold">Get Price System</CardTitle>
                    <CardDescription>Password has been updated successfully</CardDescription>
                </CardHeader>
                <CardContent>
					<Button type="button"
						onClick={() => navigate("/login")}
					 	className="w-full">
						Back to login
					</Button>
                </CardContent>
            </Card>
        </div>
    );
}
