import { useState, useEffect, useMemo, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/api/api";
import { useToast } from "@/hooks/use-toast";
import { usePermission } from "@/hooks/use-permission";
import { AuthContext } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { useCan } from "@/utils/permissions";

interface FacilitiesTabProps {
    unitTypes: UnitType[];
}

export function FacilitiesTab({ unitTypes }: FacilitiesTabProps) {
    const { toast } = useToast();
    const { t, i18n } = useTranslation("thankyou");
    const { user } = useContext(AuthContext);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('all');
    const [selectedFacility, setSelectedFacility] = useState('all');
    const [selectedUnitType, setSelectedUnitType] = useState('all');

    const [facilities, setFacilities] = useState<Country[]>([]);
    const [loadingFacilities, setLoadingFacilities] = useState(false);

    // Updated useEffect to depend on filter changes
    useEffect(() => {
        const fetchFacilities = async () => {
            setLoadingFacilities(true)
            try {
                // Build API parameters
                const params: any = {};
                if (selectedCountry !== 'all') {
                    params.country = selectedCountry;
                }
                if (selectedFacility !== 'all') {
                    params.facility = selectedFacility;
                }
                if (selectedUnitType !== 'all') {
                    params.unit_type = selectedUnitType;
                }

                const res = await api.get(`/facilities/mine`, { params });
                if (res.data.success) {
                    setFacilities(res.data.data || []);
                } else {
                    toast({
                        title: "Error",
                        description: "Failed to load facilities",
                        variant: "destructive"
                    });
                }
            } catch (err) {
                toast({
                    title: "Error",
                    description: "Could not fetch facilities",
                    variant: "destructive"
                });
            } finally {
                setLoadingFacilities(false);
            }
        };

        fetchFacilities();
    }, [selectedCountry, selectedFacility, selectedUnitType]);

    // Client-side filtering for search term
    const filteredFacilities = useMemo(() => {
        if (!searchTerm.trim()) {
            return facilities;
        }

        const searchLower = searchTerm.toLowerCase();

        return facilities.map(countryData => {
            const filteredFacilities = countryData.facilities.filter(facility => {
                // Check if facility name matches
                if (facility.name.toLowerCase().includes(searchLower)) {
                    return true;
                }

                // Check if location code matches
                if (facility.locationCode.toLowerCase().includes(searchLower)) {
                    return true;
                }

                // Check if any unit type or size matches
                return facility.units.some(unit => {
                    // Check unit type name
                    if (unit.unit_type.name.toLowerCase().includes(searchLower)) {
                        return true;
                    }

                    // Check unit size name
                    return unit.size.name.toLowerCase().includes(searchLower);
                });
            });

            return {
                ...countryData,
                facilities: filteredFacilities
            };
        }).filter(countryData => countryData.facilities.length > 0);
    }, [facilities, searchTerm]);

    // Reset facility filter when country changes
    useEffect(() => {
        if (selectedCountry !== 'all') {
            setSelectedFacility('all');
        }
    }, [selectedCountry]);

    // Get available facilities for the facility filter based on selected country
    const availableFacilities = useMemo(() => {
        if (selectedCountry === "all") {
            return user.facilities;
        }

        return user.facilities.filter(facility => facility.country_id === selectedCountry);
    }, [selectedCountry, user.facilities]);

    const handleDeleteFacility = async (id: string) => {
        if (!confirm("Are you sure you want to delete this facility?")) return;

        try {
            const res = await api.delete(`/facilities/${id}`);
            if (res.data.success) {
                toast({
                    title: "Success",
                    description: "Facility deleted successfully!",
                    variant: 'success'
                });
                // Refresh facilities
                setFacilities(prev => prev.map(country => ({
                    ...country,
                    facilities: country.facilities.filter(f => f.id !== id)
                })));
            } else {
                toast({
                    title: "Error",
                    description: "Failed to delete facility.",
                    variant: "destructive",
                });
            }
        } catch (err) {
            toast({
                title: "Error",
                description: "Something went wrong while deleting.",
                variant: "destructive",
            });
        }
    };

	const canUpdateFacility = useCan("update-facility") || useCan("full access-facility");

    return (
        <div className="space-y-6">
            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search facilities or location codes"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Select Country" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem key="country-option0" value="all">All Countries</SelectItem>
                                {user.countries.map((country) => (
                                    <SelectItem key={'country-option' + country.id} value={country.id}>
                                        {country.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Select Facility" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Facilities</SelectItem>
                                {availableFacilities.map((facility) => (
                                    <SelectItem key={facility.id} value={facility.id}>
                                        {facility.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedUnitType} onValueChange={setSelectedUnitType}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Select Unit Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Unit Types</SelectItem>
                                {unitTypes.map((unitType) => (
                                    <SelectItem key={unitType.id} value={unitType.id}>
                                        {unitType.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Filter summary */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>
                            Showing {filteredFacilities.reduce((total, country) => total + country.facilities.length, 0)} facilities
                            {searchTerm && ` matching "${searchTerm}"`}
                            {selectedCountry !== 'all' && ` in ${user.countries.find(c => c.id === selectedCountry)?.name}`}
                            {selectedFacility !== 'all' && ` at ${user.facilities.find(f => f.id === selectedFacility)?.name}`}
                            {selectedUnitType !== 'all' && ` with ${unitTypes.find(ut => ut.id === selectedUnitType)?.name}`}
                        </span>
                        {(searchTerm || selectedCountry !== 'all' || selectedFacility !== 'all' || selectedUnitType !== 'all') && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedCountry('all');
                                    setSelectedFacility('all');
                                    setSelectedUnitType('all');
                                }}
                            >
                                Clear filters
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Facilities List */}
            {loadingFacilities ? (
                <Card>
                    <CardContent className="p-6">
                        <p className="text-center text-muted-foreground">Loading facilities...</p>
                    </CardContent>
                </Card>
            ) : filteredFacilities.length === 0 ? (
                <Card>
                    <CardContent className="p-6">
                        <p className="text-center text-muted-foreground">No facilities found</p>
                    </CardContent>
                </Card>
            ) : (
                filteredFacilities.map((countryData) => (
                    <Card key={countryData.country.id}>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Badge variant="outline">{countryData.country.name}</Badge>
								<span className="text-sm font-normal text-muted-foreground">
									({countryData.facilities.length} facilities)
								</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{countryData.facilities.map((facility) => (
								(selectedFacility == 'all' || facility.units.length > 0) && (
									<div key={`facility-${countryData.id}-${facility.id}`} className="border rounded-lg p-4 space-y-2">
										<div className="flex justify-between items-center">
										<Link to={`/facilities/${facility.id}/edit`}>
											<h4 className="font-semibold flex items-center gap-2">
												Facility : {facility.name}
												<Badge variant="secondary" className="text-xs">
													{facility.locationCode}
												</Badge>
												{facility.is_hidden && (
													<Badge variant="outline" className="text-xs">Hidden</Badge>
												)}
											</h4>
										</Link>
											{(canUpdateFacility) && (
												<div className="flex gap-2">
													<Link to={`/facilities/${facility.id}/edit`}>
														<Button variant="outline" size="sm">
															<Edit className="h-3 w-3" />
														</Button>
													</Link>
												</div>
											)}
										</div>

										{facility.units.map(
											(unit) =>
												(selectedUnitType === "all" ||
													selectedUnitType == unit.unit_type.id) && (
													<div key={`unit-${facility.id}-${unit.id}`} className="ml-4 space-y-1">
														<div className="text-sm text-muted-foreground flex items-center gap-2">
															{unit.unit_type.name} – {unit.size.name}
															{unit.is_hidden && (
																<Badge variant="outline" className="text-xs">
																	Hidden
																</Badge>
															)}
														</div>
													</div>
												)
										)}
									</div>
								)
							))}

						</CardContent>
                    </Card>
                ))
            )}
        </div>
    );
}
