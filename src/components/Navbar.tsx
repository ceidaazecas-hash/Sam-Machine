import React from 'react';
import { useLab } from '../context/LabContext';
import { 
  FileEdit, 
  RotateCcw, 
  UserCheck, 
  RefreshCw
} from 'lucide-react';
import type { RoomId } from '../types/lab';

export const Navbar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    selectedRoom, 
    setSelectedRoom, 
    resetDemoData,
    requests
  } = useLab();

  const pendingRequestsCount = requests.filter(r => r.approval.status === 'PENDING').length;
  const activeInUseCount = requests.filter(r => r.approval.status === 'IN_USE' || r.approval.status === 'APPROVED').length;

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Brand / Title */}
        <div className="brand-group" onClick={() => setActiveTab('REQUEST')} style={{ cursor: 'pointer' }}>
          <div className="brand-badge-square">LAB</div>
          <div>
            <div className="brand-title">FACILITY & EQUIPMENT</div>
            <div className="brand-subtitle">Rooms 719 • 721 • 724</div>
          </div>
        </div>

        {/* 3 Main Navigation Tabs (Horizontally scrollable on mobile) */}
        <div className="header-nav-scroll-wrapper">
          <nav className="header-nav">
            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'REQUEST' ? 'active' : ''}`}
              onClick={() => setActiveTab('REQUEST')}
            >
              <FileEdit size={15} />
              <span>1. REQUEST</span>
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'RETURN' ? 'active' : ''}`}
              onClick={() => setActiveTab('RETURN')}
            >
              <RotateCcw size={15} />
              <span>2. RETURN</span>
              {activeInUseCount > 0 && (
                <span className="tab-pill-badge">{activeInUseCount}</span>
              )}
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'LECTURER' ? 'active' : ''}`}
              onClick={() => setActiveTab('LECTURER')}
            >
              <UserCheck size={15} />
              <span>3. LECTURER</span>
              {pendingRequestsCount > 0 && (
                <span className="tab-pill-badge amber">{pendingRequestsCount}</span>
              )}
            </button>
          </nav>
        </div>

        {/* Right Actions: Room Selector & Reset */}
        <div className="header-actions">
          <div className="room-selector-pill">
            <span className="room-label">Room:</span>
            {(['719', '721', '724'] as RoomId[]).map(room => (
              <button
                key={room}
                type="button"
                className={`room-chip ${selectedRoom === room ? 'active' : ''}`}
                onClick={() => setSelectedRoom(room)}
              >
                {room}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={resetDemoData}
            className="action-icon-btn"
            title="Reset Demo Data"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>
    </header>
  );
};
