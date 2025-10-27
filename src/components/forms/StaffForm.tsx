import { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import api from "@/api/api";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { AuthContext } from "@/context/AuthContext";

interface Country {
    id: string;
    name: string;
    code: string;
}

interface Facility {
    id: string;
    name: string;
    countryId: string;
}

interface Role {
    id: string;
    name: string;
    value: string;
}

interface StaffFormProps {
    mode: 'create' | 'edit';
    staffId?: string; // Required for edit mode
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function StaffForm({ mode, staffId, onSuccess, onCancel }: StaffFormProps) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user, setUser } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        role: "",
        countries: [] as string[],
        facilities: [] as string[],
        selectAllFacilities: false,
        country_code: ""
    });

    // Data states
    const [countries, setCountries] = useState<Country[]>([]);
    const [allFacilities, setAllFacilities] = useState<Facility[]>([]);
    const [availableFacilities, setAvailableFacilities] = useState<Facility[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    // Loading states
    const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
    const [isLoadingUser, setIsLoadingUser] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Determine if this is edit mode
    const isEditMode = mode === 'edit';
    const pageTitle = isEditMode ? 'Edit Staff Member' : 'Create Staff';

    // Check if current logged-in user is Super Admin
    const isCurrentUserSuperAdmin = user?.roles?.[0]?.name === 'Super Admin';

    // In edit mode, only Super Admin can edit countries and facilities
    const canEditCountriesAndFacilities = !isEditMode || isCurrentUserSuperAdmin;

    // Helper function to extract IDs from API response with multiple fallback strategies
    const extractIds = (items: any[], type: 'country' | 'facility'): string[] => {
        if (!Array.isArray(items) || items.length === 0) return [];

        const firstItem = items[0];
        const idField = type === 'country' ? 'country_id' : 'facility_id';

        // Strategy 1: Direct ID property
        if (firstItem.id !== undefined) {
            return items.map(item => String(item.id));
        }

        // Strategy 2: Specific field (country_id/facility_id)
        if (firstItem[idField] !== undefined) {
            return items.map(item => String(item[idField]));
        }

        // Strategy 3: Pivot table structure
        if (firstItem.pivot && firstItem.pivot[idField] !== undefined) {
            return items.map(item => String(item.pivot[idField]));
        }

        // Strategy 4: Direct values (already IDs)
        if (typeof firstItem === 'string' || typeof firstItem === 'number') {
            return items.map(item => String(item));
        }

        console.warn(`Unable to extract ${type} IDs from:`, items);
        return [];
    };

    // Filter facilities based on selected countries
    const filterFacilitiesByCountries = (selectedCountries: string[]) => {
        if (selectedCountries.length === 0) {
            setAvailableFacilities([]);
            return;
        }

        const filtered = allFacilities.filter(facility =>
            selectedCountries.includes(facility.countryId)
        );
        setAvailableFacilities(filtered);

        // Update form data to remove facilities that are no longer available
        setFormData(prev => {
            const validFacilities = prev.facilities.filter(facilityId =>
                filtered.some(facility => facility.id === facilityId)
            );

            return {
                ...prev,
                facilities: validFacilities,
                selectAllFacilities: validFacilities.length === filtered.length && filtered.length > 0
            };
        });
    };

    // Load initial data (countries, facilities, roles)
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoadingInitialData(true);
            try {
                // Load all data in parallel
                const [countriesRes, facilitiesRes, rolesRes] = await Promise.all([
                    api.get('/countries'),
                    api.get('/facilities'), // Get all facilities
                    api.get('/roles')
                ]);

                // Process countries - convert number IDs to strings
                if (countriesRes.data.success) {
                    const processedCountries = countriesRes.data.data.map((country: any) => ({
                        id: String(country.id),
                        name: country.name,
                        code: country.code
                    }));
                    setCountries(processedCountries);
                } else {
                    console.warn('Failed to fetch countries:', countriesRes.data.message);
                    setCountries([]);
                }

                // Process facilities - convert number IDs to strings and map country_id to countryId
                if (facilitiesRes.data.success) {
                    const processedFacilities = facilitiesRes.data.data.map((facility: any) => ({
                        id: String(facility.id),
                        name: facility.name,
                        countryId: String(facility.country_id) // Map country_id to countryId
                    }));
                    setAllFacilities(processedFacilities);
                } else {
                    console.warn('Failed to fetch facilities:', facilitiesRes.data.message);
                    setAllFacilities([]);
                }

                // Process roles
                if (rolesRes.data.success) {
                    const processedRoles = rolesRes.data.data.map((role: any) => ({
                        id: String(role.id),
                        name: role.name,
                        value: role.value || role.name.toLowerCase().replace(/\s+/g, '')
                    }));
                    setRoles(processedRoles);
                } else {
                    console.warn('Failed to fetch roles:', rolesRes.data.message);
                    setRoles([
                        { id: "1", name: "Super Admin", value: "superadmin" },
                        { id: "2", name: "Operations", value: "operations" },
                        { id: "3", name: "Marketing", value: "marketing" }
                    ]);
                }

            } catch (error) {
                console.error('Error loading initial data:', error);
                toast({
                    title: "Error",
                    description: "Failed to load initial data. Some features may not work properly.",
                    variant: "destructive"
                });

                // Set fallback data
                setCountries([]);
                setAllFacilities([]);
                setRoles([
                    { id: "1", name: "Super Admin", value: "superadmin" },
                    { id: "2", name: "Operations", value: "operations" },
                    { id: "3", name: "Marketing", value: "marketing" }
                ]);
            } finally {
                setIsLoadingInitialData(false);
            }
        };

        loadInitialData();
    }, [toast]);

    // Load user data for edit mode
    useEffect(() => {
        if (isEditMode && staffId && !isLoadingInitialData) {
            const fetchUser = async () => {
                try {
                    setIsLoadingUser(true);
                    const res = await api.get(`/users/get/${staffId}`);
                    if (!res.data.success) throw new Error("Failed to fetch user");

                    const userData = res.data.data;

                    // Extract country and facility IDs using helper function
                    const userCountryIds = extractIds(userData.countries || [], 'country');
                    const userFacilityIds = extractIds(userData.facilities || [], 'facility');

                    console.log('Extracted user data:', {
                        countries: userCountryIds,
                        facilities: userFacilityIds
                    });

                    setFormData({
                        name: userData.name || "",
                        email: userData.email || "",
                        phone: userData.phone || "",
                        role: userData.roles?.[0]?.name || "",
                        countries: userCountryIds,
                        facilities: userFacilityIds,
                        selectAllFacilities: false,
                        country_code: userData.country_code || ""
                    });

                    // Filter facilities based on user's countries
                    if (userCountryIds.length > 0) {
                        const filtered = allFacilities.filter(facility =>
                            userCountryIds.includes(facility.countryId)
                        );
                        setAvailableFacilities(filtered);

                        // Check if all available facilities are selected
                        const allSelected = userFacilityIds.length === filtered.length && filtered.length > 0;
                        setFormData(prev => ({
                            ...prev,
                            selectAllFacilities: allSelected
                        }));
                    }

                } catch (error) {
                    console.error("Error fetching user:", error);
                    toast({
                        title: "Error",
                        description: "Failed to load staff member",
                        variant: "destructive",
                    });
                    handleCancel();
                } finally {
                    setIsLoadingUser(false);
                }
            };
            fetchUser();
        }
    }, [isEditMode, staffId, isLoadingInitialData, allFacilities, toast]);

    // Update available facilities when countries change
    useEffect(() => {
        if (!isLoadingInitialData && allFacilities.length > 0) {
            filterFacilitiesByCountries(formData.countries);
        }
    }, [formData.countries, allFacilities, isLoadingInitialData]);

    const handleCountryChange = (countryId: string, checked: boolean) => {
        // Only allow changes in create mode or if current user is Super Admin in edit mode
        if (!canEditCountriesAndFacilities) return;

        setFormData(prev => {
            const newCountries = checked
                ? [...prev.countries, countryId]
                : prev.countries.filter(id => id !== countryId);

            return {
                ...prev,
                countries: newCountries,
                // Don't reset facilities here - let the useEffect handle filtering
                selectAllFacilities: false
            };
        });
    };

    const handleFacilityChange = (facilityId: string, checked: boolean) => {
        // Only allow changes in create mode or if current user is Super Admin in edit mode
        if (!canEditCountriesAndFacilities) return;

        setFormData(prev => {
            const newFacilities = checked
                ? [...prev.facilities, facilityId]
                : prev.facilities.filter(id => id !== facilityId);

            return {
                ...prev,
                facilities: newFacilities,
                selectAllFacilities: newFacilities.length === availableFacilities.length && availableFacilities.length > 0
            };
        });
    };

    const handleSelectAllFacilities = (checked: boolean) => {
        // Only allow changes in create mode or if current user is Super Admin in edit mode
        if (!canEditCountriesAndFacilities) return;

        setFormData(prev => ({
            ...prev,
            facilities: checked ? availableFacilities.map(f => f.id) : [],
            selectAllFacilities: checked
        }));
    };

    const handleRoleChange = (role: string) => {
        if (role === 'Super Admin') {
            // Super admin gets access to all countries and facilities
            setFormData(prev => ({
                ...prev,
                role,
                countries: !isEditMode || isCurrentUserSuperAdmin ? countries.map(c => c.id) : prev.countries,
                selectAllFacilities: !isEditMode || isCurrentUserSuperAdmin
            }));
        } else {
            setFormData(prev => ({ ...prev, role }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            const submitData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                role: formData.role,
                countries: formData.countries,
                facilities: formData.facilities,
                country_code: formData.country_code
            };

            const endpoint = isEditMode ? `/users/${staffId}` : '/users/create';
            const method = isEditMode ? 'put' : 'post';

            const response = await api[method](endpoint, submitData);

            if (response.data.success) {
                toast({
                    title: "Success",
                    description: `Staff member ${isEditMode ? 'updated' : 'created'} successfully`,
					variant: 'success'
                });

                if (onSuccess) {
                    onSuccess();
                } else {
                    navigate('/staff');
                }
            } else {
                throw new Error(response.data.message || 'Operation failed');
            }
        } catch (error: any) {
            console.error('Submit error:', error);

            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                toast({
                    title: "Error",
                    description: error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} staff member`,
                    variant: "destructive",
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            navigate('/staff');
        }
    };

    // Show loading screen while initial data is loading
    if (isLoadingInitialData) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <p className="text-lg">Loading form data...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex items-center gap-4 mb-6">
                <Link to="/staff">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Staff
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">{pageTitle}</h1>
                {isLoadingUser && (
                    <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                        <span className="text-sm text-muted-foreground">Loading user data...</span>
                    </div>
                )}
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Staff Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter full name"
                                    disabled={isSubmitting || isLoadingUser}
                                    readOnly={isEditMode}
                                    className={isEditMode ? "bg-muted" : ""}
                                />
                                {isEditMode && (
                                    <p className="text-sm text-muted-foreground">
                                        Name cannot be changed
                                    </p>
                                )}
                                {errors.name && <p className="text-sm text-red-500">{errors.name[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="Enter email address"
									readOnly={isEditMode}
									className={isEditMode ? "bg-muted" : ""}
                                    disabled={isSubmitting || isLoadingUser}
                                />
                                {errors.email && <p className="text-sm text-red-500">{errors.email[0]}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone *</Label>
                                <PhoneInput
                                    country={"sg"} // default country
                                    value={formData.phone}
                                    onChange={(phone, country) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            phone,
                                            country_code: `+${(country as any).dialCode}`,
                                        }))
                                    }
                                    disabled={isSubmitting || isLoadingUser}
                                    enableSearch={true}
                                    searchPlaceholder="Search country"
                                    inputClass="!w-full !h-10 !text-sm"
                                    dropdownClass="!text-sm"
                                />
                                {errors.phone && <p className="text-sm text-red-500">{errors.phone[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role *</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={handleRoleChange}
                                    disabled={isSubmitting || isLoadingUser}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={role.name}>
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.role && <p className="text-sm text-red-500">{errors.role[0]}</p>}
                            </div>
                        </div>

                        {/* Countries Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-medium">Countries *</Label>
                                {isEditMode && !isCurrentUserSuperAdmin && (
                                    <p className="text-sm text-muted-foreground">
                                        Only Super Admin can edit countries
                                    </p>
                                )}
                            </div>
                            {countries.length === 0 ? (
                                <div className="flex items-center justify-center p-4 border rounded-md bg-muted">
                                    <p className="text-sm text-muted-foreground">No countries available</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto rounded-md p-3">
                                    {countries.map((country) => {
                                        const isChecked = formData.countries.includes(country.id);
                                        return (
                                            <div key={country.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`country-${country.id}`}
                                                    checked={isChecked}
                                                    onCheckedChange={(checked) =>
                                                        handleCountryChange(country.id, checked as boolean)
                                                    }
                                                    disabled={isSubmitting || isLoadingUser || !canEditCountriesAndFacilities}
                                                />
                                                <Label
                                                    htmlFor={`country-${country.id}`}
                                                    className={`text-sm font-normal cursor-pointer ${
                                                        !canEditCountriesAndFacilities ? 'text-muted-foreground' : ''
                                                    }`}
                                                >
                                                    {country.name} ({country.code})
                                                </Label>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            {errors.countries && <p className="text-sm text-red-500">{errors.countries[0]}</p>}
                        </div>

                        {/* Facilities Section */}
                        {formData.countries.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-medium">Facilities *</Label>
                                    <div className="flex items-center gap-4">
                                        {isEditMode && !isCurrentUserSuperAdmin && (
                                            <p className="text-sm text-muted-foreground">
                                                Only Super Admin can edit facilities
                                            </p>
                                        )}
                                        {availableFacilities.length > 0 && (
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="select-all-facilities"
                                                    checked={formData.selectAllFacilities}
                                                    onCheckedChange={(checked) =>
                                                        handleSelectAllFacilities(checked as boolean)
                                                    }
                                                    disabled={isSubmitting || isLoadingUser || !canEditCountriesAndFacilities}
                                                />
                                                <Label
                                                    htmlFor="select-all-facilities"
                                                    className={`text-sm font-medium cursor-pointer ${
                                                        !canEditCountriesAndFacilities ? 'text-muted-foreground' : ''
                                                    }`}
                                                >
                                                    Select All
                                                </Label>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {availableFacilities.length === 0 ? (
                                    <div className="flex items-center justify-center p-4 border rounded-md bg-muted">
                                        <p className="text-sm text-muted-foreground">
                                            No facilities available for selected countries
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto rounded-md p-3">
                                        {availableFacilities.map((facility) => {
                                            const country = countries.find(c => c.id === facility.countryId);
                                            const isChecked = formData.facilities.includes(facility.id);

                                            return (
                                                <div key={facility.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`facility-${facility.id}`}
                                                        checked={isChecked}
                                                        onCheckedChange={(checked) =>
                                                            handleFacilityChange(facility.id, checked as boolean)
                                                        }
                                                        disabled={isSubmitting || isLoadingUser || !canEditCountriesAndFacilities}
                                                    />
                                                    <Label
                                                        htmlFor={`facility-${facility.id}`}
                                                        className={`text-sm font-normal cursor-pointer ${
                                                            !canEditCountriesAndFacilities ? 'text-muted-foreground' : ''
                                                        }`}
                                                        title={`${facility.name} (${country?.name || 'Unknown'})`}
                                                    >
                                                        {facility.name}
                                                        <span className="text-xs text-gray-500 ml-1">
                                                            ({country?.code || 'Unknown'})
                                                        </span>
                                                    </Label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                {errors.facilities && <p className="text-sm text-red-500">{errors.facilities[0]}</p>}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || isLoadingUser}
                                className="min-w-[120px]"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        {isEditMode ? 'Updating...' : 'Creating...'}
                                    </div>
                                ) : (
                                    isEditMode ? 'Update Staff' : 'Create Staff'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
