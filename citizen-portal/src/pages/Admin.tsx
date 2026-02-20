import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { 
  Shield, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Activity,
  LogOut,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

// Fix Leaflet marker icons
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const API_URL = "http://127.0.0.1:8000";

const Admin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Check authentication on mount
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('admin_authenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [navigate]);

  // Fetch all reports
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['adminReports'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/reports/all`);
      if (!response.ok) throw new Error('Failed to fetch reports');
      return response.json();
    },
  });

  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ reportId, newStatus }: { reportId: string; newStatus: string }) => {
      console.log(`🔄 Updating report ${reportId} to ${newStatus}`);
      const response = await fetch(`${API_URL}/api/reports/${reportId}/status?status=${newStatus}`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
    },
  });

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('adminUsername');
    navigate('/auth');
  };

  const handleStatusChange = (reportId: string, newStatus: string) => {
    updateStatusMutation.mutate({ reportId, newStatus });
  };

  // Calculate statistics
  const totalReports = reports.length;
  const pendingReports = reports.filter(r => r.status?.toLowerCase() === 'pending').length;
  const inProgressReports = reports.filter(r => r.status?.toLowerCase() === 'in_progress' || r.status?.toLowerCase() === 'in progress').length;
  const resolvedReports = reports.filter(r => r.status?.toLowerCase() === 'resolved').length;

  // Category data for pie chart
  const categoryData = reports.reduce((acc: any, report) => {
    const category = report.category || 'Other';
    if (!acc[category]) acc[category] = 0;
    acc[category]++;
    return acc;
  }, {});

  const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  // Resolution speed data (mock)
  const speedData = [
    { timeframe: '< 24h', count: 45 },
    { timeframe: '1-3 days', count: 78 },
    { timeframe: '4-7 days', count: 52 },
    { timeframe: '> 7 days', count: 23 }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#6366f1'];

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-500';
      case 'in progress':
      case 'in_progress': return 'bg-blue-500';
      case 'resolved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">City Command Center</h1>
                <p className="text-xs text-slate-500">SewaSetu Admin Portal</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        
        {/* Top Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Reports</p>
                  <p className="text-3xl font-bold text-slate-900">{totalReports}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-100">
                  <Activity className="w-6 h-6 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-l-4 border-yellow-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{pendingReports}</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-100">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-l-4 border-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">In Progress</p>
                  <p className="text-3xl font-bold text-blue-600">{inProgressReports}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-l-4 border-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Resolved</p>
                  <p className="text-3xl font-bold text-green-600">{resolvedReports}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-100">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Command Center - Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Left - Live Map */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-lg h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  <span>Live Issue Map</span>
                  <Badge variant="secondary" className="ml-2">
                    {reports.filter(r => r.latitude && r.longitude).length} locations
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-80px)]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
                  </div>
                ) : reports.filter(r => r.latitude && r.longitude).length > 0 ? (
                  <MapContainer
                    center={[reports[0].latitude || 28.6139, reports[0].longitude || 77.2090]}
                    zoom={11}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; OpenStreetMap'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {reports.filter(r => r.latitude && r.longitude).map((report) => (
                      <Marker
                        key={report.id}
                        position={[report.latitude, report.longitude]}
                      >
                        <Popup>
                          <div className="p-2 min-w-[200px]">
                            <Badge className={`${getStatusColor(report.status)} text-white mb-2`}>
                              {report.status || 'Pending'}
                            </Badge>
                            <p className="text-sm font-semibold mb-1">{report.category}</p>
                            <p className="text-xs text-slate-600 mb-2">
                              {report.description?.substring(0, 80)}...
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatDate(report.created_at)}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-slate-400">
                      <MapPin className="w-16 h-16 mx-auto mb-2" />
                      <p>No reports with locations</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right - Report Management */}
          <div>
            <Card className="bg-white shadow-lg h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span>Pending Reports</span>
                  <Badge className="bg-yellow-500 text-white ml-2">
                    {pendingReports}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100%-80px)] px-4">
                  {isLoading ? (
                    <div className="py-8 text-center">
                      <div className="animate-spin w-6 h-6 border-4 border-slate-300 border-t-slate-900 rounded-full mx-auto"></div>
                    </div>
                  ) : reports.filter(r => r.status?.toLowerCase() === 'pending').length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">All caught up!</p>
                    </div>
                  ) : (
                    <div className="space-y-3 py-4">
                      {reports
                        .filter(r => r.status?.toLowerCase() === 'pending')
                        .map((report) => (
                          <div
                            key={report.id}
                            className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <Badge variant="outline" className="text-xs">
                                {report.category || 'Other'}
                              </Badge>
                              <span className="text-xs text-slate-500">
                                {formatDate(report.created_at)}
                              </span>
                            </div>
                            
                            <p className="text-sm text-slate-900 font-medium mb-3 line-clamp-2">
                              {report.description}
                            </p>

                            <div className="flex items-center space-x-2">
                              <Select
                                value={report.status}
                                onValueChange={(value) => handleStatusChange(report.id, value)}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue placeholder="Update Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              {report.image_url && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-xs"
                                  onClick={() => window.open(report.image_url, '_blank')}
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  View
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Issues by Category */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Issues by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Resolution Speed */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Resolution Speed</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={speedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="timeframe" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              
              {/* City Health Indicator */}
              <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">City Health Score</span>
                  <span className="text-2xl font-bold text-green-600">
                    {Math.round((resolvedReports / Math.max(totalReports, 1)) * 100)}%
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Based on resolution rate and response time
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
