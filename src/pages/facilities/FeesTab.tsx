import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save } from "lucide-react";
import api from "@/api/api";
import { useToast } from "@/hooks/use-toast";
import { useCan } from "@/utils/permissions";

interface Facility {
    id: number;
    name: string;
    admin_fee: string | number | null;
}

interface Country {
    id: number;
    name: string;
    monthly_insurance_fee: string | number | null;
    currency: string;
    facilities: Facility[];
}

interface FeesTabProps {
    countries: Country[];
}

export function FeesTab({ countries }: FeesTabProps) {
    const { toast } = useToast();

    const [formFee, setFormFee] = useState<Country[]>([]);
    const [errors, setErrors] = useState<Record<string, any>>({});

    useEffect(() => {
        if (countries && countries.length > 0) {
            const mapped = countries.map((c) => ({
                id: c.id,
                name: c.name,
                monthly_insurance_fee: c.monthly_insurance_fee,
                currency: c.currency,
                facilities: c.facilities || [],
            }));
            setFormFee(mapped);
        }
    }, [countries]);

    const handleSubmitFormFee = async () => {
        setErrors({});

        try {
            const res = await api.post("countries/update-fees", { countries: formFee });
            if (res.data.success) {
                toast({
                    title: "Success",
                    description: "Country fees updated successfully!",
                    variant: "success",
                });
            } else {
                toast({
                    title: "Error",
                    description: "Failed to update country fees.",
                    variant: "destructive",
                });
            }
        } catch (err: any) {
            if (err.response ?.data ?.errors) {
                setErrors(err.response.data.errors);
            }

            toast({
                title: "Error",
                description: "Failed to save changes.",
                variant: "destructive",
            });
        }
    };

	const canEdit = useCan('update-facility') || useCan('full access-facility');

    return (
        <div className="space-y-6">
            {/* Insurance Fees per Country */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Insurance Fee Per Month (Per Country)</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Country</TableHead>
                                    <TableHead>Monthly Insurance Fee</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {formFee.map((country, index) => (
                                    <TableRow key={country.id}>
                                        <TableCell className="font-medium">{country.name}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        value={country.monthly_insurance_fee || ""}
                                                        className="w-24"
                                                        disabled={!canEdit}
                                                        onChange={(e) => {
                                                            const updated = [...formFee];
                                                            updated[index].monthly_insurance_fee = e.target.value;
                                                            setFormFee(updated);
                                                        }}
                                                    />
                                                    <span>{country.currency}</span>
                                                </div>
                                                {errors[`countries.${index}.monthly_insurance_fee`] && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {errors[`countries.${index}.monthly_insurance_fee`][0]}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Admin Fee per Facility */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Admin Fee (Per Facility)</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Country</TableHead>
                                    <TableHead>Facility</TableHead>
                                    <TableHead>Admin Fee</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {formFee.map((country, cIndex) =>
                                    country.facilities ?.map((facility, fIndex) => (
                                        <TableRow key={`${country.id}-${facility.id}`}>
                                            <TableCell>{country.name}</TableCell>
                                            <TableCell>{facility.name}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            value={facility.admin_fee || ""}
                                                            className="w-24"
                                                            disabled={!canEdit}
                                                            onChange={(e) => {
                                                                const updated = [...formFee];
                                                                updated[cIndex].facilities[fIndex].admin_fee = e.target.value;
                                                                setFormFee(updated);
                                                            }}
                                                        />
                                                        <span>{country.currency}</span>
                                                    </div>
                                                    {errors[`countries.${cIndex}.facilities.${fIndex}.admin_fee`] && (
                                                        <p className="text-red-500 text-xs mt-1">
                                                            {errors[`countries.${cIndex}.facilities.${fIndex}.admin_fee`][0]}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                )}
                            </TableBody>
                        </Table>

                        {canEdit && (
                            <div className="flex justify-end">
                                <Button onClick={handleSubmitFormFee}>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                				</Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
