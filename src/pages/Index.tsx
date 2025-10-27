import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, FileText, Quote } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Facility Management System</h1>
          <p className="text-xl text-muted-foreground">
            Welcome to the comprehensive facility management and quote system
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Admin Panel */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-6 w-6" />
                Admin Panel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Manage facilities, staff, and monitor form submissions.
              </p>
              <div className="space-y-2">
                <Link to="/login">
                  <Button className="w-full">Access Admin Panel</Button>
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/facilities">
                    <Button variant="outline" size="sm" className="w-full">
                      <Building2 className="mr-1 h-3 w-3" />
                      Facilities
                    </Button>
                  </Link>
                  <Link to="/staff">
                    <Button variant="outline" size="sm" className="w-full">
                      <Users className="mr-1 h-3 w-3" />
                      Staff
                    </Button>
                  </Link>
                  <Link to="/form-entries">
                    <Button variant="outline" size="sm" className="w-full">
                      <FileText className="mr-1 h-3 w-3" />
                      Entries
                    </Button>
                  </Link>
                  <Link to="/roles">
                    <Button variant="outline" size="sm" className="w-full">
                      <Users className="mr-1 h-3 w-3" />
                      Roles
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Quote Form */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Quote className="h-6 w-6" />
                Get a Quote
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Submit a quote request for storage requirements.
              </p>
              <Link to="/quote/sg">
                <Button className="w-full" variant="secondary">
                  Request Storage Quote
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Feature Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <Building2 className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Facility Management</h3>
              <p className="text-sm text-muted-foreground">
                Hierarchical structure: Country → Facility → Unit Type → Unit Size
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Users className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold mb-1">User Management</h3>
              <p className="text-sm text-muted-foreground">
                Role-based access control with facility-specific permissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <FileText className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Form Processing</h3>
              <p className="text-sm text-muted-foreground">
                Customer quote requests with SiteLink integration
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
