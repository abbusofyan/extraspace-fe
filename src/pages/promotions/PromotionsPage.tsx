import { useState, useRef, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Download, Upload, CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { promotionTranslations } from "@/data/mockData";
import { exportPromotionsToExcel, downloadExcelTemplate, parseExcelFile } from "@/lib/excelUtils";
import { useToast } from "@/hooks/use-toast";
import api from "@/api/api";
import { useCan } from "@/utils/permissions"

interface Promotion {
    id: string;
    name: string;
    discountType: "monthly recurring discount" | "x free months";
    minStorageDuration: number;
    discountPercentage?: number;
    numberOfMonthsFree?: number;
    redemptionsLeft: number;
    country: string;
    facility: string;
    units: Array<{ unitType: string; size: string }>;
    startDate: string;
    endDate: string;
    status: "active" | "not-active";
    promoCode: string;
    createdAt: string;
}

interface Option {
    id: string | number;
    name: string;
}

export function PromotionsPage() {
    const { toast } = useToast();

    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);

    // ✅ Filter options
    const [countries, setCountries] = useState<Option[]>([]);
    const [facilities, setFacilities] = useState<Option[]>([]);
    const [unitTypes, setUnitTypes] = useState<Option[]>([]);
    const [sizes, setSizes] = useState<Option[]>([]);

    // ✅ Selected filter values
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDiscountType, setFilterDiscountType] = useState("all");
    const [filterCountry, setFilterCountry] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterFacility, setFilterFacility] = useState("all");
    const [filterUnitType, setFilterUnitType] = useState("all");
    const [filterUnitSize, setFilterUnitSize] = useState("all");
    const [filterStartDate, setFilterStartDate] = useState<Date>();
    const [filterEndDate, setFilterEndDate] = useState<Date>();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ✅ Fetch promotions from API
	const fetchPromotions = async () => {
		try {
			setLoading(true);
			const response = await api.get("/promotions");
			setPromotions(response.data.data.data);
		} catch (error) {
			console.error("Failed to fetch promotions:", error);
			toast.error("Failed to load promotions");
		} finally {
			setLoading(false);
		}
	};

    useEffect(() => {
        fetchPromotions();
    }, []);

    // ✅ Fetch filter options from multiple endpoints
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [countriesRes, facilitiesRes, unitTypesRes, sizesRes] = await Promise.all([
                    api.get("/countries"),
                    api.get("/facilities"),
                    api.get("/unit-types"),
                    api.get("/sizes"),
                ]);

                setCountries(countriesRes.data.data || countriesRes.data);
                setFacilities(facilitiesRes.data.data || facilitiesRes.data);
                setUnitTypes(unitTypesRes.data.data || unitTypesRes.data);
                setSizes(sizesRes.data.data || sizesRes.data);
            } catch (error) {
                console.error("Failed to fetch filters:", error);
                toast.error("Failed to load filter options");
            }
        };
        fetchFilters();
    }, []);

    // ✅ Filtering logic
    const filteredPromotions = promotions.filter((promotion) => {
        const matchesSearch = "all";

        const matchesDiscountType =
            filterDiscountType === "all" || promotion.discountType === filterDiscountType;
        const matchesCountry = filterCountry === "all" || promotion.country === filterCountry;
        const matchesStatus = filterStatus === "all" || promotion.status === filterStatus;
        const matchesFacility = filterFacility === "all" || promotion.facility === filterFacility;
        const matchesUnitType =
            filterUnitType === "all" ||
            promotion.units.some((pair) => pair.unitType === filterUnitType);
        const matchesUnitSize =
            filterUnitSize === "all" ||
            promotion.units.some((pair) => pair.size === filterUnitSize);

        const matchesStartDate =
            !filterStartDate || new Date(promotion.startDate) >= filterStartDate;
        const matchesEndDate = !filterEndDate || new Date(promotion.endDate) <= filterEndDate;

        return (
            matchesSearch &&
            matchesDiscountType &&
            matchesCountry &&
            matchesStatus &&
            matchesFacility &&
            matchesUnitType &&
            matchesUnitSize &&
            matchesStartDate &&
            matchesEndDate
        );
    });

    // ✅ Export functions
    const handleExport = () => {
        try {
            exportPromotionsToExcel(filteredPromotions);
            toast({
                title: 'Success',
                description: 'Exported to CSV successfully',
                variant: 'success'
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to export to csv',
                variant: 'destructive'
            })
        }
    };

    const handleDownloadTemplate = () => {
        try {
            downloadExcelTemplate();
            toast({
                title: 'Success',
                description: 'Template has been downloaded',
                variant: 'success'
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to download template',
                variant: 'destructive'
            });
        }
    };

    const handleUpload = () => {
        fileInputRef.current ?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await api.post("/promotions/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

			if (response.data.success) {
				fetchPromotions();
				toast({
					title: 'Success',
					description: 'Promotions uploaded successfully',
					variant: 'success'
				});
			} else {
				toast({
	                title: 'Error',
	                description: response.data.message,
	                variant: 'destructive'
	            });
			}

			if (fileInputRef.current) fileInputRef.current.value = "";

        } catch (error) {
			console.log(error);

			toast({
                title: 'Error',
                description: 'Failed to upload promotions.',
                variant: 'destructive'
            });
        }
    };


    const getStatusBadgeVariant = (status: string) =>
        status.toLowerCase() === "active" ? "dark" : "secondary";

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Promotion Management</h1>
                    <div className="flex gap-2">
                        {(useCan('download-promotion') || useCan('full access-promotion')) && (
                            <Button variant="outline" onClick={handleDownloadTemplate}>
                                <Download className="mr-2 h-4 w-4" /> Download CSV Template
	            			</Button>
                        )}
                        {(useCan('upload-promotion') || useCan('full access-promotion')) && (
                            <Button variant="outline" onClick={handleUpload}>
                                <Upload className="mr-2 h-4 w-4" /> Upload CSV
	            			</Button>
                        )}
                        {(useCan('export-promotion') || useCan('full access-promotion')) && (
                            <Button variant="outline" onClick={handleExport}>
                                <Download className="mr-2 h-4 w-4" /> Export CSV
	            			</Button>
                        )}
						<input
						    ref={fileInputRef}
						    type="file"
						    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, .xlsx, .xls"
						    onChange={handleFileChange}
						    className="hidden"
						/>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>

                            <Select value={filterDiscountType} onValueChange={setFilterDiscountType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Discount Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="monthly recurring discount">
                                        Monthly Recurring Discount
                  </SelectItem>
                                    <SelectItem value="x free months">X Free Months</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={filterCountry} onValueChange={setFilterCountry}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Country" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Countries</SelectItem>
                                    {countries.map((country) => (
                                        <SelectItem key={country.id} value={country.name}>
                                            {country.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="not-active">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <Select value={filterFacility} onValueChange={setFilterFacility}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Facility" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Facilities</SelectItem>
                                    {facilities.map((facility) => (
                                        <SelectItem key={facility.id} value={facility.name}>
                                            {facility.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={filterUnitType} onValueChange={setFilterUnitType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Unit Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Unit Types</SelectItem>
                                    {unitTypes.map((type) => (
                                        <SelectItem key={type.id} value={type.name}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={filterUnitSize} onValueChange={setFilterUnitSize}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Unit Size" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Sizes</SelectItem>
                                    {sizes.map((size) => (
                                        <SelectItem key={size.id} value={size.name}>
                                            {size.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Date pickers */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {filterStartDate ? format(filterStartDate, "MMM dd, yyyy") : "Start Date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={filterStartDate} onSelect={setFilterStartDate} />
                                </PopoverContent>
                            </Popover>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {filterEndDate ? format(filterEndDate, "MMM dd, yyyy") : "End Date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={filterEndDate} onSelect={setFilterEndDate} />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {(searchTerm ||
                            filterDiscountType !== "all" ||
                            filterCountry !== "all" ||
                            filterStatus !== "all" ||
                            filterFacility !== "all" ||
                            filterUnitType !== "all" ||
                            filterUnitSize !== "all" ||
                            filterStartDate ||
                            filterEndDate) && (
                                <div className="flex justify-end">
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            setSearchTerm("");
                                            setFilterDiscountType("all");
                                            setFilterCountry("all");
                                            setFilterStatus("all");
                                            setFilterFacility("all");
                                            setFilterUnitType("all");
                                            setFilterUnitSize("all");
                                            setFilterStartDate(undefined);
                                            setFilterEndDate(undefined);
                                        }}
                                    >
                                        Clear All Filters
                </Button>
                                </div>
                            )}
                    </CardContent>
                </Card>

                {/* Promotions Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Promotions ({filteredPromotions.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Loading promotions...
              				</div>
                        ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Promotion Name</TableHead>
                                            <TableHead>Promotion ID</TableHead>
                                            <TableHead>Discount Type</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Country</TableHead>
                                            <TableHead>Facility</TableHead>
                                            <TableHead>Unit Type-Size Pairs</TableHead>
                                            <TableHead>Start Date</TableHead>
                                            <TableHead>End Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredPromotions.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                                                    No promotions found matching the current filters
                      							</TableCell>
                                            </TableRow>
                                        ) : (
                                                filteredPromotions.map((promotion) => (
                                                    <TableRow key={promotion.id}>
                                                        <TableCell className="font-medium">
                                                            <Link to={`/promotions/${promotion.id}`} className="text-primary hover:underline">
                                                                {promotion.name_en}
                                                            </Link>
                                                        </TableCell>
                                                        <TableCell className="font-mono text-sm">{promotion.identifier}</TableCell>
                                                        <TableCell className="capitalize">{promotion.discount_type}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={getStatusBadgeVariant(promotion.status_text)}>
                                                                {promotion.status_text}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>{promotion.country}</TableCell>
                                                        <TableCell>
                                                            <div className="space-y-1">
                                                                {promotion.facilities.map((facility, index) => (
                                                                    <div key={index} className="text-sm">
                                                                        {facility.name}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="space-y-1">
                                                                {promotion.units.map((pair, index) => (
                                                                    <div key={index} className="text-sm">
                                                                        {pair.unit_type.name} - {pair.size.name}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{formatDate(promotion.start_date)}</TableCell>
                                                        <TableCell>{formatDate(promotion.end_date)}</TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                    </TableBody>
                                </Table>
                            )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
