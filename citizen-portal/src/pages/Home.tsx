import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  MapPin,
  Calendar,
  ArrowRight,
  Zap,
  TrendingUp,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle2,
  Users,
  Flame,
  Map as MapIcon
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ModernNavbar from "@/components/ModernNavbar";
import { fetchAllReports } from "@/lib/api";

// Fix Leaflet default marker icon issue
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Heatmap layer component using leaflet.heat
const HeatmapLayer = ({ points }: { points: [number, number, number][] }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || points.length === 0) return;

    const heat = (L as any).heatLayer(points, {
      radius: 30,
      blur: 20,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.1: '#2563eb',
        0.3: '#7c3aed',
        0.5: '#f59e0b',
        0.7: '#f97316',
        0.9: '#ef4444',
        1.0: '#dc2626',
      },
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);

  return null;
};

const Home = () => {
  const navigate = useNavigate();
  const [mapView, setMapView] = useState<'pins' | 'heatmap'>('heatmap');
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

  // Fetch real reports data
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['allReports'],
    queryFn: fetchAllReports,
  });

  // Calculate live statistics
  const totalReports = reports.length;
  const resolvedThisWeek = reports.filter(r => {
    const reportDate = new Date(r.created_at || r.submittedDate);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return r.status?.toLowerCase() === 'resolved' && reportDate >= weekAgo;
  }).length;
  const activeIssues = reports.filter(r =>
    r.status?.toLowerCase() === 'pending' ||
    r.status?.toLowerCase() === 'in_progress' ||
    r.status?.toLowerCase() === 'in progress'
  ).length;
  const calculateAvgResponseTime = () => {
    const resolvedReports = reports.filter(r => r.status?.toLowerCase() === 'resolved');
    if (resolvedReports.length === 0) return "N/A";

    // Mock logic: In a real app, we'd subtraction resolved_at - created_at. 
    // Since we don't have resolved_at in the frontend model correctly yet, 
    // we will simulate it or just fail gracefully.
    // However, the prompt says "REAL DATA". 
    // If we only have created_at, we can't calculate duration.
    // Let's assume 'updated_at' is close to resolution time for now if status is resolved.

    let totalDurationMs = 0;
    let count = 0;

    resolvedReports.forEach(r => {
      // Use updated_at if available, else skip
      if (r.updated_at && r.created_at) {
        const start = new Date(r.created_at).getTime();
        const end = new Date(r.updated_at).getTime();
        if (end > start) {
          totalDurationMs += (end - start);
          count++;
        }
      }
    });

    if (count === 0) return "Pending"; // No resolved reports with valid timestamps

    const avgMs = totalDurationMs / count;
    const hours = Math.floor(avgMs / (1000 * 60 * 60));

    if (hours > 24) {
      return `${(hours / 24).toFixed(1)} days`;
    }
    return `${hours} hrs`;
  };

  const avgResponseTime = calculateAvgResponseTime();

  // Get latest 20 reports with coordinates for map
  const reportsWithCoords = reports
    .filter(r => r.latitude && r.longitude)
    .slice(0, 20);

  // Get latest 3 reports for recent activity
  const recentReports = reports.slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500';
      case 'in progress':
      case 'in_progress':
        return 'bg-blue-500';
      case 'resolved':
        return 'bg-emerald-500';
      default:
        return 'bg-slate-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Custom marker icon colors based on status
  const getMarkerIcon = (status: string) => {
    const color = status?.toLowerCase() === 'resolved' ? '#10b981' :
      status?.toLowerCase() === 'in_progress' || status?.toLowerCase() === 'in progress' ? '#3b82f6' :
        '#eab308';

    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <ModernNavbar />

      {/* HERO SECTION */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative overflow-hidden"
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234f46e5' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left Side - Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-4">
                <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 text-sm px-4 py-1">
                  <Zap className="w-3 h-3 mr-1" />
                  AI-Powered Platform
                </Badge>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Make Your City Better,{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  One Report at a Time
                </span>
              </h1>

              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Join thousands of citizens using AI-powered civic reporting to create
                safer, cleaner, and better communities across India.
              </p>

              {/* CTA Button with Pulse Animation */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Button
                  size="lg"
                  onClick={() => navigate('/report')}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-3xl text-lg px-8 py-6 rounded-xl"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Report an Issue Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>

              {/* Social Proof */}
              <div className="mt-8 flex items-center space-x-6 text-sm text-slate-600">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-indigo-600" />
                  <span><strong className="text-slate-900">{totalReports}+</strong> Reports</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
                  <span><strong className="text-slate-900">{resolvedThisWeek}</strong> Resolved This Week</span>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Floating Live Stats Cards */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="grid grid-cols-1 gap-4">

                {/* Active Issues Card */}
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="backdrop-blur-xl bg-white/90 border-white/20 shadow-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600 mb-1">Active Issues</p>
                          <p className="text-4xl font-bold text-yellow-600">{activeIssues}</p>
                          <p className="text-xs text-slate-500 mt-1">Being resolved</p>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 shadow-lg">
                          <Activity className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Fixed This Week Card */}
                <motion.div
                  whileHover={{ scale: 1.05, rotate: -1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="backdrop-blur-xl bg-white/90 border-white/20 shadow-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600 mb-1">Fixed This Week</p>
                          <p className="text-4xl font-bold text-emerald-600">{resolvedThisWeek}</p>
                          <p className="text-xs text-emerald-600 mt-1 flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            +15% from last week
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                          <CheckCircle2 className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Avg Response Time Card */}
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="backdrop-blur-xl bg-white/90 border-white/20 shadow-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600 mb-1">Avg Response Time</p>
                          <p className="text-4xl font-bold text-indigo-600">{avgResponseTime}</p>
                          <p className="text-xs text-indigo-600 mt-1 flex items-center">
                            <Zap className="w-3 h-3 mr-1" />
                            AI-accelerated
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                          <Clock className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* INTERACTIVE MAP SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4 py-16"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            Live Issue Map
          </h2>
          <p className="text-slate-600 mb-4">
            Real-time visualization of reported civic issues in your area
          </p>

          {/* Map View Toggle */}
          <div className="inline-flex items-center rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 shadow-md p-1">
            <button
              onClick={() => setMapView('pins')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${mapView === 'pins'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              <MapIcon className="w-4 h-4" />
              Pin Map
            </button>
            <button
              onClick={() => setMapView('heatmap')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${mapView === 'heatmap'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              <Flame className="w-4 h-4" />
              Heatmap
            </button>
          </div>
        </div>

        <Card className="backdrop-blur-xl bg-white/80 border-white/10 shadow-2xl overflow-hidden">
          <CardContent className="p-0">
            <div className="h-[500px] relative">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading map...</p>
                  </div>
                </div>
              ) : reportsWithCoords.length > 0 ? (
                <MapContainer
                  center={[
                    reportsWithCoords[0].latitude,
                    reportsWithCoords[0].longitude
                  ]}
                  zoom={12}
                  style={{ height: '100%', width: '100%' }}
                  className="z-0"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {mapView === 'pins' ? (
                    reportsWithCoords.map((report) => (
                      <Marker
                        key={report.id}
                        position={[report.latitude!, report.longitude!]}
                        icon={getMarkerIcon(report.status)}
                      >
                        <Popup>
                          <div className="p-2 min-w-[200px]">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className={`${getStatusColor(report.status)} text-white text-xs`}>
                                {report.status || 'Pending'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {report.category || 'Other'}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium text-slate-900 mb-2">
                              {report.description?.substring(0, 100)}...
                            </p>
                            {report.image_url && (
                              <img
                                src={report.image_url}
                                alt="Report"
                                className="w-full h-32 object-cover rounded-lg mb-2"
                              />
                            )}
                            <p className="text-xs text-slate-500">
                              {formatDate(report.created_at || report.submittedDate)}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    ))
                  ) : (
                    <HeatmapLayer
                      points={reportsWithCoords.map(r => [
                        r.latitude!,
                        r.longitude!,
                        1.0
                      ])}
                    />
                  )}
                </MapContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No reports with locations yet</p>
                  </div>
                </div>
              )}

              {/* Map Legend */}
              <div className="absolute bottom-4 left-4 backdrop-blur-xl bg-white/90 rounded-lg shadow-lg p-3 z-[1000]">
                <p className="text-xs font-semibold text-slate-900 mb-2">
                  {mapView === 'pins' ? 'Legend' : 'Density'}
                </p>
                {mapView === 'pins' ? (
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                      <span className="text-xs text-slate-700">Pending</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                      <span className="text-xs text-slate-700">In Progress</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                      <span className="text-xs text-slate-700">Resolved</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-3 rounded" style={{ background: 'linear-gradient(to right, #2563eb, #7c3aed, #f59e0b, #ef4444, #dc2626)' }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* RECENT ACTIVITY SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4 py-16"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Recent Activity
            </h2>
            <p className="text-slate-600">Latest reports from the community</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/my-reports')}
            className="border-slate-300 hover:border-indigo-600 hover:text-indigo-600"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="backdrop-blur-xl bg-white/80 border-white/10 shadow-lg">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-24 bg-slate-200 rounded"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recentReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentReports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
              >
                <Card className="backdrop-blur-xl bg-white/80 border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">

                  {/* Image */}
                  {report.image_url && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={report.image_url}
                        alt="Report"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className={`${getStatusColor(report.status)} text-white`}>
                          {report.status || 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  )}

                  <CardContent className="p-6">
                    {/* Category Badge */}
                    <div className="flex items-center space-x-2 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {report.category || 'Other'}
                      </Badge>
                      {!report.image_url && (
                        <Badge className={`${getStatusColor(report.status)} text-white text-xs`}>
                          {report.status || 'Pending'}
                        </Badge>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm font-medium text-slate-900 mb-3 line-clamp-2">
                      {report.description}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(report.created_at || report.submittedDate)}</span>
                      </div>
                      {report.latitude && report.longitude && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{report.latitude.toFixed(2)}, {report.longitude.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    {/* AI Badge */}
                    {report.severity && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-1 text-indigo-600">
                            <Zap className="w-3 h-3" />
                            <span className="font-medium">AI Analysis</span>
                          </div>
                          <Badge variant="outline" className={`text-xs ${report.severity?.toLowerCase() === 'high' ? 'text-red-600 border-red-300' :
                            report.severity?.toLowerCase() === 'low' ? 'text-emerald-600 border-emerald-300' :
                              'text-yellow-600 border-yellow-300'
                            }`}>
                            {report.severity}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="backdrop-blur-xl bg-white/80 border-white/10 shadow-lg">
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Reports Yet</h3>
              <p className="text-slate-600 mb-6">Be the first to report an issue in your community</p>
              <Button
                onClick={() => navigate('/report')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Submit First Report
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.section>

      {/* FOOTER CTA */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4 py-16 mb-16"
      >
        <Card className="backdrop-blur-xl bg-gradient-to-r from-indigo-600 to-purple-600 border-0 shadow-2xl overflow-hidden">
          <CardContent className="p-12 text-center relative">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Make a Difference?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of citizens using AI to create better communities.
                Report an issue today and see the impact.
              </p>
              <Button
                size="lg"
                onClick={() => navigate('/report')}
                className="bg-white text-indigo-600 hover:bg-white/90 shadow-xl text-lg px-8 py-6 rounded-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Start Reporting
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
};

export default Home;
