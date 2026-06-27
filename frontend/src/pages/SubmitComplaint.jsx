import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintAPI } from '../services/api';
import LeafletMap from '../components/LeafletMap';
import axios from 'axios';
import { 
  FileText, 
  MapPin, 
  Image as ImageIcon, 
  AlertCircle, 
  CheckCircle, 
  Send, 
  Compass, 
  Info,
  MapIcon
} from 'lucide-react';

const CATEGORIES = [
  'Damaged Road',
  'Potholes',
  'Water Leakage',
  'Broken Streetlight',
  'Garbage Overflow',
  'Illegal Waste Disposal',
  'Drainage Issue',
  'Tree Fall',
  'Traffic Signal Problem',
  'Public Toilet Issue',
  'Park Maintenance',
  'Other'
];

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    location: '',
    ward: '',
    priority: 'Medium',
    contactNumber: '',
    isAnonymous: false,
    latitude: 20.5937, // default center of India
    longitude: 78.9629,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file must be smaller than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleLocationSelect = async (lat, lng) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
    
    // Reverse Geocoding via Nominatim OpenStreetMap
    setGeocoding(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
        params: {
          format: 'json',
          lat: lat,
          lon: lng,
          zoom: 18,
          addressdetails: 1
        }
      });
      if (res.data && res.data.display_name) {
        setFormData(prev => ({ ...prev, location: res.data.display_name }));
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err.message);
      // Fallback: keep coordinates, don't crash
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.category) {
      return setError('Please select a complaint category');
    }
    if (formData.latitude === 20.5937 && formData.longitude === 78.9629) {
      return setError('Please specify the location of the issue on the map');
    }

    setSubmitting(true);
    
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('category', formData.category);
      data.append('description', formData.description);
      data.append('location', formData.location);
      data.append('ward', formData.ward);
      data.append('priority', formData.priority);
      data.append('contactNumber', formData.contactNumber);
      data.append('isAnonymous', formData.isAnonymous.toString());
      data.append('latitude', formData.latitude.toString());
      data.append('longitude', formData.longitude.toString());
      
      if (imageFile) {
        data.append('image', imageFile);
      }

      const res = await complaintAPI.create(data);
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint. Ensure image size is under 5MB.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Report a Civic Issue</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">File a complaint by sharing coordinates, pictures, and description with municipality departments.</p>
      </div>

      {/* Message alerts */}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-450 text-sm flex items-start space-x-2">
          <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span>Complaint filed successfully! Redirecting to dashboard...</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 text-sm flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Panel */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-4">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Issue Title
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <FileText className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-govBlue-500 dark:focus:ring-govBlue-400 focus:border-transparent transition-all text-sm"
                  placeholder="Brief name (e.g. Large pothole on Main St)"
                />
              </div>
            </div>

            {/* Category & Priority Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-govBlue-500 dark:focus:ring-govBlue-400 focus:border-transparent transition-all text-sm"
                >
                  <option value="">-- Select Category --</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Priority Level
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-govBlue-500 dark:focus:ring-govBlue-400 focus:border-transparent transition-all text-sm"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
            </div>

            {/* Ward & Contact Number Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Ward / Zone Number
                </label>
                <input
                  name="ward"
                  type="text"
                  value={formData.ward}
                  onChange={handleInputChange}
                  placeholder="e.g. Ward 12"
                  className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-govBlue-500 dark:focus:ring-govBlue-400 focus:border-transparent transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Contact Number
                </label>
                <input
                  name="contactNumber"
                  type="text"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. +91 9876543210"
                  className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-govBlue-500 dark:focus:ring-govBlue-400 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>

            {/* Anonymous Reporting Toggle */}
            <div className="flex items-center space-x-3 p-3 bg-slate-100/70 dark:bg-slate-800/40 rounded-xl">
              <input
                id="isAnonymous"
                name="isAnonymous"
                type="checkbox"
                checked={formData.isAnonymous}
                onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                className="h-4 w-4 text-govBlue-600 focus:ring-govBlue-500 border-slate-300 rounded"
              />
              <label htmlFor="isAnonymous" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                Report Anonymously (Hide identity from public view)
              </label>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Detailed Description
              </label>
              <textarea
                name="description"
                required
                rows="4"
                value={formData.description}
                onChange={handleInputChange}
                className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-govBlue-500 dark:focus:ring-govBlue-400 focus:border-transparent transition-all text-sm"
                placeholder="Please describe the issue, indicating severity, hazard details, or how long it has persisted..."
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Upload Photo Evidence
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-800 border-dashed rounded-xl hover:border-slate-400 dark:hover:border-slate-700 transition-colors bg-white dark:bg-slate-900">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img src={imagePreview} alt="Preview" className="h-32 w-auto object-cover rounded-lg border dark:border-slate-850" />
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(''); }}
                        className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 text-xs hover:bg-rose-600 shadow-md focus:outline-none"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="mx-auto h-12 w-12 text-slate-400 stroke-[1.5]" />
                      <div className="flex text-sm text-slate-650 dark:text-slate-450 justify-center">
                        <label htmlFor="image" className="relative cursor-pointer rounded-md font-bold text-govBlue-600 hover:text-govBlue-700 dark:text-govBlue-450 dark:hover:text-govBlue-350 focus-within:outline-none">
                          <span>Upload a file</span>
                          <input id="image" name="image" type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-slate-400">PNG, JPG, GIF up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Map Panel */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-4 flex flex-col h-full">
            
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center">
                <Compass className="h-5 w-5 text-govBlue-600 mr-2" />
                Select Issue Location
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Click on the map to pin the coordinates. The address is automatically fetched.</p>
            </div>

            {/* Leaflet Map Integration */}
            <div className="h-72 w-full z-10">
              <LeafletMap 
                lat={formData.latitude} 
                lng={formData.longitude} 
                interactive={true} 
                onLocationSelect={handleLocationSelect} 
              />
            </div>

            {/* Latitude / Longitude Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400 mb-1">Latitude</label>
                <input
                  type="text"
                  disabled
                  value={formData.latitude}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400 mb-1">Longitude</label>
                <input
                  type="text"
                  disabled
                  value={formData.longitude}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400 text-xs font-mono"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Geocoded Location Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  name="location"
                  type="text"
                  required
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Address details (autofilled from map click)"
                  className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-govBlue-500 dark:focus:ring-govBlue-400 focus:border-transparent transition-all text-sm"
                />
              </div>
              {geocoding && (
                <span className="text-xs text-govBlue-500 mt-1 flex items-center">
                  <span className="inline-block h-3 w-3 border-2 border-govBlue-500 border-t-transparent rounded-full animate-spin mr-1.5" />
                  Resolving coordinates address...
                </span>
              )}
            </div>

            <div className="pt-4 mt-auto">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-govBlue-600 hover:bg-govBlue-700 active:bg-govBlue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-govBlue-500 dark:focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
              >
                {submitting ? (
                  <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Send className="h-5 w-5 mr-2" />
                )}
                Submit Complaint
              </button>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}
