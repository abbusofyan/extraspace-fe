import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter } from "lucide-react";
import api from "@/api/api";
import { formatDateTime } from "@/utils/dateTimeUtils";

interface ApiLog {
  id: string;
  endpoint: string;
  ip_address: string;
  created_at: string;
  method: string;
}

export function LoggingPage() {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApiType, setSelectedApiType] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchLogs = async (filters = {}) => {
    try {
      setLoading(true);

      const response = await api.get("/api-logs", {
        params: {
          search: searchTerm || undefined,
          method: selectedApiType !== "all" ? selectedApiType : undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          ...filters,
        },
      });

      setLogs(response.data.data.data ?? response.data.data ?? []);
    } catch (error) {
      console.error("Failed to fetch API logs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchLogs();
  }, []);

  // Re-fetch when filters change
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchLogs();
    }, 500); // debounce typing for search

    return () => clearTimeout(timeout);
  }, [searchTerm, selectedApiType, startDate, endDate]);

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">API Logging</h1>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end overflow-x-auto">
              {/* Search */}
              <div className="relative min-w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search API or IP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Method filter */}
              <div className="min-w-40">
                <Select value={selectedApiType} onValueChange={setSelectedApiType}>
                  <SelectTrigger>
                    <SelectValue placeholder="API Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All API Types</SelectItem>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date filters */}
              <div className="min-w-52">
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <Input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="min-w-52">
                <label className="block text-sm font-medium mb-1">End Date</label>
                <Input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>API Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Method</TableHead>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Date & Time (GMT+8)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No API logs found matching your criteria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">{log.method}</TableCell>
                          <TableCell>{log.endpoint}</TableCell>
                          <TableCell>{log.ip_address}</TableCell>
                          <TableCell>{formatDateTime(log.created_at)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
