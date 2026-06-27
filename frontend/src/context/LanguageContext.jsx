import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    appName: "CivicConnect",
    navHome: "Home",
    navDashboard: "Dashboard",
    navReportIssue: "Report Issue",
    navAdmin: "Admin Console",
    navProfile: "Profile",
    navLogin: "Sign In",
    navRegister: "Register",
    navLogout: "Sign Out",
    heroTitle: "Empowering Citizens for a Cleaner, Safer City",
    heroSubtitle: "Report civic issues like potholes, broken streetlights, or water leakage directly to local municipal authorities and track resolution in real-time.",
    reportButton: "File a Complaint Now",
    trackStatus: "Track Complaint",
    statsTotal: "Total Complaints",
    statsPending: "Pending Review",
    statsResolved: "Resolved Issues",
    statsHighPriority: "High Priority",
    categoryLabel: "Category",
    priorityLabel: "Priority Level",
    wardLabel: "Ward / Zone",
    anonymousLabel: "Report Anonymously",
    contactPhone: "Contact Phone Number",
    submitIssue: "Submit Complaint",
    exportCSV: "Export CSV",
    exportPDF: "Print Official Report",
    timelineSubmitted: "Submitted",
    timelineUnderReview: "Under Review",
    timelineAssigned: "Assigned",
    timelineInProgress: "In Progress",
    timelineResolved: "Resolved",
    adminRemarks: "Official Admin Remarks",
    resolutionProof: "Completion Proof Photo"
  },
  ml: {
    appName: "സിവിക് കണക്ട്",
    navHome: "ഹോം",
    navDashboard: "ഡാഷ്‌ബോർഡ്",
    navReportIssue: "പരാതി നൽകുക",
    navAdmin: "അഡ്മിൻ കോൺസോൾ",
    navProfile: "പ്രൊഫൈൽ",
    navLogin: "ലോഗിൻ",
    navRegister: "രജിസ്റ്റർ ചെയ്യുക",
    navLogout: "ലോഗ്ഔട്ട്",
    heroTitle: "ശുചിത്വമുള്ളതും സുരക്ഷിതവുമായ നഗരത്തിനായി ജനകീയ മുന്നേറ്റം",
    heroSubtitle: "റോഡ് കേടുപാടുകൾ, തെരുവ് വിളക്കുകളുടെ തകരാറുകൾ, ജലചോർച്ച എന്നിവ നഗരസഭയെ നേരിട്ട് അറിയിക്കുകയും തത്സമയം നിരീക്ഷിക്കുകയും ചെയ്യുക.",
    reportButton: "പരാതി രജിസ്റ്റർ ചെയ്യുക",
    trackStatus: "പരാതി നിരീക്ഷിക്കുക",
    statsTotal: "ആകെ പരാതികൾ",
    statsPending: "പരിഗണനയിലുള്ളവ",
    statsResolved: "പരിഹരിച്ചവ",
    statsHighPriority: "അടിയന്തര പ്രാധാന്യമുള്ളവ",
    categoryLabel: "വിഭാഗം",
    priorityLabel: "മുൻഗണന തലം",
    wardLabel: "വാർഡ് / സോൺ",
    anonymousLabel: "രഹസ്യമായി പരാതിപ്പെടുക",
    contactPhone: "ബന്ധപ്പെടേണ്ട ഫോൺ നമ്പർ",
    submitIssue: "പരാതി സമർപ്പിക്കുക",
    exportCSV: "സിഎസ്വി എക്സ്പോർട്ട്",
    exportPDF: "റിപ്പോർട്ട് പ്രിന്റ് ചെയ്യുക",
    timelineSubmitted: "സമർപ്പിച്ചു",
    timelineUnderReview: "പരിശോധനയിൽ",
    timelineAssigned: "ചുമതലപ്പെടുത്തി",
    timelineInProgress: "നടപടികൾ പുരോഗമിക്കുന്നു",
    timelineResolved: "പരിഹരിച്ചു",
    adminRemarks: "അഡ്മിൻ റിമാർക്കുകൾ",
    resolutionProof: "പരിഹരിച്ച ചിത്ര തെളിവ്"
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app_lang') || 'en';
  });

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'ml' : 'en';
    setLanguage(nextLang);
    localStorage.setItem('app_lang', nextLang);
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
