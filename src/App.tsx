import React from 'react';
import { LabProvider, useLab } from './context/LabContext';
import { Navbar } from './components/Navbar';
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

      <main className="main-content-area">
        {activeTab === 'REQUEST' && <RequestForm />}
        {activeTab === 'RETURN' && <ReturnForm />}
        {activeTab === 'LECTURER' && <LecturerDashboard />}
        {activeTab === 'MACHINES' && <MachineMatrix />}
        {activeTab === 'HISTORY' && <HistoryAudit />}
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-col">
            <div className="flex items-center gap-2">
              <div className="brand-icon-box" style={{ width: 28, height: 28 }}>
                <Scissors size={15} className="brand-icon" />
              </div>
              <span className="font-bold text-sm tracking-wide">TEXTILE LAB CONNECT</span>
            </div>
            <p className="text-xs text-muted mt-2 max-w-sm">
              Laboratory Management System for Apparel, Fashion Design, and Textile Technology Studios (Rooms 719, 721, 724).
            </p>
          </div>

          <div className="footer-col">
            <div className="footer-title">STUDIO PROTOCOLS</div>
            <ul className="footer-links">
              <li>• Always turn off motor switch before leaving station</li>
              <li>• Keep hair tied and loose jewelry removed</li>
              <li>• Oil hook and bobbin race every 8 hours of usage</li>
            </ul>
          </div>

          <div className="footer-col">
            <div className="footer-title">TECHNICAL SUPPORT</div>
            <div className="text-xs text-muted space-y-1">
              <div className="flex items-center gap-1.5">
                <MapPin size={13} className="text-primary" />
                <span>Technical Office: Room 718 (Next to Studio 719)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone size={13} className="text-emerald-400" />
                <span>Lab Emergency Ext: 4821 / 4822</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="text-xs text-muted">
            TextileLab Pro System • Designed with TypeScript & React
          </span>
          <span className="text-xs text-muted flex items-center gap-1">
            <Shield size={12} className="text-primary" />
            <span>Industrial Safety Verified</span>
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
