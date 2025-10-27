import { useState, useEffect, useCallback, useMemo } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/api/api";
import { useToast } from "@/hooks/use-toast";
import { useConfirmation } from "@/components/ui/useConfirmation";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useCan } from "@/utils/permissions";

interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    roles: Array<{ id: string; name: string }>;
    countries: Array<{ id: string; name: string }>;
    facilities: Array<{ id: string; name: string }>;
}

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

export function StaffPage() {
	const { user: authUser, setUser } = useContext(AuthContext);
	// const { user, setUser } = useContext(AuthContext);

    const { toast } = useToast();
    const { confirmAsync } = useConfirmation();

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCountry, setSelectedCountry] = useState("all");
    const [selectedFacility, setSelectedFacility] = useState("all");
    const [selectedRole, setSelectedRole] = useState("all");

    // Data states
    const [users, setUsers] = useState<User[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);

    // Loading states
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [isLoadingCountries, setIsLoadingCountries] = useState(false);
    const [isLoadingFacilities, setIsLoadingFacilities] = useState(false);
    const [isLoadingRoles, setIsLoadingRoles] = useState(false);

    // Debounced search to avoid too many API calls
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch users with all filters using unified endpoint
    const fetchUsers = useCallback(async () => {
        setIsLoadingUsers(true);
        try {
            const params = new URLSearchParams();

            // Add search parameter
            if (debouncedSearchTerm.trim()) {
                params.append('search', debouncedSearchTerm.trim());
            }

            // Add country filter
            if (selectedCountry !== 'all') {
                params.append('country_id', selectedCountry);
            }

            // Add facility filter
            if (selectedFacility !== 'all') {
                params.append('facility_id', selectedFacility);
            }

            // Add role filter
            if (selectedRole !== 'all') {
                params.append('role', selectedRole);
            }

            const queryString = params.toString();
            const endpoint = queryString ? `/users/filter?${queryString}` : '/users/filter';

            const res = await api.get(endpoint);
            if (res.data.success) {
                setUsers(res.data.data || []);
            } else {
                toast({
                    title: 'Error',
                    description: res.data.message || 'Failed to fetch staff members',
                    variant: 'destructive'
                });
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast({
                title: "Error",
                description: "Could not fetch staff members",
                variant: "destructive"
            });
        } finally {
            setIsLoadingUsers(false);
        }
    }, [debouncedSearchTerm, selectedCountry, selectedFacility, selectedRole]);

    // Fetch users when any filter changes
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Fetch countries
    useEffect(() => {
        const fetchCountries = async () => {
            setIsLoadingCountries(true);
            try {
                const res = await api.get('/countries');
                if (res.data.success) {
                    setCountries(res.data.data || []);
                } else {
                    toast({
                        title: 'Error',
                        description: 'Failed to fetch countries',
                        variant: 'destructive'
                    });
                }
            } catch (error) {
                console.error('Error fetching countries:', error);
                toast({
                    title: "Error",
                    description: "Could not fetch countries",
                    variant: "destructive"
                });
            } finally {
                setIsLoadingCountries(false);
            }
        };
        fetchCountries();
    }, []);

    // Fetch facilities
    useEffect(() => {
        const fetchFacilities = async () => {
            setIsLoadingFacilities(true);
            try {
                const res = await api.get('/facilities/option');
                if (res.data.success) {
                    setFacilities(res.data.data || []);
                } else {
                    toast({
                        title: 'Error',
                        description: 'Failed to fetch facilities',
                        variant: 'destructive'
                    });
                }
            } catch (error) {
                console.error('Error fetching facilities:', error);
                toast({
                    title: "Error",
                    description: "Could not fetch facilities",
                    variant: "destructive"
                });
            } finally {
                setIsLoadingFacilities(false);
            }
        };
        fetchFacilities();
    }, []);

    // Fetch roles
    useEffect(() => {
        const fetchRoles = async () => {
            setIsLoadingRoles(true);
            try {
                const res = await api.get('/roles');
                if (res.data.success) {
                    setRoles(res.data.data || []);
                } else {
					toast({
	                    title: "Error",
	                    description: "Failed to fetch roles data",
	                    variant: "destructive"
	                });
                }
            } catch (error) {
				toast({
					title: "Error",
					description: "Failed to fetch roles data",
					variant: "destructive"
				});
            } finally {
                setIsLoadingRoles(false);
            }
        };
        fetchRoles();
    }, []);

    // Handle delete user with reusable confirmation
    const handleDeleteUser = async (userId: string, userName: string) => {
        const confirmed = await confirmAsync(
            {
                title: "Delete Staff Member",
                message: `Are you sure you want to delete ${userName}? This action cannot be undone.`,
                confirmText: "Delete",
                cancelText: "Cancel",
                variant: "destructive"
            },
            async () => {
                const res = await api.get(`/users/${userId}/delete`);

                if (res.data.success) {
                    toast({
                        title: "Success",
                        description: `${userName} has been deleted successfully`,
                        variant: "success"
                    });

                    // Refresh the users list
                    fetchUsers();
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

        if (!confirmed) {
            console.log('User cancelled deletion');
        }
    };

    const getRoleBadgeVariant = (role: string) => {
        switch (role.toLowerCase()) {
            case 'super admin':
            case 'superadmin':
                return 'destructive';
            case 'operations':
                return 'default';
            case 'marketing':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    const handleCountryChange = (value: string) => {
        setSelectedCountry(value);
        // Reset facility filter when country changes
        if (value !== selectedCountry) {
            setSelectedFacility("all");
        }
    };

    const clearAllFilters = () => {
        setSearchTerm("");
        setSelectedCountry("all");
        setSelectedFacility("all");
        setSelectedRole("all");
    };

    const hasActiveFilters = searchTerm || selectedCountry !== "all" || selectedFacility !== "all" || selectedRole !== "all";

    // Get facilities filtered by selected country for the dropdown
	const availableFacilities = useMemo(() => {
	    if (selectedCountry === "all") {
	        return authUser.facilities;
	    }

	    return authUser.facilities.filter(facility => facility.country_id === selectedCountry);
	}, [selectedCountry, authUser.facilities]);

	const canDelete = useCan('delete-staff') || useCan('full access-staff');
	const canEdit = useCan('update-staff') || useCan('full access-staff');

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Staff Management</h1>
                    {(useCan('create-staff') || useCan('full access-staff')) && (
						<Link to="/staff/create">
	                        <Button>
	                            <Plus className="mr-2 h-4 w-4" />
	                            Create Staff
	                        </Button>
	                    </Link>
					)}
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Filters</CardTitle>
                            {hasActiveFilters && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearAllFilters}
                                    disabled={isLoadingUsers}
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Clear All
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name, email, or phone..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8"
                                        disabled={isLoadingUsers}
                                    />
                                </div>
                            </div>
                            <Select
                                value={selectedCountry}
                                onValueChange={handleCountryChange}
                                disabled={isLoadingUsers || isLoadingCountries}
                            >
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Filter by Country" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Countries</SelectItem>
                                    {authUser.countries.map((country) => (
                                        <SelectItem key={`country-${country.id}`} value={country.id}>
                                            {country.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={selectedFacility}
                                onValueChange={setSelectedFacility}
                                disabled={isLoadingUsers || isLoadingFacilities}
                            >
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Filter by Facility" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Facilities</SelectItem>
                                    {availableFacilities.map((facility) => (
                                        <SelectItem key={`facility-${facility.id}`} value={facility.id}>
                                            {facility.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={selectedRole}
                                onValueChange={setSelectedRole}
                                disabled={isLoadingUsers || isLoadingRoles}
                            >
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Filter by Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    {roles.map((role) => (
                                        <SelectItem key={`role-${role.id}`} value={role.name}>
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Active Filters Display */}
                        {hasActiveFilters && (
                            <div className="flex flex-wrap gap-2 pt-2 border-t">
                                <span className="text-sm text-gray-600">Active filters:</span>
                                {searchTerm && (
                                    <Badge variant="secondary" className="text-xs">
                                        Search: "{searchTerm}"
                                    </Badge>
                                )}
                                {selectedCountry !== "all" && (
                                    <Badge variant="secondary" className="text-xs">
                                        Country: {countries.find(c => c.id === selectedCountry)?.name || selectedCountry}
                                    </Badge>
                                )}
                                {selectedFacility !== "all" && (
                                    <Badge variant="secondary" className="text-xs">
                                        Facility: {facilities.find(f => f.id === selectedFacility)?.name || selectedFacility}
                                    </Badge>
                                )}
                                {selectedRole !== "all" && (
                                    <Badge variant="secondary" className="text-xs">
                                        Role: {roles.find(r => r.value === selectedRole)?.name || selectedRole}
                                    </Badge>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Staff List */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Staff List ({users.length})
                            {isLoadingUsers && <span className="text-sm text-gray-500 ml-2">Loading...</span>}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoadingUsers ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                                <p className="text-gray-500">Loading staff members...</p>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500 mb-4">
                                    {hasActiveFilters ? "No staff members match your current filters." : "No staff members found."}
                                </p>
                                {hasActiveFilters && (
                                    <Button variant="outline" onClick={clearAllFilters}>
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Countries</TableHead>
                                        <TableHead>Facilities</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">
											<Link to={`/staff/${user.id}/edit`}>
												{user.name}
											</Link>
											</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.phone}</TableCell>
                                            <TableCell>
                                                <Badge variant={getRoleBadgeVariant(user.roles[0]?.name || '')}>
                                                    {user.roles[0]?.name ?
                                                        user.roles[0].name.charAt(0).toUpperCase() + user.roles[0].name.slice(1)
                                                        : 'No Role'
                                                    }
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {user.countries?.map(c => c.name).join(", ") || 'No Countries'}
                                            </TableCell>
                                            <TableCell>
                                                {user.facilities?.map(f => f.name).join(", ") || 'No Facilities'}
                                            </TableCell>
                                            <TableCell>
												<div className="flex gap-2">
													{canEdit && (
														<Link to={`/staff/${user.id}/edit`}>
														<Button variant="outline" size="sm">
														<Edit className="h-3 w-3" />
														</Button>
														</Link>

													)}

                                                    {(canDelete && authUser.id != user.id) && (
														<Button
	                                                        variant="outline"
	                                                        size="sm"
	                                                        onClick={() => handleDeleteUser(user.id, user.name)}
	                                                    >
	                                                        <Trash2 className="h-3 w-3" />
	                                                    </Button>
													)}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
