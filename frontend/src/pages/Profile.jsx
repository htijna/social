import React, { useState } from 'react';
import { userAPI } from '../services/api';
import { User, Phone, MapPin, Lock, Save, CheckCircle, AlertCircle, Landmark } from 'lucide-react';

export default function Profile({ user, setUser }) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    address: user.address || '',
    password: '',
    confirmPassword: ''
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (formData.password && formData.password !== formData.confirmPassword) {
      return setError('New passwords do not match');
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await userAPI.updateProfile(user.id, payload);
      if (res.data.success) {
        setSuccess(true);
        // Clean password fields
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        // Update user state and local storage
        const updatedUser = { ...user, ...res.data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Details Sidebar */}
        <div className="md:col-span-1">
          <div className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-full bg-govBlue-100 dark:bg-slate-800 text-govBlue-700 dark:text-govBlue-400 flex items-center justify-center text-3xl font-bold border-4 border-white dark:border-slate-950 shadow-md mb-4 uppercase">
              {user.name.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{user.name}</h2>
            <p className="text-xs text-slate-450 dark:text-slate-400 capitalize mt-1.5">{user.role} Account</p>
            
            <div className="w-full border-t border-slate-200/50 dark:border-slate-800/50 mt-6 pt-6 text-left space-y-4 text-sm text-slate-650 dark:text-slate-350">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{user.email}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Type</span>
                <span className="font-semibold text-govBlue-700 dark:text-govBlue-450 capitalize inline-flex items-center px-2 py-0.5 rounded-full bg-govBlue-50 dark:bg-slate-800/60 text-xs">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Settings Form */}
        <div className="md:col-span-2">
          <div className="glass p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Profile Settings</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Modify your personal contact information and security passwords.</p>
            </div>

            {/* Success alert */}
            {success && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-450 text-sm flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            {/* Error notification */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-450 text-sm flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-govBlue-500 dark:focus:ring-govBlue-400 focus:border-transparent transition-all text-sm"
                      placeholder="Your Name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-govBlue-500 dark:focus:ring-govBlue-400 focus:border-transparent transition-all text-sm"
                      placeholder="Phone number"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Residential Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <MapPin className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-govBlue-500 dark:focus:ring-govBlue-400 focus:border-transparent transition-all text-sm"
                      placeholder="Address details"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 border-t border-slate-200/50 dark:border-slate-800/50 my-2 pt-4">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">Change Password</h3>
                  <p className="text-xs text-slate-400 mb-4">Leave fields blank if you do not wish to update your password.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-govBlue-500 dark:focus:ring-govBlue-400 focus:border-transparent transition-all text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-govBlue-500 dark:focus:ring-govBlue-400 focus:border-transparent transition-all text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center py-2.5 px-6 border border-transparent rounded-xl text-sm font-semibold text-white bg-govBlue-600 hover:bg-govBlue-700 active:bg-govBlue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-govBlue-500 dark:focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
                >
                  {loading ? (
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
