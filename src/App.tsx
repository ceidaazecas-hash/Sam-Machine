import React from 'react';
import { LabProvider, useLab } from './context/LabContext';
import { Navbar } from './components/Navbar';
import { RequestForm } from './components/RequestForm';
import { ReturnForm } from './components/ReturnForm';
import { LecturerDashboard } from './components/LecturerDashboard';
import { BookingPassModal } from './components/BookingPassModal';
import { ToastContainer } from './components/Toast';
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
      </main>

      {/* Simple Clean Footer */}
      <footer className="site-footer">
        <div className="footer-inner-simple">
          <span>Facility & Equipment System • Rooms 719, 721, 724</span>
          <span>Sewing Machines: 2401–2416 • Overlocking Machines: 2101–2102</span>
        </div>
      </footer>

      {/* Booking Pass Modal */}
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
