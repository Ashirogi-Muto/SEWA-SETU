// src/pages/Reports.tsx
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Eye, MapPin, Navigation } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Report, ReportStatus, PaginatedReportsResponse } from "../../types";
import { toast } from "sonner";
import ReportsMap from "@/components/ReportsMap"; // <-- Import the new map component

// TODO: Switch to live API by changing imports below
import { fetchReports, updateReportStatus, fetchDepartments, Department } from "@/lib/api";

const REPORTS_PER_PAGE = 5;

export default function Reports() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  
  // Location filtering state
  const [locationFilterEnabled, setLocationFilterEnabled] = useState(false);
  const [centerLat, setCenterLat] = useState<number>(28.6139); // Default to New Delhi
  const [centerLon, setCenterLon] = useState<number>(77.2090);
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);

  const queryClient = useQueryClient();

  // Fetch departments for filter dropdown
  const { data: departments } = useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
  });

  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lon: longitude });
          setCenterLat(latitude);
          setCenterLon(longitude);
        },
        (error) => {
          console.warn("Could not get user location:", error.message);
          toast.info("Using default location", {
            description: "Could not access your location. Using default center point."
          });
        }
      );
    }
  }, []);

  const { data, isLoading, isError } = useQuery<PaginatedReportsResponse>({
    queryKey: [
      "reports", 
      statusFilter, 
      categoryFilter, 
      departmentFilter,
      page,
      locationFilterEnabled ? centerLat : undefined,
      locationFilterEnabled ? centerLon : undefined,
      locationFilterEnabled ? radiusKm : undefined
    ],
    queryFn: () => fetchReports(
      statusFilter, 
      categoryFilter, 
      page, 
      REPORTS_PER_PAGE,
      locationFilterEnabled ? centerLat : undefined,
      locationFilterEnabled ? centerLon : undefined,
      locationFilterEnabled ? radiusKm : undefined,
      departmentFilter !== "all" ? parseInt(departmentFilter) : undefined
    ),
  });

  const mutation = useMutation({
    mutationFn: updateReportStatus,
    onSuccess: (updatedReport) => {
      toast.success(`Report ${updatedReport.id} updated`, { description: `Status changed to ${updatedReport.status}.` });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      setSelectedReport(null);
    },
  });

  const totalPages = data ? Math.ceil(data.totalCount / REPORTS_PER_PAGE) : 1;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  const statusToVariant = (status: ReportStatus) => ({ "Pending": "pending", "In Progress": "progress", "Resolved": "resolved" })[status] as "pending" | "progress" | "resolved";

  const useMyLocation = () => {
    if (userLocation) {
      setCenterLat(userLocation.lat);
      setCenterLon(userLocation.lon);
      toast.success("Location updated", {
        description: "Using your current location as filter center"
      });
    } else {
      toast.error("Location unavailable", {
        description: "Could not access your current location"
      });
    }
  };

  const resetFilters = () => {
    setStatusFilter("all");
    setCategoryFilter("all");
    setDepartmentFilter("all");
    setLocationFilterEnabled(false);
    setPage(1);
  };

  return (
    <DashboardLayout title="Reports Management">
      <div className="space-y-6">
        {/* Map Display */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Report Locations</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[400px] w-full rounded-md" />
            ) : (
              <ReportsMap reports={data?.reports} />
            )}
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold">Filter Reports</CardTitle>
              <Button variant="outline" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={v => { setCategoryFilter(v); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="Safety">Safety</SelectItem>
                  <SelectItem value="Public Service">Public Service</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={departmentFilter} onValueChange={v => { setDepartmentFilter(v); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments?.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Location Filter */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="location-filter"
                  checked={locationFilterEnabled}
                  onChange={(e) => setLocationFilterEnabled(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="location-filter" className="font-medium">
                  Enable Location Filtering
                </Label>
              </div>
              
              {locationFilterEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="center-lat">Center Latitude</Label>
                    <Input
                      id="center-lat"
                      type="number"
                      step="any"
                      value={centerLat}
                      onChange={(e) => setCenterLat(parseFloat(e.target.value) || 0)}
                      placeholder="28.6139"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="center-lon">Center Longitude</Label>
                    <Input
                      id="center-lon"
                      type="number"
                      step="any"
                      value={centerLon}
                      onChange={(e) => setCenterLon(parseFloat(e.target.value) || 0)}
                      placeholder="77.2090"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="radius">Radius (km)</Label>
                    <Input
                      id="radius"
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={radiusKm}
                      onChange={(e) => setRadiusKm(parseFloat(e.target.value) || 10)}
                      placeholder="10"
                    />
                  </div>
                  
                  <div className="md:col-span-3 flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={useMyLocation}
                      disabled={!userLocation}
                      className="flex items-center gap-2"
                    >
                      <Navigation className="h-4 w-4" />
                      Use My Location
                    </Button>
                    
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Showing reports within {radiusKm}km of center point
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card>
          <CardHeader><CardTitle className="text-lg font-semibold">Citizen Reports ({data?.totalCount ?? 0})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: REPORTS_PER_PAGE }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-destructive">Failed to load reports.</TableCell></TableRow>
                ) : (
                  data?.reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.id}</TableCell>
                      <TableCell>{report.category}</TableCell>
                      <TableCell><Badge variant={statusToVariant(report.status)}>{report.status}</Badge></TableCell>
                      <TableCell>{formatDate(report.submittedDate)}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => setSelectedReport(report)}><Eye size={16} className="mr-2" /> View Details</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1 || isLoading} />
            </PaginationItem>
            <PaginationItem className="font-medium text-sm">
              Page {page} of {totalPages}
            </PaginationItem>
            <PaginationItem>
              <PaginationNext onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages || isLoading} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Report Details Drawer */}
      <Drawer open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DrawerContent>
          {selectedReport && (
            <div className="mx-auto w-full max-w-2xl">
              <DrawerHeader>
                <DrawerTitle>{selectedReport.id}: {selectedReport.category}</DrawerTitle>
                <DrawerDescription>{selectedReport.description}</DrawerDescription>
              </DrawerHeader>
              <div className="p-4 space-y-4">
                <div className="font-medium">Update Status</div>
                <div className="flex gap-2">
                  {(["Pending", "In Progress", "Resolved"] as ReportStatus[]).map(status => (
                    <Button key={status} variant={selectedReport.status === status ? "default" : "outline"} onClick={() => mutation.mutate({ id: selectedReport.id, status })} disabled={mutation.isPending || selectedReport.status === status}>
                      {mutation.isPending && mutation.variables?.status === status ? "Updating..." : status}
                    </Button>
                  ))}
                </div>
              </div>
              <DrawerFooter><DrawerClose asChild><Button variant="outline">Close</Button></DrawerClose></DrawerFooter>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </DashboardLayout>
  );
}