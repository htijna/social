import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { complaintAPI } from '../services/api';
import socket from '../services/socket';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Plus, 
  Search, 
  ChevronRight, 
  MapPin, 
  Calendar,
  AlertCircle,
  Tag
} from 'lucide-react';

export default function CitizenDashboard({ user }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const navigate = useNavigate();

  const fetchComplaints = useCallback(async () => {
    try {
      const res = await complaintAPI.getAll();
      if (res.data.success) {
        setComplaints(res.data.complaints);
      }
    } catch (err) {
      setError('Failed to fetch your complaint history. Please reload.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();

    // Listen to real-time status updates from socket
    const handleComplaintUpdate = () => {
      fetchComplaints();
    };

    socket.on('complaintUpdated', handleComplaintUpdate);
    socket.on('globalUpdate', handleComplaintUpdate);

    return () => {
      socket.off('complaintUpdated', handleComplaintUpdate);
      socket.off('globalUpdate', handleComplaintUpdate);
    };
  }, [fetchComplaints]);

  // Statistics calculation
  const totalCount = complaints.length;
  const pendingCount = complaints.filter(c => c.status === 'Pending' || c.status === 'Under Review').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  // Filter complaints in frontend for quick feedback
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
      c.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === '' || c.status === statusFilter;
    const matchesCategory = categoryFilter === '' || c.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
      case 'Under Review':
        return 'bg-blue-50 text-blue-750 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30';
      case 'In Progress':
        return 'bg-indigo-50 text-indigo-705 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-450 dark:border-indigo-900/30';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-800 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/30';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900/30';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-govBlue-900 to-govBlue-750 text-white p-6 rounded-2xl shadow-md">
        <div>
          <h1 className="text-2xl font-bold font-sans">Hello, {user.name}</h1>
          <p className="text-xs text-govBlue-200 mt-1">Manage and track your reported infrastructure complaints in real-time.</p>
        </div>
        <Link
          to="/submit-issue"
          className="inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-semibold bg-white text-govBlue-850 hover:bg-govBlue-50 transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          File a Complaint
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-extrabold text-slate-900 dark:text-white">{totalCount}</span>
            <span className="text-xs text-slate-450 dark:text-slate-400">Total Lodged</span>
          </div>
        </div>

        <div className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-500">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-extrabold text-slate-900 dark:text-white">{pendingCount}</span>
            <span className="text-xs text-slate-450 dark:text-slate-400">Awaiting Review</span>
          </div>
        </div>

        <div className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-extrabold text-slate-900 dark:text-white">{inProgressCount}</span>
            <span className="text-xs text-slate-450 dark:text-slate-400">In Progress</span>
          </div>
        </div>

        <div className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-extrabold text-slate-900 dark:text-white">{resolvedCount}</span>
            <span className="text-xs text-slate-450 dark:text-slate-400">Resolved Issues</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="glass rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden shadow-md">
        
        {/* Filter Toolbar */}
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40 flex flex-col md:flex-row gap-4 items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Your Complaint Log</h2>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search complaints..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-govBlue-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-govBlue-500"
            >
              <option value="">All Categories</option>
              <option value="Damaged Roads">Damaged Roads</option>
              <option value="Broken Streetlights">Broken Streetlights</option>
              <option value="Water Leakage">Water Leakage</option>
              <option value="Garbage Issues">Garbage Issues</option>
              <option value="Illegal Waste Disposal">Illegal Waste Disposal</option>
              <option value="Drainage Problems">Drainage Problems</option>
              <option value="Public Property Damage">Public Property Damage</option>
              <option value="Others">Others</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-govBlue-500"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Complaints Table/List */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <span className="inline-block h-8 w-8 border-4 border-govBlue-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs text-slate-400">Loading your complaints...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-rose-500 space-y-2">
              <AlertCircle className="h-8 w-8 mx-auto" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-4">
              <FileText className="h-12 w-12 mx-auto stroke-[1.5]" />
              <div className="space-y-1">
                <p className="text-sm font-bold">No complaints found</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">Either you haven't filed any complaints yet, or none match your current filters.</p>
              </div>
              <Link
                to="/submit-issue"
                className="inline-flex items-center justify-center py-2 px-4 rounded-xl text-xs font-semibold bg-govBlue-600 hover:bg-govBlue-755 text-white transition-all shadow"
              >
                File Your First Complaint
              </Link>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800 text-left">
              <thead className="bg-slate-50/50 dark:bg-slate-900/30 text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4">Complaint Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Date Filed</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Assigned Dept</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs text-slate-700 dark:text-slate-350">
                {filteredComplaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 max-w-xs">
                      <div className="flex flex-col space-y-1">
                        <span className="font-semibold text-slate-900 dark:text-white line-clamp-1">{c.title}</span>
                        <span className="text-[10px] text-slate-400 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="truncate">{c.location}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 rounded-full">
                        <Tag className="h-3 w-3 mr-1" />
                        {c.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-500">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {c.assignedDepartment ? (
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {c.assignedDepartment.departmentName}
                        </span>
                      ) : (
                        <span className="italic text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/complaints/${c._id}`)}
                        className="inline-flex items-center px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-govBlue-500 hover:text-govBlue-600 dark:border-slate-800 dark:hover:border-govBlue-500 transition-colors font-semibold text-[11px]"
                      >
                        Track Status
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
