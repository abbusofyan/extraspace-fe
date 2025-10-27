import { useState, useEffect, useContext } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AuthContext } from "@/context/AuthContext";
import PhoneInput from "react-phone-input-2";
import { Textarea } from "@/components/ui/textarea";
import "react-phone-input-2/lib/style.css";
import api from "@/api/api";

export function ProfilePage() {
    const { toast } = useToast();
    const { user, setUser } = useContext(AuthContext);

    const [userInfo, setUserInfo] = useState({
        name: "",
        phone: "",
        email: "",
        country: "",
        facility: "",
        role: ""
    });

    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: ""
    });

    const [errors, setErrors] = useState<{ [key: string]: string[] }>({}); // ✅ validation errors

    useEffect(() => {
        if (user) {
            setUserInfo({
                name: user.name,
                phone: user.phone || "",
                email: user.email || "",
                country: user.countries?.map((f: any) => f.name).join(", ") || "",
                facility: user.facilities?.map((f: any) => f.name).join(", ") || "",
                role: user.roles?.[0]?.name || ""
            });
        }
    }, [user]);

	const handleUpdateProfile = async (e: React.FormEvent) => {
	    e.preventDefault();
	    setErrors({});

	    try {
	        const res = await api.post(`/currentUser/Update`, {
	            email: userInfo.email,
	            phone: userInfo.phone
	        });

	        const updatedUser = res.data.data.user;

	        // update AuthContext
	        setUser((prev: any) => ({
	            ...prev,
	            ...updatedUser
	        }));

	        // update local state so inputs reflect immediately
	        setUserInfo((prev) => ({
	            ...prev,
	            ...updatedUser
	        }));

	        toast({
	            title: "Success",
	            description: "Profile updated successfully",
	            variant: "success"
	        });
	    } catch (err: any) {
	        console.error(err);
	        if (err.response?.data?.errors) {
	            setErrors(err.response.data.errors);
	        }
	        toast({
	            title: "Error",
	            description: err.response?.data?.message || "Something went wrong while updating profile",
	            variant: "destructive",
	        });
	    }
	};

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwords.new !== passwords.confirm) {
            toast({ title: "Error", description: "New passwords don't match", variant: "destructive" });
            return;
        }

        if (passwords.new.length < 8) {
            toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" });
            return;
        }

        try {
            await api.post(`/currentUser/ChangePassword`, {
                password: passwords.current,
                new_password: passwords.new,
				new_password_confirmation: passwords.confirm
            });

            toast({ title: "Success", description: "Password reset successfully", variant: 'success' });
            setPasswords({ current: "", new: "", confirm: "" });
        } catch (err: any) {
            console.error(err);
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            }
            toast({
                title: "Error",
                description: err.response?.data?.message || "Failed to reset password",
                variant: "destructive"
            });
        }
    };

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">Profile</h1>

                <div className="grid gap-6 max-w-2xl">
                    {/* Profile Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" value={userInfo.name} readOnly className="bg-muted" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Role</Label>
                                        <Input id="role" value={userInfo.role} readOnly className="bg-muted" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone *</Label>
                                        <PhoneInput
                                            country={"sg"}
                                            value={userInfo.phone}
                                            onChange={(phone) =>
                                                setUserInfo((prev) => ({
                                                    ...prev,
                                                    phone,
                                                }))
                                            }
                                            enableSearch
                                            inputClass="!w-full !h-10 !text-sm"
                                            dropdownClass="!text-sm"
                                        />
                                        {errors.phone && (
                                            <p className="text-red-500 text-sm">{errors.phone[0]}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
											readOnly
											className="bg-muted"
                                            value={userInfo.email}
                                            onChange={(e) =>
                                                setUserInfo((prev) => ({
                                                    ...prev,
                                                    email: e.target.value,
                                                }))
                                            }
                                            placeholder="Enter email address"
                                        />
                                        {errors.email && (
                                            <p className="text-red-500 text-sm">{errors.email[0]}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Input id="country" value={userInfo.country} readOnly className="bg-muted" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="facility">Facility</Label>
									<Textarea
										id="facility"
										value={userInfo.facility}
										readOnly
										className="bg-muted"
									/>
                                </div>

                                <Button type="submit">Update Profile</Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Reset Password */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Reset Password</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password *</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        value={passwords.current}
                                        onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                                        placeholder="Enter current password"
                                    />
                                    {errors.password && (
                                        <p className="text-red-500 text-sm">{errors.password[0]}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password *</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={passwords.new}
                                        onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                                        placeholder="Enter new password"
                                    />
                                    {errors.new_password && (
                                        <p className="text-red-500 text-sm">{errors.new_password[0]}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={passwords.confirm}
                                        onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                                        placeholder="Confirm new password"
                                    />
                                </div>

                                <Button type="submit">Reset Password</Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
