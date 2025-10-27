import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronsUpDown } from "lucide-react";
import api from "@/api/api";
import { useToast } from "@/hooks/use-toast";
import { useCan } from "@/utils/permissions";
import { cn } from "@/lib/utils";

type Permission = {
    id: number;
    name: string;
    module: string;
    description?: string | null;
};

type Role = {
    id: number;
    name: string;
    permissions: Permission[];
};

export function RolesPage() {
    const { toast } = useToast();
    const canUpdate = useCan("update-staff");

    const [roles, setRoles] = useState<Role[]>([]);
    const [modules, setModules] = useState<{ module: string; description: string | null }[]>([]);
    const [modulePermissions, setModulePermissions] = useState<Record<string, string[]>>({});

    const [editingRole, setEditingRole] = useState<number | null>(null);
    const [tempPermissions, setTempPermissions] = useState<Record<string, string[]>>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [rolesRes, permsRes] = await Promise.all([
                    api.get(`/roles`),
                    api.get(`/module-permissions`)
                ]);

                if (rolesRes.data.success) {
                    const data: Role[] = rolesRes.data.data;
                    setRoles(data);

                    const moduleMap: Record<string, string | null> = {};
                    data.forEach((role) => {
                        role.permissions ?.forEach((perm) => {
                            if (!moduleMap[perm.module]) {
                                moduleMap[perm.module] = perm.description || null;
                            }
                        });
                    });
                    setModules(
                        Object.entries(moduleMap).map(([module, description]) => ({
                            module,
                            description,
                        }))
                    );
                }

                if (permsRes.data.success) {
                    const rawModules = permsRes.data.data; // now an array of { name, description, permissions }
                    const permissionsMap: Record<string, string[]> = {};
                    const moduleList: { module: string; description: string | null }[] = [];

                    rawModules.forEach((m: any) => {
                        permissionsMap[m.name] = m.permissions || [];
                        moduleList.push({
                            module: m.name,
                            description: m.description || null,
                        });
                    });

                    setModulePermissions(permissionsMap);
                    setModules(moduleList);

                    console.log("✅ Normalized modulePermissions:", permissionsMap);
                    console.log("✅ Module list:", moduleList);
                }

            } catch (err) {
                console.error(err);
                toast({
                    title: "Error",
                    description: "Failed to load roles or permissions",
                    variant: "destructive",
                });
            }
        };

        fetchData();
    }, []);

    const handleEdit = (roleId: number) => {
        setEditingRole(roleId);
        const role = roles.find((r) => r.id === roleId);
        if (role) {
            const map: Record<string, string[]> = {};
            role.permissions.forEach((p) => {
                const base = p.name.replace(`-${p.module}`, "");
                map[p.module] = map[p.module] || [];
                map[p.module].push(base);
            });
            setTempPermissions(map);
        }
    };

	const handlePermissionToggle = (module: string, perm: string, checked: boolean) => {
    setTempPermissions((prev) => {
        const updated = { ...prev };
        const current = new Set(updated[module] || []);
        const allPerms = modulePermissions[module]?.map((p) => p.replace(`-${module}`, "")) || [];

        if (checked) {
            current.add(perm);

            if (perm === "full access") {
                allPerms.forEach((p) => current.add(p));
            } else {
                if (perm !== "read" && allPerms.includes("read")) {
                    current.add("read");
                }

                // if all normal perms (except "full access") are now checked, auto-add "full access"
                const withoutFull = allPerms.filter((p) => p !== "full access");
                const allChecked = withoutFull.every((p) => current.has(p));
                if (allChecked) {
                    current.add("full access");
                }
            }
        } else {
            current.delete(perm);

            if (perm === "full access") {
                current.clear();
            } else {
                current.delete("full access");
            }
        }

        updated[module] = Array.from(current);
        return updated;
    });
};


	const [saving, setSaving] = useState(false);

	const handleSave = async (roleId: number) => {
		try {
			setSaving(true);

			const response = await api.post(`/roles/${editingRole}/updatePermissions`, {
				permissions: tempPermissions,
			});

			if (response.data.success) {
				await fetchRoles();

				toast({
					title: "Success",
					description: "Permissions updated successfully",
					variant: "success",
				});
				setEditingRole(null);
			} else {
				toast({
                    title: "Error",
                    description: "Failed to update permissions",
                    variant: "destructive",
                });
			}
		} catch (error) {
			toast({
                title: "Error",
                description: "Something went wrong while saving",
                variant: "destructive",
            });
		} finally {
			setSaving(false);
		}
	};

	const fetchRoles = async () => {
		const rolesRes = await api.get(`/roles`);
		if (rolesRes.data.success) {
			setRoles(rolesRes.data.data);
		}
	};

    const handleCancel = () => {
        setEditingRole(null);
        setTempPermissions({});
    };

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Role Management</h1>
                    {editingRole && (
                        <div className="flex gap-2">
                            <Button onClick={handleSave}>Save</Button>
                            <Button variant="outline" onClick={handleCancel}>
                                Cancel
							</Button>
                        </div>
                    )}
                </div>

                {/* Role Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {roles.map((role) => (
                        <Card
                            key={role.id}
                            className="relative rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-4"
                        >
                            {/* Top-right edit button */}
                            {role.id === 1 ? (
                                <Button
                                    disabled
                                    variant="secondary"
                                    size="sm"
                                    className="absolute top-4 right-4 text-gray-600 bg-gray-100 cursor-not-allowed"
                                >
                                    Non-editable
						        </Button>
                            ) : (
                                    canUpdate && (
                                        <Button
                                            size="sm"
                                            variant={editingRole === role.id ? "default" : "outline"}
                                            onClick={() => handleEdit(role.id)}
                                            className="absolute top-4 right-4"
                                        >
                                            {editingRole === role.id ? "Editing..." : "Edit"}
                                        </Button>
                                    )
                                )}

                            {/* Card content */}
                            <CardHeader className="p-0">
                                <CardTitle className="text-base font-semibold text-gray-900 mb-1">
                                    {role.name}
                                </CardTitle>
                                <p className="text-sm text-gray-500 pt-3">
                                    {role.id === 1
                                        ? "Full system access with all administrative privileges."
                                        : ""}
                                </p>
                            </CardHeader>
                        </Card>
                    ))}
                </div>



                {/* Permission Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Permission Matrix</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Module</TableHead>
                                    {roles.map((role) => (
                                        <TableHead key={role.id}>{role.name}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {modules.map(({ module, description }) => (
                                    <TableRow key={module}>
                                        <TableCell className="font-medium">
                                            {description || module}
                                        </TableCell>

                                        {roles.map((role) => {
                                            const perms =
                                                editingRole === role.id
                                                    ? tempPermissions[module] || []
                                                    : role.permissions
                                                        .filter((p) => p.module === module)
                                                        .map((p) => p.name.replace(`-${p.module}`, ""));

                                            const options = modulePermissions[module] || [];
											const hasFullAccess = perms.includes("full access");

                                            return (
                                                <TableCell key={role.id}>
                                                    {editingRole === role.id ? (
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    role="combobox"
                                                                    className={cn(
                                                                        "w-[240px] justify-between",
                                                                        perms.length && "text-blue-700"
                                                                    )}
                                                                >
                                                                    {perms.length
                                                                        ? `${perms.length} selected`
                                                                        : "select permissions"}
                                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-[240px] p-2">
                                                                <div className="space-y-1">
                                                                    {options.map((perm) => {
                                                                        const permName = perm.replace(
                                                                            `-${module}`,
                                                                            ""
                                                                        );
                                                                        const checked = perms.includes(permName);
                                                                        return (
                                                                            <label
                                                                                key={permName}
                                                                                className="flex items-center gap-2 cursor-pointer hover:bg-accent rounded px-2 py-1"
                                                                            >
                                                                                <Checkbox
                                                                                    checked={checked}
                                                                                    onCheckedChange={(checked) =>
                                                                                        handlePermissionToggle(
                                                                                            module,
                                                                                            permName,
                                                                                            Boolean(checked)
                                                                                        )
                                                                                    }
                                                                                />
                                                                                <span className="text-sm capitalize">
                                                                                    {permName}
                                                                                </span>
                                                                            </label>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </PopoverContent>
                                                        </Popover>
													) : hasFullAccess ? (
														<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
															full access
														</span>
													) : perms.length ? (
														<div className="flex flex-wrap gap-1">
															{perms.map((perm) => {
																let badgeClass = "bg-gray-100 text-gray-800";
																if (perm === "view") badgeClass = "bg-blue-100 text-blue-800";
																else if (perm === "create") badgeClass = "bg-orange-100 text-orange-800";
																else if (perm === "update") badgeClass = "bg-sky-100 text-sky-800";
																else if (perm === "delete") badgeClass = "bg-red-100 text-red-800";

																return (
																	<span
																		key={perm}
																		className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${badgeClass}`}
																	>
																		{perm}
																	</span>
																);
															})}
														</div>
													) : (
														"—"
													)}

                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
