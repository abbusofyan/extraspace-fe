import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Copy } from "lucide-react";
import api from "@/api/api";
import { useToast } from "@/hooks/use-toast";

export function PromotionDetailPage() {
	const { toast } = useToast();

    const { id } = useParams();
    const [promotion, setPromotion] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchPromotion = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/promotions/${id}`);
                setPromotion(response.data.data);
            } catch (err: any) {
                console.error("Failed to fetch promotion:", err);
                setError("Failed to fetch promotion details.");
            } finally {
                setLoading(false);
            }
        };

        fetchPromotion();
    }, [id]);

    const copyPromoCode = () => {
        if (promotion ?.promo_code) {
            navigator.clipboard.writeText(promotion.promo_code);
			toast({
				title: 'Info',
				description: 'Promotion code has been copied to clipboard.',
			})
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        return status === "active" ? "default" : "secondary";
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="p-6 text-center text-muted-foreground">Loading promotion details...</div>
            </AdminLayout>
        );
    }

    if (error || !promotion) {
        return (
            <AdminLayout>
                <div className="p-6 text-center">
                    <h1 className="text-2xl font-bold mb-4">{error || "Promotion Not Found"}</h1>
                    <Link to="/promotions">
                        <Button>Back to Promotions</Button>
                    </Link>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Link to="/promotions">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
        				</Button>
                    </Link>
                    <h1 className="text-3xl font-bold">Promotion Details</h1>
                    <Badge variant={getStatusBadgeVariant(promotion.status)} className="ml-auto">
                        {promotion.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Promotion ID</label>
                                <p className="font-mono font-medium">{promotion.identifier}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Promotion name</label>
                                <p className="font-medium">{promotion.name_en}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Discount type</label>
                                <p className="font-medium capitalize">{promotion.discount_type}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Minimum Storage Duration</label>
                                <p className="font-medium">{promotion.min_duration} months</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Discount$</label>
                                <p className="font-medium">
                                    {promotion.discount_amount ? `$${promotion.discount_amount}` : "NA"}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Discount%</label>
                                <p className="font-medium">
                                    {promotion.discount_percentage ? `${promotion.discount_percentage}%` : "NA"}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Number of months free</label>
                                <p className="font-medium">{promotion.number_of_months_free || "NA"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Which month free</label>
                                <p className="font-medium">{promotion.formatted_which_month_free || "NA"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">XAmount</label>
                                <p className="font-medium">{promotion.x_amount || "NA"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Promo code</label>
                                <div className="flex items-center gap-2 pt-1">
                                    <span className="font-mono font-medium">{promotion.promo_code}</span>
                                    <Button variant="outline" size="sm" onClick={copyPromoCode}>
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Redemptions & Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Redemptions & Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Number of redemptions available
                				</label>
                                <p className="font-medium">{promotion.total_quota}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Number of redemptions left
            					</label>
                                <p className="font-medium">{promotion.quota_left}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Status</label>
                                <div className="pt-1">
                                    <Badge variant={getStatusBadgeVariant(promotion.status_text)}>
                                        {promotion.status_text}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Location & Storage Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Location & Storage Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Storage country</label>
								<div className="space-y-1">
								    {[...new Set(promotion.facilities.map(f => f.country.name))].map((country, index) => (
								        <div key={index} className="text-sm">
								            {country}
								        </div>
								    ))}
								</div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Storage facility</label>
                                <div className="space-y-1">
                                    {promotion.facilities.map((facility, index) => (
                                        <div key={index} className="text-sm">
                                            {facility.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Storage unit type-size pair
                				</label>
                                <div className="font-medium space-y-1">
                                    {promotion.units.map((pair, index) => (
                                        <div key={index} className="text-sm">
                                            {pair.unit_type.name} - {pair.size.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Validity Period */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Validity Period</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Promotion start date
                				</label>
                                <p className="font-medium">{formatDate(promotion.start_date)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Promotion end date
                				</label>
                                <p className="font-medium">{formatDate(promotion.end_date)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
