import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as RadixSelect from "@radix-ui/react-select";
import { Badge } from "@/components/ui/badge";
import { Check, X, ArrowLeft, Plus, Loader2, Send, Calendar as CalendarIcon, MapPin, Maximize2, Package, Clock, ArrowRight } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import api from "@/api/api";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import PhoneInput from "react-phone-input-2";

// Mock promo codes for validation
const validPromoCodes = ["SAVE10", "WELCOME20", "STUDENT15", "NEWBIE5"];

interface Facility {
    id: string;
    name: string;
    countryCode: string;
}

interface UnitType {
    id: string;
    name: string;
    facilityId: string;
}

interface UnitSize {
    id: string;
    name: string;
    unitTypeId: string;
}

export function QuoteFormPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { countryCode } = useParams<{ countryCode: string }>();
    const { t, i18n } = useTranslation("quoteForm");
    const { lng } = useParams<{ formId?: string; lng?: string }>();

    const [step, setStep] = useState<1 | 2>(1);
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
    const [unitSizes, setUnitSizes] = useState<UnitSize[]>([]);
    const [loadingFacilities, setLoadingFacilities] = useState(false);
    const [loadingUnitTypes, setLoadingUnitTypes] = useState(false);
    const [loadingUnitSizes, setLoadingUnitSizes] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [promoValidation, setPromoValidation] = useState<(boolean | null)[]>([null]);
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
    const [submitting, setSubmitting] = useState(false);

    const [searchParams] = useSearchParams();
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    useEffect(() => {
        // Run only when facilities are loaded
        if (initialLoadComplete || facilities.length === 0) return;

        // Get params once
        const facilityParam = searchParams.get("facility");
        const unitTypeParam = searchParams.get("unitType");
        const sizeParam = searchParams.get("size");

        if (!facilityParam) {
            setInitialLoadComplete(true);
            return;
        }

        // ✅ Freeze all values as constants now (no dependence on React state)
        const facilityId = parseInt(facilityParam, 10);
        const unitTypeId = unitTypeParam ? parseInt(unitTypeParam, 10) : null;
        const sizeId = sizeParam ? parseInt(sizeParam, 10) : null;

        // Use an IIFE to ensure fresh scope
        (async () => {
            try {
                setFormData((prev) => ({ ...prev, facility: facilityId }));

                setLoadingUnitTypes(true);
                const unitTypesRes = await api.get(`facilities/${facilityId}/get-unit-types`);
                const fetchedUnitTypes = unitTypesRes.data.success ? unitTypesRes.data.data : [];
                setUnitTypes(fetchedUnitTypes);
                setLoadingUnitTypes(false);

                if (unitTypeId && fetchedUnitTypes.length > 0) {
                    setLoadingUnitSizes(true);

                    const url = `unit-types/${facilityId}/${unitTypeId}/get-sizes`;

                    const unitSizesRes = await api.get(url);
                    const fetchedUnitSizes = unitSizesRes.data.success ? unitSizesRes.data.data : [];
                    setUnitSizes(fetchedUnitSizes);
                    setLoadingUnitSizes(false);

                    setFormData((prev) => ({ ...prev, unitType: unitTypeId }));
                }
            } catch (error) {
                console.error("Error auto-selecting from URL:", error);
            } finally {
                setInitialLoadComplete(true);
            }
        })();
    }, [facilities, searchParams, initialLoadComplete]);



    const [formData, setFormData] = useState({
        country: countryCode,
        facility: "",
        unitType: "",
        unitSize: "",
        duration: "",
        name: "",
        email: "",
        moveInDate: "",
        phone: "",
        promoCodes: [""] as string[],
    });

    // Language setup
    useEffect(() => {
        const newLng = lng || "en";
        if (i18n.language !== newLng) i18n.changeLanguage(newLng);
    }, [lng, i18n]);

    // Fetch facilities
    useEffect(() => {
        const fetchFacilities = async () => {
            if (!countryCode) return;
            setLoadingFacilities(true);
            try {
                const res = await api.get(`/facilities/getByCountryCode/${countryCode}`);
                if (res.data.success) setFacilities(res.data.data || []);
                else toast({ title: "Error", description: "Failed to load facilities", variant: "destructive" });
            } catch {
                toast({ title: "Error", description: "Could not fetch facilities", variant: "destructive" });
            } finally {
                setLoadingFacilities(false);
            }
        };
        fetchFacilities();
    }, [countryCode, toast]);

    // Fetch unit types and sizes
    const fetchUnitTypes = async (facilityId: string) => {
        if (!facilityId) return;
        setLoadingUnitTypes(true);
        try {
            const res = await api.get(`/facilities/${facilityId}/get-unit-types`);
            setUnitTypes(res.data.success ? res.data.data : []);
        } catch {
            toast({ title: "Error", description: "Could not fetch unit types", variant: "destructive" });
        } finally {
            setLoadingUnitTypes(false);
        }
    };

    const fetchUnitSizes = async (unitTypeId: string) => {
        if (!unitTypeId) return;
        setLoadingUnitSizes(true);
        try {
            const res = await api.get(`/unit-types/${formData.facility}/${unitTypeId}/get-sizes`);
            setUnitSizes(res.data.success ? res.data.data : []);
        } catch {
            toast({ title: "Error", description: "Could not fetch unit sizes", variant: "destructive" });
        } finally {
            setLoadingUnitSizes(false);
        }
    };

    const handleFacilityChange = (facilityId: string) => {
        setFormData((prev) => ({ ...prev, facility: parseInt(facilityId), unitType: "", unitSize: "" }));
        setUnitTypes([]);
        setUnitSizes([]);
        fetchUnitTypes(facilityId);
    };

    const handleUnitTypeChange = (unitTypeId: string) => {
        setFormData((prev) => ({ ...prev, unitType: parseInt(unitTypeId), unitSize: "" }));
        setUnitSizes([]);
        fetchUnitSizes(unitTypeId);
    };

    const handlePromoCodeChange = (index: number, value: string) => {
        const newCodes = [...formData.promoCodes];
        newCodes[index] = value;
        setFormData((prev) => ({ ...prev, promoCodes: newCodes }));

        const newValidation = [...promoValidation];
        newValidation[index] = value.trim() === "" ? null : validPromoCodes.includes(value.trim().toUpperCase());
        setPromoValidation(newValidation);
    };

    const addPromoCodeField = () => {
        if (formData.promoCodes.length < 4) {
            setFormData((p) => ({ ...p, promoCodes: [...p.promoCodes, ""] }));
            setPromoValidation((p) => [...p, null]);
        }
    };

    const removePromoCodeField = (index: number) => {
        if (formData.promoCodes.length > 1) {
            const newCodes = formData.promoCodes.filter((_, i) => i !== index);
            const newValidation = promoValidation.filter((_, i) => i !== index);
            setFormData((p) => ({ ...p, promoCodes: newCodes }));
            setPromoValidation(newValidation);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setSubmitting(true);

        try {
            const res = await api.post("/quote-requests/submit", formData);

            if (res.data.success) {
                toast({ title: "Success", description: res.data.message, variant: "success" });
				window.parent.postMessage(
					{ status: "success", url: window.location.origin + '/quote/thank-you/' + res.data.data.id },
					"*"
				);
                navigate(`/quote/thank-you/${res.data.data.id}/${lng}`);
            } else {
                toast({ title: "Error", description: "Submission failed", variant: "destructive" });
            }
        } catch (error: any) {
            if (error.response ?.status === 422) {
                const validationErrors = error.response.data.errors || {};
                setErrors(validationErrors);

                const step1Fields = ["facility", "unitType", "unitSize", "duration", "moveInDate"];
                const step2Fields = ["name", "email", "phone"];

                const hasStep1Error = Object.keys(validationErrors).some((key) => step1Fields.includes(key));
                const hasStep2Error = Object.keys(validationErrors).some((key) => step2Fields.includes(key));

                if (hasStep1Error) {
                    setStep(1);
                } else if (hasStep2Error) {
                    setStep(2);
                }

                toast({ title: "Validation Error", description: "Please fix the highlighted fields.", variant: "destructive" });
            } else {
                toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const getValidPromoCodes = () => {
        return formData.promoCodes.filter((code, i) => code.trim() !== "" && promoValidation[i]);
    };

    return (
        <div className="min-h-screen bg-[#4a4a4a] flex justify-center sm:p-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <div className="w-full max-w-[520px] pt-8">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-[32px] font-normal text-white mb-2">Get Started</h1>
                    <p className="text-white/90 text-[15px] font-light">Fill up your storage requirements to get instant pricing!</p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center justify-center mb-6">
                    <div className={`flex items-center gap-2 ${step === 1 ? "text-white" : "text-white/60"}`}>
                        <div className={`h-8 w-8 flex items-center justify-center rounded-full text-[15px] font-medium ${step === 1 ? "bg-white text-[#4a4a4a]" : "bg-transparent border-2 border-white/60"}`}>
                            1
                        </div>
                        <span className="text-[15px] font-normal">Unit Details</span>
                    </div>
                    <div className="w-20 border-t border-white/40 mx-4"></div>
                    <div className={`flex items-center gap-2 ${step === 2 ? "text-white" : "text-white/60"}`}>
                        <div className={`h-8 w-8 flex items-center justify-center rounded-full text-[15px] font-medium ${step === 2 ? "bg-white text-[#4a4a4a]" : "bg-transparent border-2 border-white/60"}`}>
                            2
                        </div>
                        <span className="text-[15px] font-normal">Customer Details</span>
                    </div>
                </div>

                {/* Form Card */}
                <Card className="bg-[#4a4a4a] border-0 rounded-[32px]">
                    <CardContent className="p-6 sm:p-8">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {step === 1 && (
                                <>
                                    {/* Facility */}
                                    <div className="space-y-2">
                                        <Label className="text-white text-[13px] font-normal">Storage Facility *</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white z-10 pointer-events-none" />
                                            <Select value={formData.facility} onValueChange={handleFacilityChange}>
                                                <SelectTrigger className="bg-transparent border-2 border-white/30 text-white rounded-full h-[52px] pl-12 pr-4 hover:border-white/50 focus:border-white/50 text-[15px]">
                                                    <SelectValue placeholder={loadingFacilities ? "Loading..." : "Select Storage Facility"} />
                                                </SelectTrigger>

                                                <SelectContent
                                                    className="bg-[#3f3f3f] border border-white/20 rounded-2xl shadow-lg text-white px-2 py-3 space-y-1"
                                                >
                                                    {facilities.map((f) => (
                                                        <RadixSelect.Item
                                                            key={f.id}
                                                            value={(f.id)}
                                                            className={`
																relative flex
																text-[16px] font-medium py-3 px-4 rounded-lg select-none cursor-pointer transition-all
																text-white data-[highlighted]:bg-white data-[highlighted]:text-black
																data-[state=checked]:bg-white data-[state=checked]:text-black
															`}
                                                        >
                                                            <RadixSelect.ItemText>{f.name}</RadixSelect.ItemText>
                                                            <RadixSelect.ItemIndicator className="hidden" />
                                                        </RadixSelect.Item>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                        </div>
                                        {errors.facility && <p className="text-red-400 text-xs mt-1">{errors.facility[0]}</p>}
                                    </div>

                                    {/* Storage Size & Unit Type */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label className="text-white text-[13px] font-normal">Storage Unit type</Label>
                                            <div className="relative">
                                                {loadingUnitTypes ? (
                                                    <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white z-10 pointer-events-none animate-spin" />
                                                ) : (
                                                        <Package className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white z-10 pointer-events-none" />
                                                    )}
                                                <Select
                                                    value={formData.unitType}
                                                    onValueChange={handleUnitTypeChange}
                                                    disabled={loadingUnitTypes}
                                                >
                                                    <SelectTrigger className="bg-transparent border-2 border-white/30 text-white rounded-full h-[52px] pl-12 pr-4 hover:border-white/50 focus:border-white/50 text-[15px] disabled:opacity-60 disabled:cursor-not-allowed">
                                                        <SelectValue
                                                            placeholder={
                                                                loadingUnitTypes ? "Loading..." : "Select Storage Unit Type"
                                                            }
                                                        />
                                                    </SelectTrigger>

                                                    <SelectContent
                                                        position="popper"
                                                        className="bg-[#3f3f3f] border border-white/20 rounded-2xl shadow-lg text-white px-2 py-3 space-y-1 w-[280px] max-h-[250px] overflow-y-auto"
                                                    >
                                                        {!formData.facility && (
                                                            <RadixSelect.Item
                                                                value="0"
                                                                disabled
                                                                className="text-white/60 text-[16px] py-3 px-4 text-center"
                                                            >
                                                                <RadixSelect.ItemText>Select a facility first</RadixSelect.ItemText>
                                                                <RadixSelect.ItemIndicator className="hidden" />
                                                            </RadixSelect.Item>
                                                        )}

                                                        {unitTypes.map((u) => (
                                                            <RadixSelect.Item
                                                                key={u.id}
                                                                value={(u.id)}
                                                                className={`
																	relative flex
																	text-[16px] font-medium py-3 px-4 rounded-lg select-none cursor-pointer transition-all
																	text-white data-[highlighted]:bg-white data-[highlighted]:text-black
																	data-[state=checked]:bg-white data-[state=checked]:text-black
																`}
                                                            >
                                                                <RadixSelect.ItemText>{u.name}</RadixSelect.ItemText>
                                                                <RadixSelect.ItemIndicator className="hidden" />
                                                            </RadixSelect.Item>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {errors.unitType && <p className="text-red-400 text-xs mt-1">{errors.unitType[0]}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-white text-[13px] font-normal">Storage Size *</Label>
                                            <div className="relative">
                                                {loadingUnitSizes ? (
                                                    <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white z-10 pointer-events-none animate-spin" />
                                                ) : (
                                                        <Maximize2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white z-10 pointer-events-none" />
                                                    )}
                                                <Select
                                                    value={formData.unitSize}
                                                    onValueChange={(v) => setFormData((p) => ({ ...p, unitSize: v }))}
                                                    disabled={loadingUnitSizes}
                                                >
                                                    <SelectTrigger className="bg-transparent border-2 border-white/30 text-white rounded-full h-[52px] pl-12 pr-4 hover:border-white/50 focus:border-white/50 text-[15px] disabled:opacity-60 disabled:cursor-not-allowed">
                                                        <SelectValue
                                                            placeholder={loadingUnitSizes ? "Loading..." : "Select Storage Size"}
                                                        />
                                                    </SelectTrigger>

                                                    <SelectContent
                                                        position="popper"
                                                        className="bg-[#3f3f3f] border border-white/20 rounded-2xl shadow-lg text-white px-2 py-3 space-y-1 w-[280px] max-h-[250px] overflow-y-auto"
                                                    >
                                                        {!formData.unitType && (
                                                            <SelectItem
                                                                value="0"
                                                                disabled
                                                                className="text-white/60 text-[16px] py-3 px-4 text-center"
                                                            >
                                                                Select unit type first
  															</SelectItem>
                                                        )}

                                                        {unitSizes.map((s) => (
                                                            <RadixSelect.Item
                                                                key={s.id}
                                                                value={String(s.id)}
                                                                className={`
																	relative flex items-center text-[16px] font-medium py-3 px-4 rounded-lg select-none cursor-pointer transition-all
																	bg-transparent text-white
																	hover:bg-white hover:text-black
																	data-[state=checked]:bg-white data-[state=checked]:text-black
														        `}
                                                            >
                                                                <RadixSelect.ItemText>{s.name}</RadixSelect.ItemText>
                                                                <RadixSelect.ItemIndicator className="hidden" />
                                                            </RadixSelect.Item>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                            </div>
                                            {errors.unitSize && <p className="text-red-400 text-xs mt-1">{errors.unitSize[0]}</p>}
                                        </div>
                                    </div>

                                    {/* Storage Duration */}
                                    <div className="space-y-2">
                                        <Label className="text-white text-[13px] font-normal">Storage Duration *</Label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white z-10 pointer-events-none" />
                                            <Select
                                                value={formData.duration}
                                                onValueChange={(v) => setFormData((p) => ({ ...p, duration: v }))}
                                            >
                                                <SelectTrigger className="bg-transparent border-2 border-white/30 text-white rounded-full h-[52px] pl-12 pr-4 hover:border-white/50 focus:border-white/50 text-[15px]">
                                                    <SelectValue placeholder="Select Duration" />
                                                </SelectTrigger>

                                                <SelectContent
                                                    position="popper"
                                                    align="start"
                                                    className="min-w-full bg-[#3f3f3f] border border-white/20 rounded-2xl shadow-lg text-white px-2 py-3 space-y-1 max-h-[250px] overflow-y-auto"
                                                >
                                                    {[...Array(12)].map((_, i) => (
                                                        <RadixSelect.Item
                                                            key={i + 1}
                                                            value={(i + 1).toString()}
                                                            className={`
																w-full text-[16px] font-medium py-3 px-4 rounded-lg select-none cursor-pointer transition-all
																text-white data-[highlighted]:bg-white data-[highlighted]:text-black
																data-[state=checked]:bg-white data-[state=checked]:text-black
													        `}
                                                        >
                                                            <RadixSelect.ItemText>{i + 1} month(s)</RadixSelect.ItemText>
                                                            <RadixSelect.ItemIndicator className="hidden" />
                                                        </RadixSelect.Item>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                        </div>
                                        {errors.duration && <p className="text-red-400 text-xs mt-1">{errors.duration[0]}</p>}
                                    </div>

                                    {/* Move In Date */}
                                    <div className="space-y-2">
                                        <Label className="text-white text-[13px] font-normal">Move in Date</Label>
                                        <div className="relative">
                                            <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white z-10 pointer-events-none" />
                                            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="w-full bg-transparent border-2 border-white/30 text-white rounded-full h-[52px] pl-12 pr-4 hover:border-white/50 hover:bg-transparent focus:border-white/50 justify-start text-left font-normal text-[15px]"
                                                    >
                                                        {formData.moveInDate || "Select Move in Date"}
                                                    </Button>
                                                </PopoverTrigger>

                                                <PopoverContent
                                                    align="start"
                                                    className="bg-[#3f3f3f] text-white p-4 rounded-2xl shadow-xl border border-white/20 w-[340px]"
                                                >
                                                    <Calendar
                                                        mode="single"
                                                        selected={selectedDate}
                                                        onSelect={(date) => {
                                                            if (date) {
                                                                setSelectedDate(date);
                                                                setFormData((prev) => ({
                                                                    ...prev,
                                                                    moveInDate: format(date, "PPP"),
                                                                }));
                                                                setIsCalendarOpen(false);
                                                            }
                                                        }}
                                                        disabled={(date) => {
                                                            const today = new Date();
                                                            const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

                                                            if (today.getDate() === 1) {
                                                                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                                                                const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                                                                return date < startOfMonth || date > endOfMonth;
                                                            } else {
                                                                const maxDate = new Date(today);
                                                                maxDate.setDate(today.getDate() + 30);
                                                                return date < startOfToday || date > maxDate;
                                                            }
                                                        }}
                                                        initialFocus
                                                        className={cn(
                                                            "p-3 pointer-events-auto text-white bg-[#3f3f3f] rounded-2xl",
                                                            "[&_table]:w-full [&_table]:border-separate [&_table]:border-spacing-2"
                                                        )}
                                                        classNames={{
                                                            nav_button: "text-white hover:bg-white/10 rounded-full transition-colors",
                                                            caption_label: "text-lg font-medium text-white",
                                                            head_cell: "text-xs text-white/70 font-medium pb-2",
                                                            day: cn(
                                                                "h-10 w-10 text-sm font-medium rounded-md border border-white/40 text-white transition-all",
                                                                "hover:bg-white hover:text-black focus:bg-white focus:text-black",
                                                                "data-[selected]:bg-white data-[selected]:text-black"
                                                            ),
                                                            day_disabled: "opacity-30 cursor-not-allowed",
                                                        }}
                                                    />

                                                    <div className="mt-3 pt-3 border-t border-white/20">
                                                        <Button
                                                            variant="outline"
                                                            className="w-full bg-white text-black hover:bg-white/90 rounded-full font-medium text-[15px]"
                                                            onClick={() => {
                                                                setFormData((prev) => ({
                                                                    ...prev,
                                                                    moveInDate: 'Move in after 1 month',
                                                                }));
                                                                setSelectedDate(undefined);
                                                                setIsCalendarOpen(false);
                                                            }}
                                                        >
                                                            Move in after 1 month
      													</Button>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>

                                        </div>
                                    </div>

                                    {/* Promo Code */}
                                    <div className="space-y-2">
                                        <Label className="text-white text-[13px] font-normal">Promo Code</Label>
                                        <div className="bg-[#5a7a5e] border-2 border-[#6a8a6e] rounded-full px-5 py-3.5 flex items-center justify-between">
                                            <div>
                                                <p className="text-white font-normal text-[15px]">1st month free with min 5 months</p>
                                                <p className="text-white/90 text-[11px] mt-0.5 uppercase tracking-wide">ISTCOMER</p>
                                            </div>
                                            <Check className="h-5 w-5 text-white flex-shrink-0 ml-3" />
                                        </div>
                                    </div>

                                    {/* Next Button */}
                                    <div className="pt-3">
                                        <Button
                                            type="button"
                                            className="bg-white text-[#4a4a4a] hover:bg-white/90 rounded-full h-[48px] px-7 font-medium text-[15px] shadow-md"
                                            onClick={() => setStep(2)}
                                        >
                                            Next <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Terms */}
                                    <p className="text-white/70 text-[11px] leading-relaxed pt-2">
                                        By clicking the above button, you agree to our <span className="font-semibold text-white">Terms of Service</span> and have read and understood our <span className="font-semibold text-white">Privacy Policy</span>.
                                    </p>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    {/* Full Name */}
                                    <div className="space-y-2">
                                        <Label className="text-white text-[13px] font-normal">Full Name *</Label>
                                        <div className="relative">
                                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white z-10 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <Input
                                                placeholder="Full Name"
                                                value={formData.name}
                                                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                                                className="bg-transparent border-2 border-white/30 text-white placeholder:text-white/60 rounded-full h-[52px] pl-12 pr-4 text-[15px] hover:border-white/50 focus:border-white/50"
                                            />
                                        </div>
                                        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name[0]}</p>}
                                    </div>

                                    {/* Email & Contact Number */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label className="text-white text-[13px] font-normal">Email *</Label>
                                            <div className="relative">
                                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white z-10 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <Input
                                                    type="email"
                                                    placeholder="Email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                                                    className="bg-transparent border-2 border-white/30 text-white placeholder:text-white/60 rounded-full h-[52px] pl-12 pr-4 text-[15px] hover:border-white/50 focus:border-white/50"
                                                />
                                            </div>
                                            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email[0]}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-white text-[13px] font-normal">Contact Number *</Label>
                                            <PhoneInput
                                                country={"sg"}
                                                value={formData.phone}
                                                onChange={(phone, country) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        phone,
                                                        country_code: `+${(country as any).dialCode}`,
                                                    }))
                                                }
                                                inputClass="!w-full !h-[52px] !text-[15px] !bg-transparent !border-2 !border-white/30 !text-white !rounded-full"
                                                buttonClass="!bg-transparent !border-2 !border-white/30 !rounded-l-full !hover:bg-white/10"
                                                dropdownClass="!bg-[#3a3a3a] !text-white"
                                                containerClass="phone-input-container"
                                            />
                                            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone[0]}</p>}
                                        </div>
                                    </div>

                                    {/* Buttons */}
                                    <div className="pt-6 flex items-center justify-between">
                                        <Button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            variant="outline"
                                            className="bg-transparent border-2 border-white/30 text-white rounded-full h-[48px] px-7 hover:bg-white/10 hover:border-white/50 text-[15px] font-medium"
                                        >
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Back
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={submitting}
                                            className="bg-white text-[#4a4a4a] hover:bg-white/90 rounded-full h-[48px] px-7 font-medium text-[15px] shadow-md"
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    Processing...
                                                </>
                                            ) : (
                                                    <>
                                                        Get Pricing
														<Send className="mt-1 h-5" />
                                                    </>
                                                )}
                                        </Button>
                                    </div>

                                    {/* Terms */}
                                    <p className="text-white/70 text-[11px] leading-relaxed pt-4">
                                        By clicking the above button, you agree to our <span className="font-semibold text-white">Terms of Service</span> and have read and understood our <span className="font-semibold text-white">Privacy Policy</span>.
                                    </p>
                                </>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
