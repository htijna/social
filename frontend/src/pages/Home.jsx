import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  MapPin, 
  Clock, 
  CheckCircle, 
  ChevronRight, 
  FileText, 
  Wrench, 
  UserCheck, 
  PhoneCall, 
  Mail, 
  MessageSquare,
  Send,
  Building
} from 'lucide-react';

export default function Home() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(true);
    setContactForm({ name: '', email: '', message: '' });
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-govBlue-950 via-govBlue-900 to-slate-900 text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-govBlue-800/20 via-transparent to-transparent z-0" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-govBlue-500/25 text-govBlue-300 border border-govBlue-500/30">
              Official Municipal Portal
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-white font-sans">
              Streamline Civic Issues. <span className="text-govBlue-400">Empower Communities.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-light leading-relaxed">
              Report public infrastructure damages directly to the municipal administration. Upload photos, pin coordinates on our interactive map, and monitor resolution timelines in real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/submit-issue"
                className="inline-flex justify-center items-center py-3.5 px-6 border border-transparent rounded-xl text-sm font-semibold text-white bg-govBlue-600 hover:bg-govBlue-500 shadow-lg shadow-govBlue-550/20 hover:shadow-govBlue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                File an Issue
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                to="/register"
                className="inline-flex justify-center items-center py-3.5 px-6 rounded-xl text-sm font-semibold text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 bg-slate-900/60 hover:bg-slate-900/80 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Create Account
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            {/* Visual Dashboard Mockup */}
            <div className="w-full max-w-sm glass rounded-2xl border border-white/10 p-6 shadow-2xl relative animate-pulse">
              <div className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-rose-500 ring-4 ring-rose-950 animate-ping" />
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <span className="text-sm font-semibold text-slate-300">Live Status Feed</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <div className="space-y-4">
                <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl text-xs space-y-2">
                  <div className="flex justify-between font-semibold text-slate-200">
                    <span>Streetlight Outage</span>
                    <span className="text-govBlue-400">In Progress</span>
                  </div>
                  <p className="text-slate-400">Sector 12 crossing - Water Department team assigned</p>
                </div>
                <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl text-xs space-y-2">
                  <div className="flex justify-between font-semibold text-slate-200">
                    <span>Drainage Overflow</span>
                    <span className="text-emerald-450 text-emerald-450">Resolved</span>
                  </div>
                  <p className="text-slate-400">Clearing complete by sanitation crew</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 border-r border-slate-100 dark:border-slate-800 last:border-0">
              <span className="block text-3xl sm:text-4xl font-extrabold text-govBlue-600 dark:text-govBlue-400">14,280+</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1 block">Total Reports</span>
            </div>
            <div className="p-4 border-r border-slate-100 dark:border-slate-800 last:border-0">
              <span className="block text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">92.4%</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1 block">Resolution Rate</span>
            </div>
            <div className="p-4 border-r border-slate-100 dark:border-slate-800 last:border-0">
              <span className="block text-3xl sm:text-4xl font-extrabold text-govBlue-600 dark:text-govBlue-400">4.2 Hrs</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1 block">Avg Response</span>
            </div>
            <div className="p-4 last:border-0">
              <span className="block text-3xl sm:text-4xl font-extrabold text-amber-600 dark:text-amber-400">4 Depts</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1 block">Integrated</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-950/40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Bridge the Gap Between Municipal Authorities & Citizens
            </h2>
            <p className="text-slate-650 dark:text-slate-350 leading-relaxed font-light">
              CivicConnect is an initiative by the Municipal Corporation to empower citizens with tools to participate directly in public asset maintenance. Instead of running back and forth to government offices, you can file logs on water leakage, pothole damage, or trash issues online.
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="mt-1 flex-shrink-0 p-1.5 bg-govBlue-100 dark:bg-slate-800 text-govBlue-600 dark:text-govBlue-450 rounded-lg">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Immediate Dispatch</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Complaints are categorized and dispatched directly to departments.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mt-1 flex-shrink-0 p-1.5 bg-govBlue-100 dark:bg-slate-800 text-govBlue-600 dark:text-govBlue-450 rounded-lg">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Precise Location Mapping</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Using OpenStreetMap coordinates means crews arrive exactly at the issue point.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 h-[380px] bg-slate-200">
            {/* Embedded illustration image fallback / placeholder */}
            <div className="absolute inset-0 bg-gradient-to-tr from-govBlue-900 to-govBlue-600 flex items-center justify-center p-8 text-center text-white">
              <div className="space-y-4 max-w-sm">
                <Building className="h-16 w-16 mx-auto stroke-[1.5] text-govBlue-200" />
                <h3 className="text-lg font-bold">Smart Governance</h3>
                <p className="text-xs text-govBlue-100">Connecting municipal resources with active citizen feedback for cleaner, safer, and better-managed towns.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 px-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">How CivicConnect Works</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Three easy steps to file and resolve civic complaints in your locality.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/40 relative">
              <div className="h-12 w-12 rounded-xl bg-govBlue-600 flex items-center justify-center text-white font-bold text-lg mb-6 shadow-md shadow-govBlue-550/20">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 text-left">1. Log Complaint</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-left leading-relaxed">
                Take a picture of the issue, select a category (e.g. damaged road, leakage), pin the exact location coordinates, and submit.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/40 relative">
              <div className="h-12 w-12 rounded-xl bg-govBlue-600 flex items-center justify-center text-white font-bold text-lg mb-6 shadow-md shadow-govBlue-550/20">
                <Wrench className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 text-left">2. Official Allocation</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-left leading-relaxed">
                Administrators verify details, assign a department (Water, Roads, Electricity, Sanitation), and updates status to "In Progress".
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/40 relative">
              <div className="h-12 w-12 rounded-xl bg-govBlue-600 flex items-center justify-center text-white font-bold text-lg mb-6 shadow-md shadow-govBlue-550/20">
                <UserCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 text-left">3. Quick Resolution</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-left leading-relaxed">
                Field teams resolve the problem, mark it complete, and the system notifies you via real-time alerts and email.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-950/40 transition-colors duration-300">
        <div className="max-w-4xl mx-auto glass rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Get in Touch</h2>
                <p className="text-xs text-slate-400 mt-1">Have queries regarding portal operations or registration difficulties?</p>
              </div>
              <div className="space-y-4 text-sm text-slate-600 dark:text-slate-350">
                <div className="flex items-center">
                  <PhoneCall className="h-4 w-4 text-govBlue-500 mr-3" />
                  <span>Helpline: 1800-111-2222</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-govBlue-500 mr-3" />
                  <span>support@civicconnect.gov</span>
                </div>
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 text-govBlue-500 mr-3" />
                  <span>24/7 Chatbot assistance available</span>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-7">
              {success ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-900/30 rounded-xl space-y-3">
                  <CheckCircle className="h-10 w-10 text-emerald-500" />
                  <h4 className="font-bold text-emerald-850 dark:text-emerald-400">Message Received</h4>
                  <p className="text-xs text-slate-400">Thank you. We have received your query and will reply within 24 business hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="Your Name"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-govBlue-500 text-xs"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder="Email Address"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-govBlue-500 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <textarea
                      required
                      rows="4"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Type your message..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-govBlue-500 text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex justify-center items-center py-2.5 px-6 border border-transparent rounded-xl text-xs font-semibold text-white bg-govBlue-600 hover:bg-govBlue-700 transition-all shadow shadow-govBlue-500/10 cursor-pointer"
                  >
                    Send Message
                    <Send className="ml-2 h-3.5 w-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
