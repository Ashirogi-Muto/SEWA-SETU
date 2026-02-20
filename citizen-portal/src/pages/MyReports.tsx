import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Clock,
  Target,
  TrendingUp,
  Zap,
  Plus,
  ChevronRight,
  Activity
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { fetchReports } from "@/lib/api";
import ModernNavbar from "@/components/ModernNavbar";
import StatsOverview from "@/components/StatsOverview";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import LocationPicker from "@/components/LocationPicker";

const MyReports = () => {
  console.log('🚀 Rendering MyReports component');

  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const token = localStorage.getItem('authToken');

  const { data: reports = [], isLoading, isError } = useQuery({
    queryKey: ['userReports'],
    queryFn: fetchReports,
    enabled: !!token,
  });

  if (!token) {
    navigate('/auth');
    return null;
  }

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

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-emerald-600';
      default:
        return 'text-slate-600';
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeline = (report: any) => {
    const createdDate = new Date(report.created_at || report.submittedDate);
    return [
      {
        title: 'Report Submitted',
        description: 'Citizen reported the issue',
        date: formatDate(report.created_at || report.submittedDate),
        status: 'completed',
        icon: CheckCircle2
      },
      {
        title: 'AI Analysis Complete',
        description: `Classified as ${report.category || 'Other'}`,
        date: formatDate(new Date(createdDate.getTime() + 60000).toISOString()),
        status: 'completed',
        icon: Zap
      },
      {
        title: 'Sent to Department',
        description: 'Assigned to relevant team',
        date: formatDate(new Date(createdDate.getTime() + 3600000).toISOString()),
        status: report.status?.toLowerCase() === 'pending' ? 'current' : 'completed',
        icon: Activity
      },
      {
        title: 'Resolution',
        description: report.status?.toLowerCase() === 'resolved' ? 'Issue resolved' : 'In progress',
        date: report.status?.toLowerCase() === 'resolved' ? formatDate(new Date().toISOString()) : 'Pending',
        status: report.status?.toLowerCase() === 'resolved' ? 'completed' : 'pending',
        icon: Target
      }
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <ModernNavbar />

      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">
              Civic Command Center
            </h1>
            <p className="text-slate-600">
              Monitor and manage your civic issue reports
            </p>
          </div>
          <Button
            onClick={() => navigate('/report')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Report
          </Button>
        </div>

        {/* Stats Overview */}
        {!isLoading && reports.length > 0 && <StatsOverview reports={reports} />}

        {/* Split View Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT PANEL - Report List (40%) */}
          <div className="lg:col-span-5">
            <Card className="backdrop-blur-xl bg-white/80 border-white/10 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900">
                    All Reports ({reports.length})
                  </h2>
                  <Badge variant="secondary" className="text-xs">
                    {reports.filter(r => r.status?.toLowerCase() === 'pending').length} pending
                  </Badge>
                </div>

                {isLoading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  </div>
                )}

                {isError && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
                    <p className="text-sm text-slate-600">Failed to load reports</p>
                  </div>
                )}

                {!isLoading && !isError && reports.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                      <AlertCircle className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-600 mb-4">No reports yet</p>
                    <Button
                      onClick={() => navigate('/report')}
                      size="sm"
                      className="bg-gradient-to-r from-indigo-600 to-purple-600"
                    >
                      Submit First Report
                    </Button>
                  </div>
                )}

                {!isLoading && !isError && reports.length > 0 && (
                  <ScrollArea className="h-[calc(100vh-400px)]">
                    <div className="space-y-3 pr-4">
                      {reports.map((report) => (
                        <motion.div
                          key={report.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => setSelectedReport(report)}
                          className={`cursor-pointer rounded-xl border-2 transition-all duration-300 ${selectedReport?.id === report.id
                            ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg'
                            : 'border-transparent bg-white/50 hover:bg-white/80 hover:shadow-md'
                            }`}
                        >
                          <div className="p-4">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                              <Badge className={`${getStatusColor(report.status)} text-white text-xs`}>
                                {report.status || 'Pending'}
                              </Badge>
                              <span className="text-xs text-slate-500">
                                {formatDate(report.created_at || report.submittedDate)}
                              </span>
                            </div>

                            {/* Description */}
                            <p className="text-sm font-semibold text-slate-900 mb-2 line-clamp-2">
                              {report.description}
                            </p>

                            {/* Meta Info */}
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-1 text-slate-600">
                                <MapPin className="w-3 h-3" />
                                <span>{report.latitude?.toFixed(4)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Badge variant="outline" className="text-xs">
                                  {report.category || 'Other'}
                                </Badge>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT PANEL - Detail Inspector (60%) */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {selectedReport ? (
                <motion.div
                  key={selectedReport.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Report Header Card */}
                  <Card className="backdrop-blur-xl bg-white/80 border-white/10 shadow-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={`${getStatusColor(selectedReport.status)} text-white`}>
                              {selectedReport.status || 'Pending'}
                            </Badge>
                            <Badge variant="outline">
                              {selectedReport.category || 'Other'}
                            </Badge>
                          </div>
                          <h2 className="text-xl font-bold text-slate-900 mb-2">
                            {selectedReport.description}
                          </h2>
                          <div className="flex items-center space-x-4 text-sm text-slate-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(selectedReport.created_at || selectedReport.submittedDate)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>
                                {selectedReport.latitude?.toFixed(4)}, {selectedReport.longitude?.toFixed(4)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* AI Analysis Section */}
                      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Zap className="w-5 h-5 text-indigo-600" />
                            <span className="font-semibold text-slate-900">AI Analysis</span>
                          </div>
                          <div className="text-right">
                            {(() => {
                              const confidenceScore = selectedReport.ai_analysis?.confidence || selectedReport.confidence || 88;
                              const scoreColor = confidenceScore > 75 ? "text-green-600" : confidenceScore > 50 ? "text-yellow-600" : "text-red-500";
                              return (
                                <>
                                  <div className={`text-2xl font-bold ${scoreColor}`}>
                                    {confidenceScore}%
                                  </div>
                                  <div className="text-xs text-slate-600">Confidence</div>
                                </>
                              );
                            })()}
                          </div>
                        </div>

                        <div className="space-y-3">
                          {/* Severity */}
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-slate-700 font-medium">Severity</span>
                              <span className={`font-bold ${getSeverityColor(selectedReport.ai_analysis?.severity || selectedReport.severity || 'Medium')}`}>
                                {selectedReport.ai_analysis?.severity || selectedReport.severity || 'Medium'}
                              </span>
                            </div>
                            <Progress
                              value={(() => {
                                const sev = (selectedReport.ai_analysis?.severity || selectedReport.severity || 'Medium').toLowerCase();
                                if (sev === 'critical') return 95;
                                if (sev === 'high') return 85;
                                if (sev === 'low') return 30;
                                return 60;
                              })()}
                              className="h-2"
                            />
                          </div>

                          {/* Impact */}
                          {(selectedReport.ai_analysis?.impact || selectedReport.impact) && (
                            <div className="text-sm">
                              <span className="font-medium text-slate-700">Impact:</span>
                              <p className="text-slate-600 mt-1">
                                {selectedReport.ai_analysis?.impact || selectedReport.impact}
                              </p>
                            </div>
                          )}

                          {/* Estimated Repair Time */}
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-700 font-medium">Est. Repair Time</span>
                            <div className="flex items-center space-x-1 text-indigo-600 font-semibold">
                              <Clock className="w-4 h-4" />
                              <span>
                                {selectedReport.ai_analysis?.estimated_repair_time || selectedReport.estimated_repair_time || 'TBD'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Map View */}
                  <Card className="backdrop-blur-xl bg-white/80 border-white/10 shadow-2xl">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Location</h3>
                      <div className="rounded-xl overflow-hidden border-2 border-slate-200 h-64">
                        <LocationPicker
                          onLocationSelect={() => { }}
                          initialPosition={[selectedReport.latitude, selectedReport.longitude]}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Timeline */}
                  <Card className="backdrop-blur-xl bg-white/80 border-white/10 shadow-2xl">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Timeline</h3>
                      <div className="space-y-4">
                        {getTimeline(selectedReport).map((event, index) => {
                          const Icon = event.icon;
                          return (
                            <div key={index} className="flex items-start space-x-4">
                              <div className={`mt-1 p-2 rounded-full ${event.status === 'completed'
                                ? 'bg-emerald-500'
                                : event.status === 'current'
                                  ? 'bg-blue-500'
                                  : 'bg-slate-300'
                                }`}>
                                <Icon className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-semibold text-slate-900">{event.title}</h4>
                                  <span className="text-xs text-slate-500">{event.date}</span>
                                </div>
                                <p className="text-sm text-slate-600">{event.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Show Analytics Dashboard when no report selected */}
                  <AnalyticsDashboard reports={reports} />

                  {/* Welcome Card */}
                  <Card className="backdrop-blur-xl bg-white/80 border-white/10 shadow-2xl mt-6">
                    <CardContent className="p-12 text-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="w-10 h-10 text-indigo-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">
                        Select a Report
                      </h3>
                      <p className="text-slate-600 max-w-md mx-auto">
                        Click on any report from the left panel to view detailed analysis,
                        location map, and timeline information.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyReports;
