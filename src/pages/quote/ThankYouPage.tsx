// src/pages/ThankYouPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import api from "@/api/api";
import { formatDate } from "@/utils/dateUtils";

interface QuoteData {
    id: string;
    date: string;
    code: string;
    email: string;
    created_at: string;
    duration_month: number;
    move_in_date: string;
    details: string;
    discount: string;
    country: { area_unit?: string };
    quotation?: {
        facility: { name: string };
        size: { name: string };
        unit_type: { name: string };
        requested_unit: { area: string; unique_offering: string };
        formatted_monthly_rental_fee: string;
        formatted_total_rental_fee: string;
        formatted_total_insurance_fee: string;
        formatted_admin_fee: string;
        formatted_subtotal_exclude_tax: string;
        formatted_subtotal_include_tax: string;
        formatted_grand_total: string;
        country: { tax?: boolean; tax_name?: string };
    };
}

export function ThankYouPage() {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<QuoteData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchQuote() {
            try {
                const res = await api.get(`/quote-requests/${id}`);
                setData(res.data.data);
            } catch (err) {
                console.error("Failed to fetch quote data:", err);
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchQuote();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500">
                Loading...
			</div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500">
                No data found.
			</div>
        );
    }

    if (data.quotation) {
        const getOrdinal = (n: number) => {
            const s = ["th", "st", "nd", "rd"];
            const v = n % 100;
            return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
        };

        return (
            <div className="min-h-screen bg-gray-50 py-10 px-4 flex justify-center">
                <div className="w-full max-w-3xl">
                    <div
                        className="text-white rounded-2xl p-8 flex items-center justify-between relative overflow-hidden"
                        style={{
                            backgroundColor: "#204ECF",
                            backgroundImage: `
								linear-gradient(to right, rgba(0,0,0,0.35) 1px, transparent 1px),
								linear-gradient(to bottom, rgba(0,0,0,0.35) 1px, transparent 1px)
							`,
                            backgroundSize: "40px 40px",
                        }}
                    >
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background: `
									linear-gradient(to right,
										#204ECF 0%,
										transparent 20%,
										transparent 80%,
										#204ECF 100%
									)
								`
                            }}
                        />

                        <div className="relative z-10">
                            <h1
                                style={{
                                    fontWeight: 400,
                                    fontStyle: "normal",
                                    fontSize: "49px",
                                    lineHeight: "120%",
                                }}
                                className="mb-1"
                            >
                                Almost Done!
    						</h1>
                        </div>
                        <img
                            src="/img/Get Price Summary Port Hole.png"
                            alt="Thank you"
                            className="h-auto rounded-full relative z-10"
                        />
                    </div>

                    <Card className="mt-8 border-0 shadow-sm rounded-2xl">
                        <CardContent className="p-8">
                            <div>
                                <p className="font-semibold text-gray-900">
                                    Date: <span className="text-gray-600">{formatDate(data.created_at)}</span>
                                </p>
                                <p className="font-semibold text-gray-900">
                                    Reference No: <span className="text-gray-600">{data.code}</span>
                                </p>
                            </div>

                            <br />
                            <div className="overflow-hidden rounded-2xl border border-gray-200">
                                <table className="w-full text-sm table-fixed">
                                    <thead className="bg-blue-50 text-blue-800">
                                        <tr>
                                            <th className="text-left px-4 py-3 font-semibold w-1/2">Unit Details</th>
                                            <th className="text-left px-4 py-3 font-semibold w-1/2">Information</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        <tr>
                                            <td className="px-4 py-3 text-gray-600 w-1/2">Facility & Unit Size</td>
                                            <td className="px-4 py-3 text-gray-900 w-1/2">
                                                {data.quotation.facility.name} | {data.quotation.size.name}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 text-gray-600 w-1/2">Storage Type</td>
                                            <td className="px-4 py-3 text-gray-900 w-1/2">
                                                {data.quotation.unit_type.name}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 text-gray-600 w-1/2">Approx. Dimensions</td>
                                            <td className="px-4 py-3 text-gray-900 w-1/2">
                                                {data.quotation.requested_unit.area} {data.country.area_unit}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 text-gray-600 w-1/2">Storage Period</td>
                                            <td className="px-4 py-3 text-gray-900 w-1/2">
                                                {data.duration_month} Month(s)
											</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 text-gray-600 w-1/2">Move In Date</td>
                                            <td className="px-4 py-3 text-gray-900 w-1/2">{data.move_in_date}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 text-gray-600 w-1/2">Other details</td>
                                            <td className="px-4 py-3 text-gray-900 w-1/2">{data.details}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 text-gray-600 w-1/2">Discount Applied</td>
                                            <td className="px-4 py-3 text-gray-900 w-1/2">{data.discount}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <p className="mt-5 font-semibold text-gray-900">Your Exclusive Perks and Benefits:</p>
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: data.quotation.requested_unit.unique_offering,
                                }}
                            />

                            <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200">
                                <table className="w-full text-sm table-fixed">
                                    <thead className="bg-blue-50 text-blue-800">
                                        <tr>
                                            <th className="text-left px-4 py-3 font-semibold w-1/2">Item Description</th>
                                            <th className="text-left px-4 py-3 font-semibold w-1/2">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {Array.from({ length: data.duration_month }, (_, i) => (
                                            <tr key={i}>
                                                <td className="px-4 py-3 text-gray-600 w-1/2">
                                                    {getOrdinal(i + 1)} Month Rent
												</td>
                                                <td className="px-4 py-3 font-semibold text-gray-900 w-1/2">
                                                    {data.quotation.formatted_monthly_rental_fee}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="bg-blue-100 font-semibold text-blue-900">
                                            <td className="px-4 py-3 w-1/2">Total rental fee</td>
                                            <td className="px-4 py-3 w-1/2">
                                                {data.quotation.formatted_total_rental_fee}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 text-gray-600 w-1/2">
                                                Insurance ({data.duration_month} months)
											</td>
                                            <td className="px-4 py-3 text-gray-900 w-1/2">
                                                {data.quotation.formatted_total_insurance_fee}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 text-gray-600 w-1/2">Administrative Fee</td>
                                            <td className="px-4 py-3 text-gray-900 w-1/2">
                                                {data.quotation.formatted_admin_fee}
                                            </td>
                                        </tr>
                                        <tr className="bg-blue-100 font-semibold text-blue-900">
                                            <td className="px-4 py-3 w-1/2">Subtotal</td>
                                            <td className="px-4 py-3 w-1/2">
                                                {data.quotation.formatted_subtotal_exclude_tax}
                                            </td>
                                        </tr>
                                        {data.quotation.country.tax && (
                                            <tr className="bg-blue-100 font-semibold text-blue-900">
                                                <td className="px-4 py-3 w-1/2">
                                                    Subtotal (incl. {data.quotation.country.tax_name})
												</td>
                                                <td className="px-4 py-3 w-1/2">
                                                    {data.quotation.formatted_subtotal_include_tax}
                                                </td>
                                            </tr>
                                        )}
                                        <tr>
                                            <td className="px-4 py-3 text-gray-600 w-1/2">Refundable Security Deposit</td>
                                            <td className="px-4 py-3 text-gray-900 w-1/2">
                                                {data.quotation.formatted_monthly_rental_fee}
                                            </td>
                                        </tr>
                                        <tr className="bg-red-600 text-white font-bold">
                                            <td className="px-4 py-3 w-1/2">TOTAL</td>
                                            <td className="px-4 py-3 w-1/2">
                                                {data.quotation.formatted_grand_total}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-8 flex flex-wrap justify-center gap-4">
                                <button className="bg-[#204ECF] text-white font-medium px-8 py-3 rounded-full shadow-sm hover:bg-[#1A3FB0] transition">
                                    Book Now
								</button>
                                <button className="border border-gray-400 text-gray-800 font-medium px-8 py-3 rounded-full hover:bg-gray-100 transition">
                                    Reserve Now
								</button>
                                <button className="border border-gray-400 text-gray-800 font-medium px-8 py-3 rounded-full hover:bg-gray-100 transition">
                                    Book a Viewing
								</button>
                            </div>

                            <div className="mt-8 bg-gray-100 rounded-2xl p-6">
                                <h3 className="font-semibold text-gray-800 mb-3">Terms & Conditions</h3>
                                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                                    <li>Rates quoted are for non–air-conditioned storage units only.</li>
                                    <li>Additional one-time discount for 3+ months.</li>
                                    <li>Admin fee waived upon sign-up.</li>
                                    <li>Security deposit may vary depending on duration.</li>
                                    <li>30% off moving services for 6+ months.</li>
                                    <li>Exclusive SG$60 discount at Tai Seng facility.</li>
                                    <li>Quote Reference Number to enjoy promos.</li>
                                    <li>Other terms and conditions apply.</li>
                                </ul>
                            </div>

                            <p className="mt-6 text-gray-400 text-sm text-center">
                                All information has been sent to your email:{" "}
                                <a
                                    href={`mailto:${data.email}`}
                                    className="text-blue-600 font-medium hover:underline"
                                >
                                    {data.email}
                                </a>
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-6 flex justify-center items-center">
            <div className="max-w-2xl w-full space-y-6">
                <Card className="text-center">
                    <CardContent className="pt-6 space-y-6">
                        <div className="flex justify-center mb-4">
                            <CheckCircle className="h-16 w-16 text-green-500" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Thank You!</h1>
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-sm text-muted-foreground">Reference ID:</span>
                            <Badge variant="outline" className="font-mono">
                                {data.code}
                            </Badge>
                        </div>
                        <p className="text-base text-muted-foreground max-w-md mx-auto">
                            Your request has been successfully submitted. Our staff will contact you soon! For
							other queries, contact us at{" "}
                            <a href="mailto:info@extraspaceasia.com" className="text-primary hover:underline">
                                info@extraspaceasia.com
							</a>
                            .
						</p>
                    </CardContent>
                </Card>

                <div className="flex gap-4">
                    <Link to="/quote/sg" className="flex-1">
                        <Button variant="outline" className="w-full">
                            Submit Another Quote
						</Button>
                    </Link>
                    <Button className="flex-1" onClick={() => window.close()}>
                        Close Window
					</Button>
                </div>
            </div>
        </div>
    );
}
