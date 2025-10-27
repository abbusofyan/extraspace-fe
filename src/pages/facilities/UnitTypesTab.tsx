import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Save, Plus, Edit, Trash2 } from "lucide-react";
import api from "@/api/api";
import { useToast } from "@/hooks/use-toast";

interface UnitTypesTabProps {
    unitTypes: UnitType[];
    setUnitTypes: React.Dispatch<React.SetStateAction<UnitType[]>>;
}

export function UnitTypesTab({ unitTypes, setUnitTypes }: UnitTypesTabProps) {
    const { toast } = useToast();

    const [unitTypeField, setUnitTypeField] = useState<string>("");
    const [errors, setErrors] = useState({});

    const handleSubmitUnitType = async () => {
        setErrors({});

        try {
            const res = await api.post("unit-types/create", { name: unitTypeField });
            if (res.data.success) {
                toast({
                    title: "Success",
                    description: res.data.message,
                    variant: 'success'
                });
                setUnitTypes((prev) => [...prev, res.data.data]);
                setUnitTypeField('');
            } else {
                toast({
                    title: "Error",
                    description: "Failed to add unit type.",
                    variant: "destructive",
                });
            }
        } catch (err) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            }

            toast({
                title: "Error",
                description: "Something went wrong while saving.",
                variant: "destructive",
            });
        }
    };

    const handleDeleteUnitType = async (id: string) => {
        if (!confirm("Are you sure you want to delete this unit type?")) return;

        try {
            const res = await api.delete(`/unit-types/${id}`);
            if (res.data.success) {
                toast({
                    title: "Success",
                    description: "Unit type deleted successfully!",
                    variant: 'success'
                });
                setUnitTypes(prev => prev.filter(ut => ut.id !== id));
            } else {
                toast({
                    title: "Error",
                    description: "Failed to delete unit type.",
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

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
						<CardTitle>Unit Types Management</CardTitle>
                    </div>
                </CardHeader>
				<CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {unitTypes.map((unitType) => {

                      return (
                        <div key={unitType.id} className="border rounded-lg p-3">
                          <div className="mb-2">
                            <span className="font-medium">{unitType.name}</span>
                          </div>
						  <div className="space-y-1 text-sm text-muted-foreground">
 						   <div>Korean: </div>
 						   <div>Simplified Chinese: </div>
 						   <div>Bahasa Malay: </div>
 						 </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>
    );
}
