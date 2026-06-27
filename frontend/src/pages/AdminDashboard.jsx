import React, { useEffect, useState, useCallback } from 'react';
import { complaintAPI, departmentAPI, userAPI, ASSETS_URL, BACKEND_PREFIX } from '../services/api';
import axios from 'axios';
import socket from '../services/socket';
import { 
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  Building, Users, FileText, CheckCircle, Clock, AlertCircle, 
  Search, Plus, Edit2, Trash2, Shield, Eye, Calendar, Tag, UserCheck, Download, Printer, MessageSquare, Upload
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CHART_COLORS = ['#3e6ebd', '#818cf8', '#fbbf24', '#f87171', '#34d399', '#a78bfa', '#f472b6', '#22d3ee'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Data loading states
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Department Form States
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptForm, setDeptForm] = useState({ departmentName: '', officerName: '', contactInfo: '' });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [wardFilter, setWardFilter] = useState('');

  // Admin Action Modal (Remarks & Resolution Image)
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionRemarks, setActionRemarks] = useState('');
  const [actionPriority, setActionPriority] = useState('');
  const [resolutionFile, setResolutionFile] = useState(null);
  const [actionSubmitting, setActionSubmitting] = useState(false);

  const handleExportCSV = () => {
    const token = localStorage.getItem('token');
    window.open(`${ASSETS_URL}/api/complaints/export/csv?token=${token}`, '_blank');
  };

  const handleExportPDF = () => {
    const token = localStorage.getItem('token');
    window.open(`${ASSETS_URL}/api/complaints/export/pdf?token=${token}`, '_blank');
  };

  const openActionModal = (c) => {
    setSelectedComplaint(c);
    setActionRemarks(c.adminRemarks || '');
    setActionPriority(c.priority || 'Medium');
    setResolutionFile(null);
    setShowActionModal(true);
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setActionSubmitting(true);
    try {
      // 1. Update priority and admin remarks
      const res = await complaintAPI.update(selectedComplaint._id, {
        priority: actionPriority,
        adminRemarks: actionRemarks
      });

      // 2. Upload resolution image if provided
      if (resolutionFile) {
        const formData = new FormData();
        formData.append('image', resolutionFile);
        const token = localStorage.getItem('token');
        await axios.post(`${ASSETS_URL}/api/complaints/${selectedComplaint._id}/resolution-image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
      }

      if (res.data.success) {
        setComplaints(prev => prev.map(item => item._id === selectedComplaint._id ? res.data.complaint : item));
      }
      setShowActionModal(false);
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update complaint action details.');
    } finally {
      setActionSubmitting(false);
    }
  };

  const fetchComplaints = useCallback(async () => {
    try {
      const res = await complaintAPI.getAll();
      if (res.data.success) {
        setComplaints(res.data.complaints);
      }
    } catch (err) {
      console.error('Error fetching complaints:', err.message);
    } finally {
      setLoadingComplaints(false);
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await departmentAPI.getAll();
      if (res.data.success) {
        setDepartments(res.data.departments);
      }
    } catch (err) {
      console.error('Error fetching departments:', err.message);
    } finally {
      setLoadingDepartments(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await userAPI.getAll();
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err.message);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const refreshAll = useCallback(() => {
    fetchComplaints();
    fetchDepartments();
    fetchUsers();
  }, [fetchComplaints, fetchDepartments, fetchUsers]);

  useEffect(() => {
    refreshAll();

    // Listen to real-time events to refresh admin dashboard automatically
    const handleNewComplaint = (data) => {
      fetchComplaints();
    };

    const handleComplaintUpdate = () => {
      fetchComplaints();
    };

    socket.on('newComplaint', handleNewComplaint);
    socket.on('complaintUpdated', handleComplaintUpdate);
    socket.on('globalUpdate', refreshAll);

    return () => {
      socket.off('newComplaint', handleNewComplaint);
      socket.off('complaintUpdated', handleComplaintUpdate);
      socket.off('globalUpdate', refreshAll);
    };
  }, [refreshAll, fetchComplaints]);

  // Operations
  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      const res = await complaintAPI.update(complaintId, { status: newStatus });
      if (res.data.success) {
        // Updated in state dynamically (socket will also broadcast, but instant update is nice)
        setComplaints(prev => prev.map(c => c._id === complaintId ? { ...c, status: newStatus } : c));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleDeptAssign = async (complaintId, deptId) => {
    try {
      const res = await complaintAPI.update(complaintId, { assignedDepartment: deptId || '' });
      if (res.data.success) {
        const matchedDept = departments.find(d => d._id === deptId) || null;
        setComplaints(prev => prev.map(c => c._id === complaintId ? { ...c, assignedDepartment: matchedDept } : c));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign department.');
    }
  };

  // Department CRUD
  const openAddDept = () => {
    setEditingDept(null);
    setDeptForm({ departmentName: '', officerName: '', contactInfo: '' });
    setShowDeptModal(true);
  };

  const openEditDept = (dept) => {
    setEditingDept(dept);
    setDeptForm({
      departmentName: dept.departmentName,
      officerName: dept.officerName,
      contactInfo: dept.contactInfo
    });
    setShowDeptModal(true);
  };

  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDept) {
        const res = await departmentAPI.update(editingDept._id, deptForm);
        if (res.data.success) {
          setDepartments(prev => prev.map(d => d._id === editingDept._id ? res.data.department : d));
        }
      } else {
        const res = await departmentAPI.create(deptForm);
        if (res.data.success) {
          setDepartments(prev => [...prev, res.data.department]);
        }
      }
      setShowDeptModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save department details.');
    }
  };

  const handleDeptDelete = async (deptId) => {
    if (!window.confirm('Are you sure you want to delete this department? Any complaints assigned to it will be set to unassigned.')) {
      return;
    }
    try {
      const res = await departmentAPI.delete(deptId);
      if (res.data.success) {
        setDepartments(prev => prev.filter(d => d._id !== deptId));
        // Reset complaints assigned locally
        setComplaints(prev => prev.map(c => c.assignedDepartment?._id === deptId ? { ...c, assignedDepartment: null } : c));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete department.');
    }
  };

  // Aggregate Metrics
  const totalReports = complaints.length;
  const pendingReports = complaints.filter(c => c.status === 'Pending').length;
  const inProgressReports = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedReports = complaints.filter(c => c.status === 'Resolved').length;
  const totalUsers = users.length;

  // Chart aggregation logic (in-memory grouping)
  const getCategoryData = () => {
    const counts = {};
    complaints.forEach(c => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  const getMonthlyTrendData = () => {
    const trends = {};
    // Sort complaints chronologically first
    const sorted = [...complaints].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    sorted.forEach(c => {
      const month = new Date(c.createdAt).toLocaleString('default', { month: 'short', year: '2-digit' });
      trends[month] = (trends[month] || 0) + 1;
    });
    
    return Object.entries(trends).map(([name, Complaints]) => ({ name, Complaints }));
  };

  const getStatusData = () => {
    const counts = { Pending: 0, 'Under Review': 0, 'In Progress': 0, Resolved: 0, Rejected: 0 };
    complaints.forEach(c => {
      if (counts[c.status] !== undefined) {
        counts[c.status]++;
      }
    });
    return Object.entries(counts).map(([name, Count]) => ({ name, Count }));
  };

  // Filter complaints
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === '' || c.status === statusFilter;
    const matchesCategory = categoryFilter === '' || c.category === categoryFilter;
    const matchesDept = deptFilter === '' || c.assignedDepartment?._id === deptFilter;
    const matchesPriority = priorityFilter === '' || c.priority === priorityFilter;
    const matchesWard = wardFilter === '' || (c.ward && c.ward.toLowerCase().includes(wardFilter.toLowerCase()));

    return matchesSearch && matchesStatus && matchesCategory && matchesDept && matchesPriority && matchesWard;
  });

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Title & Tab Switches */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center">
            <Shield className="h-7 w-7 text-govBlue-600 mr-2" />
            Administrative Portal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review municipal logs, assign workforce departments, and inspect analytics.</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap p-1 bg-slate-100 dark:bg-slate-900 rounded-xl max-w-max border dark:border-slate-850">
          {[
            { id: 'overview', label: 'Analytics' },
            { id: 'complaints', label: 'Issues Queue' },
            { id: 'departments', label: 'Departments' },
            { id: 'users', label: 'Users Directory' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-850 text-govBlue-700 dark:text-govBlue-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-350'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- Tab 1: Overview Analytics --- */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
            <div className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
              <span className="block text-2xl font-extrabold text-slate-905 dark:text-white">{totalReports}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Complaints</span>
            </div>
            <div className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
              <span className="block text-2xl font-extrabold text-amber-600 dark:text-amber-400">{pendingReports}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Pending</span>
            </div>
            <div className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
              <span className="block text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{inProgressReports}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">In Progress</span>
            </div>
            <div className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
              <span className="block text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{resolvedReports}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Resolved</span>
            </div>
            <div className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 col-span-2 lg:col-span-1">
              <span className="block text-2xl font-extrabold text-govBlue-600 dark:text-govBlue-400">{totalUsers}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Registered Users</span>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Monthly Trend (Area Chart) */}
            <div className="lg:col-span-8 glass p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col h-[340px]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Monthly Complaint Trends</h3>
              <div className="flex-1 w-full text-xs">
                {complaints.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400">No data available yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getMonthlyTrendData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3e6ebd" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3e6ebd" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', color: '#1e293b', border: '1px solid #e2e8f0' }} />
                      <Area type="monotone" dataKey="Complaints" stroke="#3e6ebd" strokeWidth={2.5} fillOpacity={1} fill="url(#colorComplaints)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Category Breakdown (Pie Chart) */}
            <div className="lg:col-span-4 glass p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col h-[340px]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Complaint Categories</h3>
              <div className="flex-1 w-full text-xs relative">
                {complaints.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400">No data available yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getCategoryData()}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {getCategoryData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} Issues`]} />
                      <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Status Breakdown (Bar Chart) */}
            <div className="lg:col-span-12 glass p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col h-[280px]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Complaint Status Distribution</h3>
              <div className="flex-1 w-full text-xs">
                {complaints.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400">No data available yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getStatusData()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} />
                      <Bar dataKey="Count" fill="#818cf8" radius={[4, 4, 0, 0]}>
                        {getStatusData().map((entry, index) => {
                          const colors = {
                            Pending: '#fbbf24',
                            'Under Review': '#60a5fa',
                            'In Progress': '#818cf8',
                            Resolved: '#34d399',
                            Rejected: '#f87171'
                          };
                          return <Cell key={`cell-${index}`} fill={colors[entry.name] || '#94a3b8'} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- Tab 2: Complaints Queue --- */}
      {activeTab === 'complaints' && (
        <div className="space-y-4">
          {/* Filters Bar & Export Actions */}
          <div className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search & Ward Input */}
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search title, location..."
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-govBlue-500"
                />
              </div>
              <input
                type="text"
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
                placeholder="Filter Ward..."
                className="w-full sm:w-32 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-govBlue-500"
              />
            </div>

            {/* Select Dropdowns & Export Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-govBlue-500"
              >
                <option value="">All Categories</option>
                <option value="Damaged Road">Damaged Road</option>
                <option value="Potholes">Potholes</option>
                <option value="Water Leakage">Water Leakage</option>
                <option value="Broken Streetlight">Broken Streetlight</option>
                <option value="Garbage Overflow">Garbage Overflow</option>
                <option value="Illegal Waste Disposal">Illegal Waste Disposal</option>
                <option value="Drainage Issue">Drainage Issue</option>
                <option value="Tree Fall">Tree Fall</option>
                <option value="Traffic Signal Problem">Traffic Signal Problem</option>
                <option value="Public Toilet Issue">Public Toilet Issue</option>
                <option value="Park Maintenance">Park Maintenance</option>
                <option value="Other">Other</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-govBlue-500"
              >
                <option value="">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Emergency">Emergency</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-govBlue-500"
              >
                <option value="">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Pending">Pending</option>
                <option value="Under Review">Under Review</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>

              <div className="flex items-center space-x-1 pl-1">
                <button
                  onClick={handleExportCSV}
                  className="p-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-xl hover:bg-emerald-100 transition-all text-xs font-semibold flex items-center"
                  title="Export CSV"
                >
                  <Download className="h-4 w-4 mr-1" /> CSV
                </button>
                <button
                  onClick={handleExportPDF}
                  className="p-2 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 rounded-xl hover:bg-indigo-100 transition-all text-xs font-semibold flex items-center"
                  title="Print PDF Report"
                >
                  <Printer className="h-4 w-4 mr-1" /> Print/PDF
                </button>
              </div>
            </div>
          </div>

          {/* Table list */}
          <div className="glass rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              {loadingComplaints ? (
                <div className="p-12 text-center">
                  <span className="inline-block h-8 w-8 border-4 border-govBlue-500 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-xs text-slate-400">Loading complaints log...</p>
                </div>
              ) : filteredComplaints.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <FileText className="h-12 w-12 mx-auto stroke-[1.5]" />
                  <p className="text-sm font-bold">No matching complaints found</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800 text-left">
                  <thead className="bg-slate-50/50 dark:bg-slate-900/30 text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Complaint & Priority</th>
                      <th className="px-6 py-4">Reporter</th>
                      <th className="px-6 py-4">Date Filed</th>
                      <th className="px-6 py-4">Status Update</th>
                      <th className="px-6 py-4">Department Assignment</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs text-slate-700 dark:text-slate-350">
                    {filteredComplaints.map(c => (
                      <tr key={c._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 max-w-xs">
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-slate-950 dark:text-white line-clamp-1">{c.title}</span>
                              <span className={`px-1.5 py-0.2 text-[9px] rounded font-bold ${
                                c.priority === 'Emergency' ? 'bg-rose-600 text-white animate-pulse' :
                                c.priority === 'High' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}>{c.priority || 'Medium'}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 truncate flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {c.location} {c.ward ? `(${c.ward})` : ''}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-800 dark:text-slate-250">{c.isAnonymous ? '🔒 Anonymous' : (c.userId?.name || 'Citizen')}</span>
                            <span className="text-[10px] text-slate-400">{c.contactNumber || c.userId?.phone || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={c.status}
                            onChange={(e) => handleStatusChange(c._id, e.target.value)}
                            className="px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-govBlue-500 cursor-pointer"
                          >
                            <option value="Submitted">Submitted</option>
                            <option value="Pending">Pending</option>
                            <option value="Under Review">Under Review</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={c.assignedDepartment?._id || ''}
                            onChange={(e) => handleDeptAssign(c._id, e.target.value)}
                            className="px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-govBlue-500 cursor-pointer w-40"
                          >
                            <option value="">-- Unassigned --</option>
                            {departments.map(d => (
                              <option key={d._id} value={d._id}>{d.departmentName}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right space-x-1">
                          <button
                            onClick={() => openActionModal(c)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:border-amber-500 dark:border-slate-800 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors inline-flex"
                            title="Add Remarks & Resolution Proof"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/complaints/${c._id}`)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:border-govBlue-550 dark:border-slate-850 text-slate-550 hover:text-govBlue-600 transition-colors inline-flex"
                            title="Inspect details"
                          >
                            <Eye className="h-4 w-4" />
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
      )}

      {/* --- Tab 3: Departments Management --- */}
      {activeTab === 'departments' && (
        <div className="space-y-4">
          {/* Action Trigger bar */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-909 dark:text-white flex items-center">
              <Building className="h-5 w-5 text-govBlue-600 mr-2" />
              Municipal Departments ({departments.length})
            </h2>
            <button
              onClick={openAddDept}
              className="inline-flex items-center justify-center py-2 px-4 rounded-xl text-xs font-semibold bg-govBlue-600 hover:bg-govBlue-700 text-white transition-all shadow-md"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Department
            </button>
          </div>

          {/* Department table */}
          <div className="glass rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              {loadingDepartments ? (
                <div className="p-12 text-center">
                  <span className="inline-block h-8 w-8 border-4 border-govBlue-500 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-xs text-slate-400">Loading departments...</p>
                </div>
              ) : departments.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <Building className="h-12 w-12 mx-auto stroke-[1.5]" />
                  <p className="text-sm font-bold">No departments registered</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800 text-left">
                  <thead className="bg-slate-50/50 dark:bg-slate-900/30 text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Department Name</th>
                      <th className="px-6 py-4">Supervising Officer</th>
                      <th className="px-6 py-4">Contact Info</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs text-slate-700 dark:text-slate-350">
                    {departments.map(d => (
                      <tr key={d._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{d.departmentName}</td>
                        <td className="px-6 py-4 text-slate-800 dark:text-slate-300 font-medium">{d.officerName}</td>
                        <td className="px-6 py-4 text-slate-500">{d.contactInfo}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => openEditDept(d)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:border-govBlue-550 dark:border-slate-800 dark:hover:border-govBlue-500 text-slate-550 hover:text-govBlue-600 transition-colors inline-flex"
                            title="Edit department"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeptDelete(d._id)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:border-rose-500 dark:border-slate-800 dark:hover:border-rose-900 text-slate-550 hover:text-rose-600 transition-colors inline-flex"
                            title="Delete department"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
      )}

      {/* --- Tab 4: Registered Users Directory --- */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-909 dark:text-white flex items-center">
            <Users className="h-5 w-5 text-govBlue-600 mr-2" />
            Registered Users Directory ({users.length})
          </h2>

          <div className="glass rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              {loadingUsers ? (
                <div className="p-12 text-center">
                  <span className="inline-block h-8 w-8 border-4 border-govBlue-500 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-xs text-slate-400">Loading user list...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <Users className="h-12 w-12 mx-auto stroke-[1.5]" />
                  <p className="text-sm font-bold">No users registered</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800 text-left">
                  <thead className="bg-slate-50/50 dark:bg-slate-900/30 text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-4">User Name</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Phone</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Address</th>
                      <th className="px-6 py-4">Registered Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs text-slate-700 dark:text-slate-350">
                    {users.map(u => (
                      <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white flex items-center">
                          <div className="h-7 w-7 rounded-full bg-govBlue-100 dark:bg-slate-800 text-govBlue-700 dark:text-govBlue-400 font-extrabold text-[10px] flex items-center justify-center mr-2.5 uppercase">
                            {u.name.charAt(0)}
                          </div>
                          {u.name}
                        </td>
                        <td className="px-6 py-4 text-slate-800 dark:text-slate-205">{u.email}</td>
                        <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">{u.phone}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            u.role === 'admin'
                              ? 'bg-govBlue-100 text-govBlue-800 dark:bg-govBlue-950/45 dark:text-govBlue-400'
                              : 'bg-slate-100 text-slate-650 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-550 max-w-xs truncate">{u.address || <span className="italic text-slate-400">Not provided</span>}</td>
                        <td className="px-6 py-4 text-slate-450 text-[10px]">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Department Add/Edit Modal --- */}
      {showDeptModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="glass w-full max-w-md p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-909 dark:text-white mb-4">
              {editingDept ? 'Update Department' : 'Create Department'}
            </h3>
            
            <form onSubmit={handleDeptSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400 mb-1.5">
                  Department Name
                </label>
                <input
                  type="text"
                  required
                  value={deptForm.departmentName}
                  onChange={(e) => setDeptForm({ ...deptForm, departmentName: e.target.value })}
                  placeholder="e.g. Roads Department"
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-govBlue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400 mb-1.5">
                  Supervising Officer
                </label>
                <input
                  type="text"
                  required
                  value={deptForm.officerName}
                  onChange={(e) => setDeptForm({ ...deptForm, officerName: e.target.value })}
                  placeholder="Officer Name"
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-govBlue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400 mb-1.5">
                  Contact Info
                </label>
                <input
                  type="text"
                  required
                  value={deptForm.contactInfo}
                  onChange={(e) => setDeptForm({ ...deptForm, contactInfo: e.target.value })}
                  placeholder="Phone, email, room number, etc."
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-govBlue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-650 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-350 dark:hover:bg-slate-700/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-govBlue-600 text-white hover:bg-govBlue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Admin Action Modal (Remarks & Resolution Image) --- */}
      {showActionModal && selectedComplaint && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="glass w-full max-w-lg p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center">
              <MessageSquare className="h-5 w-5 text-govBlue-600 mr-2" />
              Manage Complaint Action & Remarks
            </h3>
            <p className="text-xs text-slate-500 truncate font-semibold">"{selectedComplaint.title}"</p>
            
            <form onSubmit={handleActionSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400 mb-1.5">
                  Priority Level
                </label>
                <select
                  value={actionPriority}
                  onChange={(e) => setActionPriority(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-govBlue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400 mb-1.5">
                  Official Admin Remarks / Progress Notes
                </label>
                <textarea
                  rows="3"
                  value={actionRemarks}
                  onChange={(e) => setActionRemarks(e.target.value)}
                  placeholder="Add inspection observations, work order numbers, or resolution summary..."
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-govBlue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400 mb-1.5">
                  Upload Completion / Resolution Proof Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setResolutionFile(e.target.files[0])}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-govBlue-50 file:text-govBlue-700 dark:file:bg-slate-800 dark:file:text-govBlue-400 hover:file:bg-govBlue-100"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowActionModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-650 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-350"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionSubmitting}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-govBlue-600 text-white hover:bg-govBlue-700 flex items-center"
                >
                  {actionSubmitting && <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />}
                  Save Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

