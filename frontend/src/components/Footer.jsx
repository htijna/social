import React from 'react';
import { Landmark, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-auto bg-slate-900 text-slate-350 dark:bg-slate-950 border-t border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Description */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2 text-white font-bold text-lg tracking-tight">
              <Landmark className="h-6 w-6 stroke-[2] text-govBlue-400" />
              <span className="font-extrabold">Civic<span className="text-govBlue-300 font-normal">Connect</span></span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              CivicConnect is an official municipal portal allowing citizens to report public infrastructure issues directly to local departments. We strive to provide transparent and swift resolution to civic grievances.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-govBlue-400 transition-colors">Home Page</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-govBlue-400 transition-colors">Citizen Login</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-govBlue-400 transition-colors">Account Registration</Link>
              </li>
              <li>
                <a 
                  href="https://www.india.gov.in" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center hover:text-govBlue-400 transition-colors"
                >
                  National Portal <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Support & Help</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start">
                <MapPin className="h-4 w-4 text-govBlue-400 mr-2.5 mt-0.5 flex-shrink-0" />
                <span>Municipal Corporation HQ, Sector 4, Civic Center, IN</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 text-govBlue-400 mr-2.5 flex-shrink-0" />
                <span>Toll-Free: 1800-111-2222</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-4 w-4 text-govBlue-400 mr-2.5 flex-shrink-0" />
                <span>support@civicconnect.gov</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal and copy rights */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} CivicConnect Municipal Corporation. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">Help & FAQs</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
