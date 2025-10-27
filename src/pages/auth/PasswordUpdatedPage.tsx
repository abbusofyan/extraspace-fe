import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export function PasswordUpdatedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src="/lovable-uploads/8a3676ea-7052-477d-b7ab-b5993aeb9edf.png" alt="Extra Space Self Storage Logo" className="h-12" />
          </div>
          <CardTitle className="text-2xl font-bold">Get Price System</CardTitle>
          <p className="text-muted-foreground">
            Password has been updated successfully
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <Link to="/auth/login">
              <Button className="w-full">
                Back to Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}