import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { facilities, unitTypes } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import api from "@/api/api";

// Country-specific unit types
const countryUnitTypes = {
    "1": ["Aircon", "Non Aircon", "Premium", "Executive Storage", "Wine Storage", "Drive Up"], // Singapore
    "2": ["Aircon", "Non Aircon", "Wine Storage", "Drive Up"], // Malaysia
    "3": ["Aircon"], // Korea
    "4": ["Aircon", "Non Aircon"] // Hong Kong
};

export function CreateFacilityPage() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        country: "",
        facility: "",
        code: "",
        name: ""
    });

    const [showCustomFields, setShowCustomFields] = useState({
        facility: false
    });

    const handleCountryChange = (countryId: string) => {
        setFormData(prev => ({
            ...prev,
            country: parseInt(countryId),
            facility: "",
            code: ""
        }));
    };

    const handleFacilityChange = (value: string) => {
        if (value === "add-new") {
            setShowCustomFields(prev => ({ ...prev, facility: true }));
            setFormData(prev => ({ ...prev, facility: "", code: "" }));
        } else {
            setShowCustomFields(prev => ({ ...prev, facility: false }));
            setFormData(prev => ({
                ...prev,
                facility: value,
                code: ""
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();

        // Validation
        if (!formData.country) {
            toast({ title: "Error", description: "Please select a country", variant: "destructive" });
            return;
        }

        if (!formData.name) {
            toast({ title: "Error", description: "Please enter a facility name", variant: "destructive" });
            return;
        }

        if (!formData.code) {
            toast({ title: "Error", description: "Please enter a location code", variant: "destructive" });
            return;
        }

		const res = await api.post('/facilities/create', formData);
		if (res.data.success) {
			toast({
				title: "Success",
				description: "New facility created successfully.",
				variant: 'success'
			});

			navigate("/facilities");
		} else {
			const errorData = await res.json().catch(() => ({}));
			throw new Error(errorData.message || 'Failed to create facility');
		}

        toast({
            title: "Success",
            description: 'Facility created successfully',
			variant: 'success'
        });

        navigate("/facilities");
    };

    const selectedCountryFacilities = facilities.filter(f => f.countryId === formData.country);

    const [countries, setCountries] = useState<Country[]>([])
    const [loadingCountries, setLoadingCountries] = useState(false)
    useEffect(() => {
        const fetchCountries = async () => {

            setLoadingCountries(true)
            try {
                const res = await api.get('/countries');
                if (res.data.success) {
                    setCountries(res.data.data || [])
                } else {
                    toast({
                        title: 'Error',
                        description: 'Failed to fetch countries',
                        variant: 'desctructive'
                    });
                }
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Could not fetch countries',
                    variant: 'desctructive'
                });
            } finally {
                setLoadingCountries(false)
            }
        };
		fetchCountries();
    }, []);

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Link to="/facilities">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
            			</Button>
                    </Link>
                    <h1 className="text-3xl font-bold">Create New Facility</h1>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Facility Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Country Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="country">Storage Country *</Label>
                                <Select value={formData.country} onValueChange={handleCountryChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {countries.map((country) => (
                                            <SelectItem key={country.id} value={country.id}>
                                                {country.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Facility Text Field */}
                            {formData.country && (
                                <div className="space-y-2">
                                    <Label htmlFor="facility">Storage Facility *</Label>
                                    <Input
                                        id="facility"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Enter facility name"
                                        required
                                    />
                                </div>
                            )}

                            {/* Location Code */}
                            {formData.country && (
                                <div className="space-y-2">
                                    <Label htmlFor="code">Location Code *</Label>
                                    <Input
                                        id="code"
                                        value={formData.code}
                                        onChange={(e) => {
                                            const value = e.target.value
                                                .replace(/[^a-zA-Z0-9]/g, "") // allow only letters and numbers
                                                .toUpperCase();              // convert to uppercase
                                            setFormData((prev) => ({ ...prev, code: value }));
                                        }}
                                        placeholder="Enter location code manually"
                                        required
                                    />
                                </div>
                            )}

                            <div className="flex gap-4 pt-4">
                                <Button type="submit" className="flex-1">
                                    Create Facility
                				</Button>
                                <Link to="/facilities">
                                    <Button type="button" variant="outline">
                                        Cancel
                  					</Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
