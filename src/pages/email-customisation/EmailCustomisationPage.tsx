import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import api from "@/api/api"; // Make sure your api instance is configured (e.g. Axios)

interface FacilityTnc {
  id: string;
  name: string;
  locationCode: string;
  countryName: string;
  tnc: string;
}

export function EmailCustomisationPage() {
  const [facilities, setFacilities] = useState<FacilityTnc[]>([]);
  const [termsData, setTermsData] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Fetch real data from API
  useEffect(() => {
    const fetchTnc = async () => {
      try {
        const response = await api.get("/facilities/get-all-with-tnc");
        const data: FacilityTnc[] = response.data.data || [];
        setFacilities(data);

        // Pre-fill existing T&C data
        const initialTerms: Record<string, string> = {};
        data.forEach(facility => {
          initialTerms[facility.id] = facility.tnc?.tnc;
        });
        setTermsData(initialTerms);
      } catch (error) {
        console.error("Failed to fetch TNC:", error);
        toast({
          title: "Error",
          description: "Failed to load Terms and Conditions data.",
          variant: "destructive",
        });
      }
    };

    fetchTnc();
  }, []);

  const handleTermsChange = (facilityId: string, value: string) => {
    setTermsData(prev => ({
      ...prev,
      [facilityId]: value,
    }));
  };

  const handleTermsSave = async (facilityId: string) => {
    try {
      await api.post(`/facilities/${facilityId}/update-tnc`, {
        tnc: termsData[facilityId],
      });
      toast({
        title: "Success",
        description: "Terms and conditions updated successfully.",
		variant: 'success'
      });
    } catch (error) {
      console.error("Error updating TNC:", error);
      toast({
        title: "Error",
        description: "Failed to update Terms and Conditions.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Email Customisation</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Terms and Conditions</CardTitle>
            <p className="text-muted-foreground">
              Update terms and conditions in the quotation email
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {facilities.length === 0 ? (
                <p className="text-muted-foreground">Loading facilities...</p>
              ) : (
                facilities.map((facility) => (
                  <Card key={facility.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Badge variant="outline">{facility.country.name}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="border rounded-lg p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-semibold flex items-center gap-2">
                            Facility : {facility.name}
                            <Badge variant="secondary" className="text-xs">
                              {facility.code}
                            </Badge>
                          </h4>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`terms-${facility.id}`}>
                            Terms and Conditions Text
                          </Label>
                          <Textarea
                            id={`terms-${facility.id}`}
                            value={termsData[facility.id] || ""}
                            onChange={(e) =>
                              handleTermsChange(facility.id, e.target.value)
                            }
                            placeholder="Enter terms and conditions..."
                            className="min-h-[300px]"
                          />
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleTermsSave(facility.id)}
                            size="sm"
                          >
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
