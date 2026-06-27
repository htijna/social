import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { complaintAPI, ASSETS_URL } from '../services/api';
import LeafletMap from '../components/LeafletMap';
import socket from '../services/socket';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Tag, 
  User, 
  Phone, 
  Mail, 
  Clock, 
  Shield, 
  Trash2, 
  CheckCircle,
  AlertTriangle,
  Building
} from 'lucide-react';

export default function ComplaintDetails({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const fetchComplaint = async () => {
    try {
      const res = await complaintAPI.getById(id);
      if (res.data.success) {
        setComplaint(res.data.complaint);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();

    // Listen to real-time updates for this specific complaint
    const handleComplaintUpdate = (updated) => {
      if (updated._id === id) {
        setComplaint(updated);
      }
    };

    socket.on('complaintUpdated', handleComplaintUpdate);
    socket.on('globalUpdate', fetchComplaint);

    return () => {
      socket.off('complaintUpdated', handleComplaintUpdate);
      socket.off('globalUpdate', fetchComplaint);
    };
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const res = await complaintAPI.delete(id);
      if (res.data.success) {
        alert('Complaint deleted successfully.');
        navigate(user.role === 'admin' ? '/admin' : '/dashboard');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete complaint.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <span className="h-10 w-10 border-4 border-govBlue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-slate-400 font-semibold">Loading complaint details...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Error Loading Details</h2>
        <p className="text-sm text-slate-500 dark:text-slate-450">{error || 'Complaint not found.'}</p>
        <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="inline-flex items-center text-govBlue-600 font-bold hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  // Define steps for the status timeline
  const getTimelineSteps = () => {
    const steps = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'];
    if (complaint.status === 'Rejected') {
      return ['Submitted', 'Under Review', 'Rejected'];
    }
    return steps;
  };

  const timelineSteps = getTimelineSteps();
  const currentStepIndex = timelineSteps.indexOf(complaint.status) !== -1 ? timelineSteps.indexOf(complaint.status) : (complaint.status === 'Pending' ? 0 : 0);

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'Emergency': return 'bg-rose-600 text-white font-bold animate-pulse';
      case 'High': return 'bg-amber-500 text-white font-semibold';
      case 'Medium': return 'bg-blue-500 text-white font-semibold';
      default: return 'bg-slate-500 text-white';
    }
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Navigation and Actions */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-semibold text-slate-650 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to list
        </button>

        {/* Delete criteria: Admin always, Citizen only when status is Submitted or Pending */}
        {(user.role === 'admin' || ((complaint.status === 'Pending' || complaint.status === 'Submitted') && complaint.userId._id === user.id)) && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 dark:text-rose-405 border border-rose-200 dark:border-rose-900/30 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Delete Complaint
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Info Panel */}
        <div className="lg:col-span-8 space-y-8">
          {/* Complaint Core Details Card */}
          <div className="glass p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-405">
                  <Tag className="h-3.5 w-3.5 mr-1" />
                  {complaint.category}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${getPriorityBadgeClass(complaint.priority)}`}>
                  Priority: {complaint.priority || 'Medium'}
                </span>
                {complaint.ward && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300">
                    {complaint.ward}
                  </span>
                )}
                {complaint.isAnonymous && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    🔒 Anonymous Report
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400 font-mono flex items-center">
                <Calendar className="h-4 w-4 mr-1.5" />
                Filed on: {new Date(complaint.createdAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
              {complaint.title}
            </h1>

            <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 border dark:border-slate-850">
              <p className="text-sm text-slate-700 dark:text-slate-350 whitespace-pre-wrap leading-relaxed">
                {complaint.description}
              </p>
            </div>

            {/* Admin Remarks Section (If any) */}
            {complaint.adminRemarks && (
              <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center">
                  <Shield className="h-4 w-4 mr-1.5" /> Official Admin Remarks
                </h4>
                <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                  {complaint.adminRemarks}
                </p>
              </div>
            )}

            {/* Uploaded Evidence Image & Resolution Proof */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-450 dark:text-slate-400 mb-3">Initial Photo Evidence</h3>
                {complaint.image ? (
                  <div className="rounded-xl overflow-hidden border border-slate-250 dark:border-slate-800 shadow-inner bg-slate-100 max-h-[300px] flex items-center justify-center">
                    <img
                      src={`${ASSETS_URL}${complaint.image}`}
                      alt="Complaint Evidence"
                      className="w-auto h-full max-h-[300px] object-contain hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?q=80&w=600&auto=format&fit=crop';
                      }}
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-xl bg-slate-100 dark:bg-slate-900 text-xs text-slate-400 border border-dashed dark:border-slate-800">
                    No initial photo evidence.
                  </div>
                )}
              </div>

              {/* Resolution Proof */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3">Resolution Proof Photo</h3>
                {complaint.resolutionImage ? (
                  <div className="rounded-xl overflow-hidden border border-emerald-300 dark:border-emerald-900 shadow-inner bg-emerald-50/50 max-h-[300px] flex items-center justify-center">
                    <img
                      src={`${ASSETS_URL}${complaint.resolutionImage}`}
                      alt="Resolution Proof"
                      className="w-auto h-full max-h-[300px] object-contain hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-900 text-xs text-slate-400 border border-dashed dark:border-slate-800 flex flex-col items-center justify-center h-[200px]">
                    <CheckCircle className="h-8 w-8 text-slate-300 mb-2" />
                    <span>Resolution photo proof will appear here once resolved.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status Tracker Timeline */}
          <div className="glass p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center">
              <Clock className="h-5 w-5 text-govBlue-600 mr-2" />
              Resolution Progress Timeline
            </h3>

            {/* Stepper view */}
            <div className="relative pt-4 flex items-center justify-between">
              {/* Connector line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0" />
              <div 
                className="absolute top-1/2 left-0 h-0.5 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500" 
                style={{ width: `${Math.max(0, (currentStepIndex / (timelineSteps.length - 1))) * 100}%` }}
              />

              {timelineSteps.map((step, idx) => {
                const isCompleted = idx < currentStepIndex;
                const isActive = idx === currentStepIndex;
                const isRejected = step === 'Rejected';

                return (
                  <div key={step} className="relative z-10 flex flex-col items-center">
                    <div 
                      className={`h-8 w-8 rounded-full border-4 flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-200 dark:border-emerald-950 text-white shadow shadow-emerald-400/20'
                          : isActive
                            ? isRejected 
                              ? 'bg-rose-500 border-rose-200 dark:border-rose-950 text-white animate-pulse'
                              : 'bg-govBlue-600 border-govBlue-200 dark:border-govBlue-950 text-white animate-pulse'
                            : 'bg-white border-slate-250 text-slate-400 dark:bg-slate-900 dark:border-slate-800'
                      }`}
                    >
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    <span 
                      className={`mt-2.5 text-[11px] font-semibold tracking-tight ${
                        isActive 
                          ? isRejected 
                            ? 'text-rose-500'
                            : 'text-govBlue-750 dark:text-govBlue-400' 
                          : isCompleted 
                            ? 'text-slate-800 dark:text-slate-350' 
                            : 'text-slate-400'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Map/Department Panel */}
        <div className="lg:col-span-4 space-y-6">
          {/* Location details card */}
          <div className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center">
              <MapPin className="h-5 w-5 text-govBlue-600 mr-2" />
              Pinned Location
            </h3>
            
            {/* MapContainer Display Only */}
            <div className="h-56 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <LeafletMap 
                lat={complaint.latitude} 
                lng={complaint.longitude} 
                interactive={false} 
              />
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <p className="font-semibold text-slate-800 dark:text-slate-300">{complaint.location}</p>
              <div className="flex space-x-4 pt-1 font-mono text-[10px]">
                <span>Lat: {complaint.latitude}</span>
                <span>Lng: {complaint.longitude}</span>
              </div>
            </div>
          </div>

          {/* Department details card */}
          <div className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center">
              <Building className="h-5 w-5 text-govBlue-600 mr-2" />
              Assigned Department
            </h3>

            {complaint.assignedDepartment ? (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-govBlue-50/60 dark:bg-slate-800/50 border border-govBlue-100/55 dark:border-slate-800/60 rounded-xl">
                  <span className="block font-bold text-govBlue-800 dark:text-govBlue-400 text-sm">
                    {complaint.assignedDepartment.departmentName}
                  </span>
                </div>
                <div className="space-y-2 text-slate-650 dark:text-slate-350">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-slate-400" />
                    <span>Officer: <strong className="text-slate-800 dark:text-slate-200">{complaint.assignedDepartment.officerName}</strong></span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-slate-400" />
                    <span>Contact: <strong className="text-slate-800 dark:text-slate-200">{complaint.assignedDepartment.contactInfo}</strong></span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-center py-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 italic">
                Awaiting review for department allocation.
              </div>
            )}
          </div>

          {/* User details (Admin view only) */}
          {user.role === 'admin' && (
            <div className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center">
                <Shield className="h-5 w-5 text-govBlue-600 mr-2" />
                Reporter Information
              </h3>
              <div className="space-y-3 text-xs text-slate-650 dark:text-slate-350">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-slate-400" />
                  <span>Name: <strong className="text-slate-800 dark:text-slate-200">{complaint.userId?.name || 'Citizen'}</strong></span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-slate-400" />
                  <span>Email: <strong className="text-slate-800 dark:text-slate-200">{complaint.userId?.email || 'N/A'}</strong></span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-slate-400" />
                  <span>Phone: <strong className="text-slate-800 dark:text-slate-200">{complaint.userId?.phone || 'N/A'}</strong></span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
