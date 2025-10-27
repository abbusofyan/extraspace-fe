import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Download, Mail, ChevronUp, ChevronDown, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/api/api";
import { useToast } from "@/hooks/use-toast";
import { useCan } from "@/utils/permissions";

// Types for API responses
interface Facility {
    id: string;
    name: string;
    countryId?: string;
}

interface UnitType {
    id: string;
    name: string;
}

interface UnitSize {
    id: string;
    name: string;
}

interface Status {
    id: string;
    name: string;
    value: string;
}

interface QuoteRequest {
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
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedResponse {
    current_page: number;
    data: QuoteRequest[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

type SortDirection = 'asc' | 'desc';
type SortField = 'formId' | 'name' | 'facility' | 'unitType' | 'unitSize' | 'submittedAt' | 'status';

export function FormEntriesPage() {
	const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFacility, setSelectedFacility] = useState("all");
    const [selectedUnitType, setSelectedUnitType] = useState("all");
    const [selectedUnitSize, setSelectedUnitSize] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [dateValidationError, setDateValidationError] = useState("");
    const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState(false);
    const [showRetriggerDialog, setShowRetriggerDialog] = useState(false);
    const [retriggerTargets, setRetriggerTargets] = useState({
        sugarcrm: false,
        customer: false,
        facilityTeam: false
    });

    // DataTable states
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [sortField, setSortField] = useState<SortField>('submittedAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    // API data states
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
    const [unitSizes, setUnitSizes] = useState<UnitSize[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [paginatedData, setPaginatedData] = useState<PaginatedResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

	const [retriggerLoading, setRetriggerLoading] = useState(false);

    // Initialize date range to current month
    useEffect(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

		setStartDate('')
		setEndDate('')
    }, []);

    // Date validation function
    const validateDateRange = (start: string, end: string): string => {
        if (!start || !end) {
            return ""; // No validation error if either date is empty
        }

        const startDateObj = new Date(start);
        const endDateObj = new Date(end);

        if (endDateObj < startDateObj) {
            return "End date cannot be earlier than start date";
        }

        return ""; // No validation error
    };

    // Enhanced start date handler with validation
    const handleStartDateChange = (value: string) => {
        setStartDate(value);
        const validationError = validateDateRange(value, endDate);
        setDateValidationError(validationError);
    };

    // Enhanced end date handler with validation
    const handleEndDateChange = (value: string) => {
        const validationError = validateDateRange(startDate, value);

        if (validationError) {
            setDateValidationError(validationError);
            // Optionally, you can prevent setting the invalid end date
            // return;
        } else {
            setDateValidationError("");
        }

        setEndDate(value);
    };

    // Alternative approach: Set minimum date for end date input
    const getMinEndDate = (): string => {
        return startDate || "";
    };

    // Fetch dropdown options
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [facilitiesRes, unitTypesRes, unitSizesRes, statusesRes] = await Promise.all([
                    api.get('/facilities'),
                    api.get('/unit-types'),
                    api.get('/sizes'),
                    api.get('/quote-requests/get-all-status')
                ]);

                setFacilities(facilitiesRes.data.data);
                setUnitTypes(unitTypesRes.data.data);
                setUnitSizes(unitSizesRes.data.data);
                setStatuses(statusesRes.data.data);
            } catch (err) {
                setError('Failed to load dropdown options');
                console.error('Error fetching dropdown data:', err);
            }
        };

        fetchDropdownData();
    }, []);

    // Fetch quote requests data with pagination and sorting
    useEffect(() => {
        // Don't fetch data if there's a date validation error
        if (dateValidationError) {
            return;
        }

        const fetchQuoteRequests = async () => {
            setLoading(true);
            try {
                const params: any = {
                    start_date: startDate,
                    end_date: endDate,
                    page: currentPage,
                    per_page: perPage,
                    sort_field: sortField,
                    sort_direction: sortDirection,
                };

                // Add filters if they are not "all"
                if (searchTerm) params.search = searchTerm;
                if (selectedFacility !== "all") params.facility = selectedFacility;
                if (selectedUnitType !== "all") params.unit_type = selectedUnitType;
                if (selectedUnitSize !== "all") params.unit_size = selectedUnitSize;
                if (selectedStatus !== "all") params.status = selectedStatus;

                const response = await api.get('/quote-requests', { params });
                setPaginatedData(response.data.data);
            } catch (err) {
                setError('Failed to load quote requests');
                console.error('Error fetching quote requests:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchQuoteRequests();
    }, [startDate, endDate, currentPage, perPage, sortField, sortDirection, searchTerm, selectedFacility, selectedUnitType, selectedUnitSize, selectedStatus, dateValidationError]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedFacility, selectedUnitType, selectedUnitSize, selectedStatus, startDate, endDate]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'quoted': return 'default';
            case 'processing': return 'secondary';
            case 'no-quotation': return 'destructive';
            default: return 'outline';
        }
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

    const handleExportCSV = async () => {
        // Prevent export if there's a date validation error
        if (dateValidationError) {
            return;
        }

        try {
            // Export all data, not just current page
            const response = await api.get('/quote-requests/export', {
                params: {
                    start_date: startDate,
                    end_date: endDate,
                    search: searchTerm || undefined,
                    facility: selectedFacility !== "all" ? selectedFacility : undefined,
                    unit_type: selectedUnitType !== "all" ? selectedUnitType : undefined,
                    unit_size: selectedUnitSize !== "all" ? selectedUnitSize : undefined,
                    status: selectedStatus !== "all" ? selectedStatus : undefined,
                }
            });

            const csvContent = "data:text/csv;charset=utf-8,"
                + "Facility,Unit Type,Unit Size,Duration,Name,Email,Contact,Promo Codes,Form ID,Date Submitted,Status,Quoted Amount\n"
                + response.data.map((entry: QuoteRequest) =>
                    `${entry.facility},${entry.unitType},${entry.unitSize},${entry.duration},${entry.name},${entry.email},${entry.contact},"${entry.promoCodes.join(';')}",${entry.formId},${entry.submittedAt},${entry.status},${entry.quotedAmount || ''}`
                ).join("\n");

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "form_entries.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error('Error exporting CSV:', err);
        }
    };

    const handleSelectEntry = (entryId: string, checked: boolean) => {
        if (checked) {
            setSelectedEntries(prev => [...prev, entryId]);
        } else {
            setSelectedEntries(prev => prev.filter(id => id !== entryId));
            setSelectAll(false);
        }
    };

	const handleSelectAll = (checked: boolean) => {
		setSelectAll(checked);
		if (checked && paginatedData) {
			const quotedEntries = paginatedData.data
				.filter(entry => entry.status_text === 'Quoted')
				.map(entry => entry.id);
			setSelectedEntries(quotedEntries);
		} else {
			setSelectedEntries([]);
		}
	};


    const handleRetriggerEmail = () => {
        setShowRetriggerDialog(true);
    };

	const handleConfirmRetrigger = async () => {
	    const selectedTargets = Object.keys(retriggerTargets).filter(key => retriggerTargets[key]);
	    setRetriggerLoading(true);

	    try {
	        const res = await api.post('/quote-requests/retrigger-email', {
	            entryIds: selectedEntries,
	            targets: selectedTargets
	        });

	        if (res.data.success) {
	            toast({
	                title: 'Success',
	                description: res.data.message,
	                variant: 'success'
	            });
	        } else {
	            toast({
	                title: 'Error',
	                description: res.data.message || 'Failed to retrigger email',
	                variant: 'destructive'
	            });
	        }
	    } catch (err) {
	        toast({
	            title: 'Error',
	            description: 'Failed to retrigger email',
	            variant: 'destructive'
	        });
	    } finally {
	        setRetriggerLoading(false);
	        setSelectedEntries([]);
	        setSelectAll(false);
	        setShowRetriggerDialog(false);
	        setRetriggerTargets({
	            sugarcrm: false,
	            customer: false,
	            facilityTeam: false
	        });
	    }
	};


    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const renderPaginationButton = (link: PaginationLink, index: number) => {
        const isNumeric = !isNaN(Number(link.label));
        const isNavigation = link.label.includes('Previous') || link.label.includes('Next');

        if (isNavigation) {
            return (
                <Button
                    key={index}
                    variant={link.active ? "default" : "outline"}
                    size="sm"
                    disabled={!link.url}
                    onClick={() => {
                        if (link.url) {
                            const url = new URL(link.url);
                            const page = url.searchParams.get('page');
                            if (page) handlePageChange(parseInt(page));
                        }
                    }}
                    className="h-8 w-8 p-0"
                >
                    {link.label.includes('Previous') ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
            );
        }

        if (isNumeric) {
            return (
                <Button
                    key={index}
                    variant={link.active ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(parseInt(link.label))}
                    className="h-8 w-8 p-0"
                >
                    {link.label}
                </Button>
            );
        }

        return null;
    };

    if (error) {
        return (
            <AdminLayout>
                <div className="p-6">
                    <div className="text-center text-red-600">
                        <p>Error: {error}</p>
                        <Button onClick={() => window.location.reload()} className="mt-4">
                            Retry
        				</Button>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Form Entries</h1>
                    <div className="flex gap-2">
                        {useCan('retrigger email-form-entry') && (
							<Button
	                            onClick={handleRetriggerEmail}
	                            disabled={selectedEntries.length === 0}
	                            variant={selectedEntries.length > 0 ? "default" : "secondary"}
	                        >
	                            <Mail className="mr-2 h-4 w-4" />
	                            Retrigger Email ({selectedEntries.length})
	            			</Button>
						)}
                        {useCan('export-form-entry') && (
							<Button
	                            onClick={handleExportCSV}
	                            disabled={loading || !!dateValidationError}
	                        >
	                            <Download className="mr-2 h-4 w-4" />
	                            Export CSV
	            			</Button>
						)}
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Top row: search + date */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Search */}
                            <div className="md:col-span-1">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name, email, or phone..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                            </div>

                            {/* Date filters with validation */}
                            <div className="flex flex-col gap-2 md:col-span-2">
                                <div className="flex gap-2">
                                    <Input
                                        type="date"
                                        placeholder="Start Date"
                                        value={startDate}
                                        onChange={(e) => handleStartDateChange(e.target.value)}
                                        className={`w-full md:w-40 ${dateValidationError ? 'border-red-500 focus:border-red-500' : ''}`}
                                    />
                                    <Input
                                        type="date"
                                        placeholder="End Date"
                                        value={endDate}
                                        onChange={(e) => handleEndDateChange(e.target.value)}
                                        min={getMinEndDate()}
                                        className={`w-full md:w-40 ${dateValidationError ? 'border-red-500 focus:border-red-500' : ''}`}
                                    />
                                </div>
                                {/* Date validation error message */}
                                {dateValidationError && (
                                    <div className="flex items-center gap-2 text-red-600 text-sm">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span>{dateValidationError}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bottom row: select filters */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Facility */}
                            <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by Facility" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Facilities</SelectItem>
                                    {facilities.map((facility) => (
                                        <SelectItem key={facility.id} value={facility.id}>
                                            {facility.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Unit Type */}
                            <Select value={selectedUnitType} onValueChange={setSelectedUnitType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by Unit Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Unit Types</SelectItem>
                                    {unitTypes.map((unitType) => (
                                        <SelectItem key={unitType.id} value={unitType.id}>
                                            {unitType.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Unit Size */}
                            <Select value={selectedUnitSize} onValueChange={setSelectedUnitSize}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by Unit Size" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Unit Sizes</SelectItem>
                                    {unitSizes.map((unitSize) => (
                                        <SelectItem key={unitSize.id} value={unitSize.id}>
                                            {unitSize.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Status */}
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    {statuses.map((status) => (
                                        <SelectItem key={status.id} value={status.id}>
                                            {status.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Quote Requests</CardTitle>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Show</span>
                            <Select value={perPage.toString()} onValueChange={(value) => setPerPage(parseInt(value))}>
                                <SelectTrigger className="w-20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center items-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin" />
                                <span className="ml-2">Loading quote requests...</span>
                            </div>
                        ) : dateValidationError ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="text-center text-muted-foreground">
                                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                                    <p>Please fix the date range error to view results</p>
                                </div>
                            </div>
                        ) : (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-12">
                                                    <Checkbox
                                                        checked={selectAll}
                                                        onCheckedChange={handleSelectAll}
                                                    />
                                                </TableHead>
                                                <TableHead className="cursor-pointer" onClick={() => handleSort('formId')}>
                                                    <div className="flex items-center gap-1">
                                                        Form ID
                          								{getSortIcon('formId')}
                                                    </div>
                                                </TableHead>
                                                <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                                                    <div className="flex items-center gap-1">
                                                        Name
                          								{getSortIcon('name')}
                                                    </div>
                                                </TableHead>
                                                <TableHead className="cursor-pointer" onClick={() => handleSort('facility')}>
                                                    <div className="flex items-center gap-1">
                                                        Facility
                          								{getSortIcon('facility')}
                                                    </div>
                                                </TableHead>
                                                <TableHead className="cursor-pointer" onClick={() => handleSort('unitType')}>
                                                    <div className="flex items-center gap-1">
                                                        Unit Type
                          								{getSortIcon('unitType')}
                                                    </div>
                                                </TableHead>
                                                <TableHead className="cursor-pointer" onClick={() => handleSort('unitSize')}>
                                                    <div className="flex items-center gap-1">
                                                        Unit Size
                          								{getSortIcon('unitSize')}
                                                    </div>
                                                </TableHead>
                                                <TableHead>Duration</TableHead>
												<TableHead>Move In Date</TableHead>
                                                <TableHead>Promo Codes</TableHead>
                                                <TableHead className="cursor-pointer" onClick={() => handleSort('submittedAt')}>
                                                    <div className="flex items-center gap-1">
                                                        Date Submitted
                      									{getSortIcon('submittedAt')}
                                                    </div>
                                                </TableHead>
                                                <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                                                    <div className="flex items-center gap-1">
                                                        Status
                      									{getSortIcon('status')}
                                                    </div>
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {!paginatedData || paginatedData.data.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                                                        No quote requests found for the selected criteria.
                    								</TableCell>
                                                </TableRow>
                                            ) : (
                                                    paginatedData.data.map((entry) => (
                                                        <TableRow key={entry.id} className="cursor-pointer hover:bg-muted/50" onClick={() => window.location.href = `/form-entries/${entry.id}`}>
                                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                                {entry.status_text == 'Quoted' &&  (
																	<Checkbox
	                                                                    checked={selectedEntries.includes(entry.id)}
	                                                                    onCheckedChange={(checked) => handleSelectEntry(entry.id, checked as boolean)}
	                                                                />
																)}
                                                            </TableCell>
                                                            <TableCell className="font-mono text-sm">{entry.code}</TableCell>
                                                            <TableCell>
                                                                <div>
                                                                    <div className="font-medium">{entry.name}</div>
                                                                    <div className="text-sm text-muted-foreground">{entry.email}</div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>{entry.facility.name}</TableCell>
                                                            <TableCell>{entry.unit_type.name}</TableCell>
                                                            <TableCell>{entry.size.name}</TableCell>
                                                            <TableCell>{entry.duration_month} Month</TableCell>
															<TableCell>{entry.move_in_date}</TableCell>
                                                            <TableCell>
                                                                {entry.promoCodes && entry.promoCodes.length > 0 ? (
                                                                    <div className="flex gap-1 flex-wrap">
                                                                        {entry.promoCodes.map((code, index) => (
                                                                            <Badge key={index} variant="outline" className="text-xs">
                                                                                {code}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                        <span className="text-muted-foreground">-</span>
                                                                    )}
                                                            </TableCell>
                                                            <TableCell className="text-sm">
                                                                {formatDate(entry.created_at)}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant={getStatusBadgeVariant(entry.status_text)}>
                                                                    {entry.status_text.charAt(0).toUpperCase() + entry.status_text.slice(1).replace('-', ' ')}
                                                                </Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                        </TableBody>
                                    </Table>

                                    {/* Pagination */}
                                    {paginatedData && paginatedData.total > 0 && (
                                        <div className="flex items-center justify-between px-2 py-4">
                                            <div className="text-sm text-muted-foreground">
                                                Showing {paginatedData.from || 0} to {paginatedData.to || 0} of {paginatedData.total} entries
                							</div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePageChange(1)}
                                                    disabled={paginatedData.current_page === 1}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <ChevronsLeft className="h-4 w-4" />
                                                </Button>
                                                {paginatedData.links.map((link, index) => renderPaginationButton(link, index))}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePageChange(paginatedData.last_page)}
                                                    disabled={paginatedData.current_page === paginatedData.last_page}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <ChevronsRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                    </CardContent>
                </Card>

                {/* Retrigger Email Dialog */}
                <Dialog open={showRetriggerDialog} onOpenChange={setShowRetriggerDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Select Email to Retrigger</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-base font-medium">Quotation Email:</Label>
                                    <div className="space-y-2 mt-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="quotation-customer"
                                                checked={retriggerTargets.customer}
                                                onCheckedChange={(checked) => setRetriggerTargets(prev => ({ ...prev, customer: !!checked }))}
                                            />
                                            <Label htmlFor="quotation-customer">Customer</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="quotation-facility"
                                                checked={retriggerTargets.facilityTeam}
                                                onCheckedChange={(checked) => setRetriggerTargets(prev => ({ ...prev, facilityTeam: !!checked }))}
                                            />
                                            <Label htmlFor="quotation-facility">Facility Team</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="quotation-sugarcrm"
                                                checked={retriggerTargets.sugarcrm}
                                                onCheckedChange={(checked) => setRetriggerTargets(prev => ({ ...prev, sugarcrm: !!checked }))}
                                            />
                                            <Label htmlFor="quotation-sugarcrm">SugarCRM</Label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
						<DialogFooter>
						    <Button
						        variant="outline"
						        onClick={() => setShowRetriggerDialog(false)}
						        disabled={retriggerLoading}
						    >
						        Cancel
						    </Button>
						    <Button
						        onClick={handleConfirmRetrigger}
						        disabled={!Object.values(retriggerTargets).some(Boolean) || retriggerLoading}
						    >
						        {retriggerLoading ? (
						            <>
						                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
						                Sending...
						            </>
						        ) : (
						            "Retrigger Email"
						        )}
						    </Button>
						</DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
