import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/api/api";
import { useToast } from "@/hooks/use-toast";
import { usePermission } from "@/hooks/use-permission";
import { FacilitiesTab } from "./FacilitiesTab";
import { UnitTypesTab } from "./UnitTypesTab";
import { FeesTab } from "./FeesTab";
import { useCan } from "@/utils/permissions";

export function FacilitiesPage() {
    const { toast } = useToast();

    const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
    const [loadingUnitTypes, setLoadingUnitTypes] = useState(false);

    const [countries, setCountries] = useState<Country[]>([]);
    const [loadingCountries, setLoadingCountries] = useState(false);

    // Fetch unit types
    useEffect(() => {
        const fetchUnitTypes = async () => {
            setLoadingUnitTypes(true);
            try {
                const res = await api.get(`/unit-types`);
                if (res.data.success) {
                    setUnitTypes(res.data.data || []);
                } else {
                    toast({
                        title: "Error",
                        description: "Failed to load unit type",
                        variant: "destructive"
                    });
                }
            } catch (err) {
                toast({
                    title: "Error",
                    description: "Could not fetch unit type",
                    variant: "destructive"
                });
            } finally {
                setLoadingUnitTypes(false);
            }
        };

        fetchUnitTypes();
    }, []);

    // Fetch countries
    useEffect(() => {
        const fetchCountries = async () => {
            setLoadingCountries(true);
            try {
                const res = await api.get(`/countries/get-all-with-facilities`);
                if (res.data.success) {
                    setCountries(res.data.data || []);
                } else {
                    toast({
                        title: "Error",
                        description: "Failed to load countries",
                        variant: "destructive"
                    });
                }
            } catch (err) {
                toast({
                    title: "Error",
                    description: "Could not fetch countries",
                    variant: "destructive"
                });
            } finally {
                setLoadingCountries(false);
            }
        };

        fetchCountries();
    }, []);

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Facility Management</h1>
                    {(useCan('create-facility') || useCan('full access-facility')) && (
                        <Link to="/facilities/create">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create New Facility
                            </Button>
                        </Link>
                    )}
                </div>

                <Tabs defaultValue="facilities" className="w-full">
                    <TabsList>
                        <TabsTrigger value="facilities">Facilities</TabsTrigger>
                        <TabsTrigger value="unit-types">Unit Types</TabsTrigger>
                        <TabsTrigger value="fees">Fees</TabsTrigger>
                    </TabsList>

                    <TabsContent value="facilities" className="space-y-6">
                        <FacilitiesTab unitTypes={unitTypes} />
                    </TabsContent>

                    <TabsContent value="unit-types" className="space-y-6">
                        <UnitTypesTab unitTypes={unitTypes} setUnitTypes={setUnitTypes} />
                    </TabsContent>

                    <TabsContent value="fees" className="space-y-6">
                        <FeesTab countries={countries} />
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
