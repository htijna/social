import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle, Landmark } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const res = await authAPI.forgotPassword(email);
      if (res.data.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request reset link. Please verify your email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950/60 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 glass p-8 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-800/50">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-govBlue-600 flex items-center justify-center text-white shadow-md shadow-govBlue-500/20 mb-4">
            <Landmark className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Forgot Password
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Success State */}
        {success ? (
          <div className="space-y-6 text-center py-4">
            <div className="mx-auto h-16 w-16 bg-emerald-50 dark:bg-emerald-950/20 rounded-full flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Email Sent Successfully</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                If the email matches a registered account, a reset link has been dispatched to your inbox. Please check your spam folder if you do not receive it shortly.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center text-sm font-semibold text-govBlue-600 hover:text-govBlue-700 dark:text-govBlue-400 dark:hover:text-govBlue-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            {/* Error state */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 text-sm flex items-start space-x-2 animate-shake">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-govBlue-500 dark:focus:ring-govBlue-400 focus:border-transparent transition-all text-sm"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-govBlue-600 hover:bg-govBlue-700 active:bg-govBlue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-govBlue-500 dark:focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
              >
                {loading ? (
                  <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Send className="h-5 w-5 mr-2" />
                )}
                Send Reset Link
              </button>
            </form>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
