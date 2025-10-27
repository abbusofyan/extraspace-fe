import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import api from "@/api/api";

// Types for API response
interface QuoteRequestDetail {
    id: string;
    formId: string;
    name: string;
    email: string;
    contact: string;
    facility: string;
    unitType: string;
    unitSize: string;
    duration: string;
    promoCodes: string[];
    submittedAt: string;
    status: string;
    quotedAmount?: number;
    pricePerUnit?: number;

    // Additional fields that might be in the detail response
    unitNumber?: string;
    area?: string;
    currency?: string;
    rentalFeePerMonth?: number;
    insuranceFeePerMonth?: number;
    adminFee?: number;
    securityDeposit?: number;
    reservationId?: string;

    // Customer additional info
    customerNotes?: string;
    specialRequirements?: string;

    // Facility details
    facilityAddress?: string;
    facilityContact?: string;

    // Pricing breakdown
    basePrice?: number;
    discountAmount?: number;
    totalPrice?: number;

    // Timestamps
    createdAt?: string;
    updatedAt?: string;
    quotedAt?: string;

    // Staff information
    assignedTo?: string;
    processedBy?: string;
}

export function FormEntryDetailPage() {
    const { id } = useParams();
    const [entry, setEntry] = useState<QuoteRequestDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuoteRequestDetail = async () => {
            if (!id) return;

            setLoading(true);
            try {
                const response = await api.get(`/quote-requests/${id}`);
                setEntry(response.data.data);
            } catch (err: any) {
                if (err.response ?.status === 404) {
                    setError('Quote request not found');
                } else {
                    setError('Failed to load quote request details');
                }
                console.error('Error fetching quote request detail:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchQuoteRequestDetail();
    }, [id]);

    const getStatusBadgeVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'quoted': return 'default';
            case 'processing': return 'secondary';
            case 'no-quotation': return 'destructive';
            case 'booked': return 'success';
            case 'cancelled': return 'destructive';
            default: return 'outline';
        }
    };

    const getOrdinal = (n: number) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount: number | undefined) => {
        if (amount === undefined || amount === null) return 'N/A';
        return `${amount.toFixed(2)}`;
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="p-6">
                    <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="ml-2">Loading quote request details...</span>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (error || !entry) {
        return (
            <AdminLayout>
                <div className="p-6">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">
                            {error || 'Quote Request Not Found'}
                        </h1>
                        <div className="space-x-2">
                            <Link to="/quote-requests">
                                <Button>Back to Form Entries</Button>
                            </Link>
                            {error && (
                                <Button variant="outline" onClick={() => window.location.reload()}>
                                    Retry
                				</Button>
                            )}
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Link to="/quote-requests">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
            			</Button>
                    </Link>
                    <h1 className="text-3xl font-bold">Quote Request Details</h1>
                    <Badge variant={getStatusBadgeVariant(entry.status_text)} className="ml-auto">
                        {entry.status_text.charAt(0).toUpperCase() + entry.status_text.slice(1).replace('-', ' ')}
                    </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Customer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Name</label>
                                <p className="font-medium">{entry.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Email</label>
                                <p className="font-medium">{entry.email}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Contact</label>
                                <p className="font-medium">{entry.phone}</p>
                            </div>
                            {entry.customerNotes && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Customer Notes</label>
                                    <p className="font-medium">{entry.customerNotes}</p>
                                </div>
                            )}
                            {entry.specialRequirements && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Special Requirements</label>
                                    <p className="font-medium">{entry.specialRequirements}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Form Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Form Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Form ID</label>
                                <p className="font-mono font-medium">{entry.code}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Date Submitted</label>
                                <p className="font-medium">{formatDate(entry.created_at)}</p>
                            </div>
                            {entry.quotedAt && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Date Quoted</label>
                                    <p className="font-medium">{formatDate(entry.quotedAt)}</p>
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Status</label>
                                <div className="pt-1">
                                    <Badge variant={getStatusBadgeVariant(entry.status_text)}>
                                        {entry.status_text.charAt(0).toUpperCase() + entry.status_text.slice(1).replace('-', ' ')}
                                    </Badge>
                                </div>
                            </div>
                            {entry.assignedTo && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
                                    <p className="font-medium">{entry.assignedTo}</p>
                                </div>
                            )}
                            {entry.processedBy && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Processed By</label>
                                    <p className="font-medium">{entry.processedBy}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Storage Requirements */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Storage Requirements</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Country</label>
                                <p className="font-medium">{entry.country.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Facility</label>
                                <p className="font-medium">{entry.facility.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Unit Type</label>
                                <p className="font-medium">{entry.unit_type.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Unit Size</label>
                                <p className="font-medium">{entry.size.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Storage Duration</label>
                                <p className="font-medium">{entry.duration_month} Month</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Move In Date</label>
                                <p className="font-medium">{entry.movein_date}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Promo Code Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">User Submitted Promo Code</label>
                                <p className="font-medium">{}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Applied Promo ID</label>
                                <p className="font-medium">{}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quoted Storage Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <table className="w-full text-sm table-fixed">
                                <tbody className="divide-y divide-gray-100">
                                    <tr>
                                        <td className="px-4 py-3 text-gray-600 w-1/2">Facility & Unit Size</td>
                                        <td className="px-4 py-3 text-gray-900 w-1/2">
                                            {entry.quotation ? (
                                                <>
                                                    {entry.quotation.facility ?.name} | {entry.quotation.requested_unit ?.area} {entry.country ?.area_unit}
                                                </>
                                            ) : (
                                                '-'
                                            )}
                                        </td>

                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 text-gray-600 w-1/2">Storage Type</td>
                                        <td className="px-4 py-3 text-gray-900 w-1/2">
                                            {entry.quotation ?.unit_type ?.name || '-'}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="px-4 py-3 text-gray-600 w-1/2">Approx. Dimensions</td>
                                        <td className="px-4 py-3 text-gray-900 w-1/2">
                                            {entry.quotation ?.requested_unit
                                                ? `${entry.quotation.requested_unit.formatted_length} (L) x ${entry.quotation.requested_unit.formatted_width} (W)`
                                                : '-'}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="px-4 py-3 text-gray-600 w-1/2">Storage Period</td>
                                        <td className="px-4 py-3 text-gray-900 w-1/2">
                                            {entry.quotation ? `${entry.duration_month} Month(s)` : '-'}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="px-4 py-3 text-gray-600 w-1/2">Discount Applied</td>
                                        <td className="px-4 py-3 text-gray-900 w-1/2">
                                            {entry.discount ? `${entry.discount}%` : '-'}
                                        </td>
                                    </tr>

                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quoted Cost Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <table className="w-full text-sm table-fixed">
                                {entry.quotation && (
                                    <tbody className="divide-y divide-gray-100">
                                        {Array.from({ length: entry.duration_month }, (_, i) => (
                                            <tr key={i}>
                                                <td className="px-4 py-3 text-gray-600 w-1/2">
                                                    {getOrdinal(i + 1)} Month Rent
											</td>
                                                <td className="px-4 py-3  text-gray-900 w-1/2">
                                                    {entry.quotation.formatted_monthly_rental_fee}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="font-semibold">
                                            <td className="px-4 py-3 w-1/2">Total rental fee</td>
                                            <td className="px-4 py-3 w-1/2">
                                                {entry.quotation.formatted_total_rental_fee}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 text-gray-600 w-1/2">
                                                Insurance ({entry.duration_month} months)
										</td>
                                            <td className="px-4 py-3 text-gray-900 w-1/2">
                                                {entry.quotation.formatted_total_insurance_fee}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 text-gray-600 w-1/2">Administrative Fee</td>
                                            <td className="px-4 py-3 text-gray-900 w-1/2">
                                                {entry.quotation.formatted_admin_fee}
                                            </td>
                                        </tr>
                                        <tr className="font-semibold">
                                            <td className="px-4 py-3 w-1/2">Subtotal</td>
                                            <td className="px-4 py-3 w-1/2">
                                                {entry.quotation.formatted_subtotal_exclude_tax}
                                            </td>
                                        </tr>
                                        {entry.quotation.country.tax && (
                                            <tr className="font-semibold">
                                                <td className="px-4 py-3 w-1/2">
                                                    Subtotal (incl. {entry.quotation.country.tax_name})
											</td>
                                                <td className="px-4 py-3 w-1/2">
                                                    {entry.quotation.formatted_subtotal_include_tax}
                                                </td>
                                            </tr>
                                        )}
                                        <tr>
                                            <td className="px-4 py-3 text-gray-600 w-1/2">Refundable Security Deposit</td>
                                            <td className="px-4 py-3 text-gray-900 w-1/2">
                                                {entry.quotation.formatted_monthly_rental_fee}
                                            </td>
                                        </tr>
                                        <tr className="font-bold">
                                            <td className="px-4 py-3 w-1/2">
                                                <h1 className="text-xl font-bold">
                                                    TOTAL
												</h1>
                                            </td>
                                            <td className="px-4 py-3 w-1/2">
                                                <h1 className="text-xl font-bold">
                                                    {entry.quotation.formatted_grand_total}
                                                </h1>
                                            </td>
                                        </tr>
                                    </tbody>
                                )}
                            </table>
                        </CardContent>
                    </Card>

                    {/* Reservation Information */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Reservation Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Reservation ID</label>
                                <p className="font-medium">
                                    {entry.reservationId || (entry.status === 'booked' ? 'Pending Assignment' : '-')}
                                </p>
                            </div>
                            {entry.createdAt && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Created At</label>
                                    <p className="font-medium">{formatDate(entry.createdAt)}</p>
                                </div>
                            )}
                            {entry.updatedAt && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                                    <p className="font-medium">{formatDate(entry.updatedAt)}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
