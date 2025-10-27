import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, EyeOff, Eye } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import api from "@/api/api";
import { useConfirmation } from "@/components/ui/useConfirmation";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

interface UnitTypeSizePair {
    id: string;
    unitType: string;
    unitSize: string;
    unitTypeId?: number;
    sizeId?: number;
    isHidden?: boolean;
    hasQuote?: boolean;
    unique_offering?: string; // NEW: Add unique_offering field
}

interface UnitType {
    id: number;
    name: string;
}

interface Size {
    id: number;
    name: string;
}

export function EditFacilityPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { confirmAsync } = useConfirmation();

    // State for facility data from API
    const [facility, setFacility] = useState(null);
    const [loading, setLoading] = useState(true);
    const [unitTypeSizePairs, setUnitTypeSizePairs] = useState<UnitTypeSizePair[]>([]);

    // NEW: State for unit types and sizes from API
    const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
    const [sizes, setSizes] = useState<Size[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

    // Fetch facility data from API with correct structure handling
    useEffect(() => {
        const fetchFacility = async () => {
            if (!id) return;

            setLoading(true);
            try {
                const res = await api.get(`/facilities/${id}`);
                if (res.data.success) {
                    const facilityData = res.data.data;
                    setFacility(facilityData);

                    // Convert API units to unit type size pairs using the actual structure
                    if (facilityData.units && facilityData.units.length > 0) {
                        const pairs: UnitTypeSizePair[] = facilityData.units.map(unit => ({
                            id: unit.id.toString(),
                            unitType: unit.unit_type.name,
                            unitTypeId: unit.unit_type.id,
                            sizeId: unit.size.id,
                            unitSize: unit.size.name,
                            isHidden: unit.is_hidden || false,
                            hasQuote: unit.has_quote,
                            unique_offering: unit.unique_offering || '' // Load unique_offering from API
                        }));
                        setUnitTypeSizePairs(pairs);
                    }
                } else {
                    toast({
                        title: "Error",
                        description: "Failed to load facility data",
                        variant: "destructive"
                    });
                }
            } catch (err) {
                toast({
                    title: "Error",
                    description: "Could not fetch facility data",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchFacility();
    }, [id, toast]);

    // NEW: Fetch unit types and sizes from API endpoints
    useEffect(() => {

        const fetchOptions = async () => {
            setLoadingOptions(true);
            try {
                const [unitTypesRes, sizesRes] = await Promise.all([
                    api.get('/unit-types'),
                    api.get(`/sizes?facilityId=${id}`)
                ]);

                if (unitTypesRes.data.success) {
                    setUnitTypes(unitTypesRes.data.data || []);
                }

                if (sizesRes.data.success) {
                    setSizes(sizesRes.data.data || []);
                }
            } catch (err) {
                console.error('Error fetching unit types and sizes:', err);
                toast({
                    title: "Warning",
                    description: "Could not load unit types and sizes options",
                    variant: "destructive"
                });
            } finally {
                setLoadingOptions(false);
            }
        };

        fetchOptions();
    }, [id, toast]);

    // Loading state
    if (loading || loadingOptions) {
        return (
            <AdminLayout>
                <div className="p-6">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-muted-foreground">Loading facility...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (!facility) {
        return (
            <AdminLayout>
                <div className="p-6">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Facility Not Found</h1>
                        <Link to="/facilities">
                            <Button>Back to Facilities</Button>
                        </Link>
                    </div>
                </div>
            </AdminLayout>
        );
    }

	const addNewPair = () => {
	    const newPair: UnitTypeSizePair = {
	        id: `new-${Date.now()}`,
	        unitType: '', // start empty
	        unitSize: '', // start empty
	        unitTypeId: undefined, // no preselected type
	        sizeId: undefined, // no preselected size
	        unique_offering: '' // also empty by default
	    };

	    // Add new pair at the top
	    setUnitTypeSizePairs([newPair, ...unitTypeSizePairs]);
	};


    const removePair = (pairId: string) => {
        setUnitTypeSizePairs(pairs => pairs.filter(p => p.id !== pairId));
    };

    const updatePair = (pairId: string, field: 'unitType' | 'unitSize' | 'unique_offering', value: string) => {
        setUnitTypeSizePairs(pairs =>
            pairs.map(p => {
                if (p.id === pairId) {
                    if (field === 'unitType') {
                        const selectedUnitType = unitTypes.find(ut => ut.id.toString() === value);
                        return {
                            ...p,
                            unitType: selectedUnitType?.name || value,
                            unitTypeId: selectedUnitType?.id
                        };
                    } else if (field === 'unitSize') {
                        const selectedSize = sizes.find(s => s.id.toString() === value);
                        return {
                            ...p,
                            unitSize: selectedSize?.name || value,
                            sizeId: selectedSize?.id
                        };
                    } else if (field === 'unique_offering') {
                        return {
                            ...p,
                            unique_offering: value
                        };
                    }
                }
                return p;
            })
        );
    };

    const togglePairVisibility = (pairId: string) => {
        setUnitTypeSizePairs(pairs =>
            pairs.map(p => p.id === pairId ? { ...p, isHidden: !p.isHidden } : p)
        );
    };

    // Real API call for saving facility with proper data structure
    const handleSave = async () => {
        // Validation - ensure all pairs have both unitType and unitSize
        const incompletePairs = unitTypeSizePairs.filter(p => !p.unitType || !p.unitSize);
        if (incompletePairs.length > 0) {
            toast({
                title: "Error",
                description: "Please complete all unit type and size pairs",
                variant: "destructive"
            });
            return;
        }

        try {
            // Prepare data for API matching the expected structure
            const updateData = {
                units: unitTypeSizePairs.map(pair => ({
                    id: pair.id.startsWith('new-') ? null : parseInt(pair.id),
                    unit_type_id: pair.unitTypeId,
                    size_id: pair.sizeId,
                    is_hidden: pair.isHidden || false,
                    unique_offering: pair.unique_offering || '' // Include unique_offering in API call
                }))
            };

            const res = await api.post(`/facilities/${id}/update`, updateData);

            if (res.data.success) {
                if (res.data.data.new_units_message) {
                    toast({
                        title: "Success",
                        description: (
                            <div>
                                {res.data.data.new_units_message?.units?.map((line: string, i: number) => (
                                    <div key={i}>{line}</div>
                                ))}
                                <div>
                                    has been added to <strong>{res.data.data.new_units_message?.facility}</strong> facility
                                </div>
                            </div>
                        ),
                        variant: "success",
                    });
                } else {
                    toast({
                        title: "Success",
                        description: "Facility updated successfully",
                        variant: "success"
                    });
                }
                navigate("/facilities");
            } else {
                toast({
                    title: "Error",
                    description: "Failed to update facility",
                    variant: "destructive"
                });
            }
        } catch (err) {
            console.log(err);

            toast({
                title: "Error",
                description: "Could not save facility changes",
                variant: "destructive"
            });
        }
    };



    // Real API call for deleting facility
    const handleDeleteFacility = async () => {
        const confirmed = await confirmAsync(
            {
                title: 'Delete Facility!',
                message: 'This facility will be deleted permanently. Are you sure to proceed?',
                confirmText: "Yes",
                cancelText: "Cancel",
                variant: "destructive"
            },
            async () => {
                const res = await api.delete(`/facilities/${id}`);

                if (res.data.success) {
                    toast({
                        title: "Success",
                        description: res.data.message,
                        variant: "success"
                    });
                    navigate("/facilities");
                } else {
                    toast({
                        title: "Error",
                        description: res.data.message || "Failed to delete facility",
                        variant: "destructive"
                    });
                }
            }
        );
    };

    const toggleVisibilityFacility = async () => {
        let alertTitle = "";
        let alertMessage = "";
        if (facility.is_hidden) {
            alertTitle = 'Show Facility';
            alertMessage = 'This facility will be visible for the users. Are you sure?';
        } else {
            alertTitle = 'Hide Facility';
            alertMessage = 'This facility will be hidden for the users. Are you sure?';
        }

        const confirmed = await confirmAsync(
            {
                title: alertTitle,
                message: alertMessage,
                confirmText: "Yes",
                cancelText: "Cancel",
                variant: "destructive"
            },
            async () => {
                const res = await api.get(`/facilities/${facility.id}/toggle-visibility`);

                if (res.data.success) {
                    toast({
                        title: "Success",
                        description: res.data.message,
                        variant: "success"
                    });
                    navigate(`/facilities/${id}/edit`);
                    setFacility(prev => ({
                        ...prev,
                        is_hidden: !prev.is_hidden
                    }));
                } else {
                    toast({
                        title: "Error",
                        description: res.data.message || "Failed to delete user",
                        variant: "destructive"
                    });
                    throw new Error(res.data.message || "Failed to delete user");
                }
            }
        );
    };

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
                    <h1 className="text-3xl font-bold">Edit Facility: {facility.name}</h1>
                </div>

                <Card className="max-w-4xl">
                    <CardHeader>
                        <CardTitle>Facility Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Country</Label>
                                <Input value={facility.country?.name || 'N/A'} readOnly className="bg-muted" />
                            </div>
                            <div className="space-y-2">
                                <Label>Facility Name</Label>
                                <Input value={facility.name} readOnly className="bg-muted" />
                            </div>
                        </div>

                        {/* Unit Type & Size Pairs */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-medium">Unit Types & Sizes</Label>
                                <Button onClick={addNewPair} size="sm" disabled={unitTypes.length === 0 || sizes.length === 0}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Unit Type & Size
                				</Button>
                            </div>

                            <div className="space-y-3">
                                {unitTypeSizePairs.map((pair) => (
                                    <div key={pair.id} className={`p-4 border rounded-lg space-y-4 ${pair.isHidden ? 'opacity-50 bg-muted' : ''}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <Label className="text-sm">Unit Type</Label>
                                                <Select
                                                    value={pair.unitTypeId?.toString() || ''}
                                                    onValueChange={(value) => updatePair(pair.id, 'unitType', value)}
                                                    disabled={pair.hasQuote}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select unit type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {unitTypes.map((type) => (
                                                            <SelectItem key={type.id} value={type.id.toString()}>
                                                                {type.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="flex-1">
                                                <Label className="text-sm">Unit Size</Label>
                                                <Select
                                                    value={pair.sizeId?.toString() || ''}
                                                    onValueChange={(value) => updatePair(pair.id, 'unitSize', value)}
                                                    disabled={pair.hasQuote}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select size" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {sizes.map((size) => (
                                                            <SelectItem key={size.id} value={size.id.toString()}>
                                                                {size.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="flex gap-2 pt-5">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => togglePairVisibility(pair.id)}
                                                    title={pair.isHidden ? "Show" : "Hide"}
                                                >
                                                    {pair.isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => removePair(pair.id)}
                                                    disabled={pair.hasQuote}
                                                    title="Remove"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Rich Text Editor for Unique Offering */}
                                        <div className="space-y-2">
                                            <Label className="text-sm">Unique Offering</Label>
                                            <RichTextEditor
                                                value={pair.unique_offering || ''}
                                                onChange={(value) => updatePair(pair.id, 'unique_offering', value)}
                                                placeholder="Enter unique offering with formatting and emojis..."
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between pt-4">
                            <div className="flex gap-2">
                                <Button onClick={handleSave} disabled={unitTypeSizePairs.length === 0}>
                                    Save Changes
                                </Button>
                                <Button variant="outline" onClick={() => navigate("/facilities")}>
                                    Cancel
                                </Button>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant={facility.is_hidden ? "default" : "secondary"}
                                    onClick={toggleVisibilityFacility}
                                >
                                    {facility.is_hidden ? (
                                        <>
                                            <Eye className="mr-2 h-4 w-4" />
                                            Show Facility
                                        </>
                                    ) : (
                                        <>
                                            <EyeOff className="mr-2 h-4 w-4" />
                                            Hide Facility
                                        </>
                                    )}
                                </Button>
                                <Button variant="destructive" onClick={handleDeleteFacility}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Facility
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
