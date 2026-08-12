import React from 'react';
import { LabProvider, useLab } from './context/LabContext';
import { Navbar } from './components/Navbar';
import { LuxuryHero } from './components/LuxuryHero';
import { RequestForm } from './components/RequestForm';
import { ReturnForm } from './components/ReturnForm';
import { LecturerDashboard } from './components/LecturerDashboard';
import { MachineMatrix } from './components/MachineMatrix';
import { HistoryAudit } from './components/HistoryAudit';
import { BookingPassModal } from './components/BookingPassModal';
import { ToastContainer } from './components/Toast';
import { Scissors, Shield, MapPin, Phone } from 'lucide-react';
import './styles/index.css';

const MainContent: React.FC = () => {
  const { activeTab, activePassRequest, setActivePassRequest } = useLab();

  return (
    <div className="app-shell">
      <Navbar />

      {/* Hero Section displayed on Request & Main views */}
      {activeTab === 'REQUEST' && <LuxuryHero />}

      <main className="main-content-area" id="studio-booking-anchor">
        {activeTab === 'REQUEST' && <RequestForm />}
        {activeTab === 'RETURN' && <ReturnForm />}
        {activeTab === 'LECTURER' && <LecturerDashboard />}
        {activeTab === 'MACHINES' && <MachineMatrix />}
        {activeTab === 'HISTORY' && <HistoryAudit />}
      </main>

      {/* Luxury Footer */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-col">
            <div className="flex items-center gap-2">
              <div className="brand-icon-box" style={{ width: 32, height: 32 }}>
                <Scissors size={17} className="brand-icon" />
              </div>
              <span className="footer-brand-title">ATELIER CRAFT • LAB CONNECT</span>
            </div>
            <p className="footer-brand-desc">
              State-of-the-art laboratory requisition and equipment lifecycle system for Apparel, Fashion Design, and Textile Engineering Studios (Rooms 719, 721, 724).
            </p>
          </div>

          <div className="footer-col">
            <div className="footer-title">STUDIO PROTOCOLS</div>
            <ul className="footer-links">
              <li>• Always turn off servo motor switch before vacating workstation</li>
              <li>• Tie back hair, remove loose jewelry & wear eye protection</li>
              <li>• Clear lint basin and oil hook every 8 operating hours</li>
            </ul>
          </div>

          <div className="footer-col">
            <div className="footer-title">STUDIO DIRECTORY</div>
            <div className="text-xs text-muted space-y-2">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-primary" />
                <span>Technical Office: Room 718 (Adjacent to Studio 719)</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-emerald-400" />
                <span>Studio Support Hotline: Ext 4821 / 4822</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="text-xs text-muted">
            © 2026 Atelier Craft • Textile & Apparel Lab Management
          </span>
          <span className="text-xs text-muted flex items-center gap-1">
            <Shield size={13} className="text-primary" />
            <span>Certified Laboratory Safety Framework</span>
          </span>
        </div>
      </footer>

      {/* Modals & Overlays */}
      {activePassRequest && (
        <BookingPassModal
          request={activePassRequest}
          onClose={() => setActivePassRequest(null)}
        />
      )}

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <LabProvider>
      <MainContent />
    </LabProvider>
  );
}
