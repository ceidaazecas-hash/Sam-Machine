import React from 'react';
import { useLab } from '../context/LabContext';
import { 
  FileEdit, 
  RotateCcw, 
  Search,
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
          <span className="brand-title">EQUIPMENT & FACILITY LAB</span>
          <span className="brand-dot" />
          <span className="brand-subtitle">Studios 719 • 721 • 724</span>
        </div>

        {/* 4 Main Navigation Tabs (Strict Black & White) */}
        <nav className="header-nav">
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'REQUEST' ? 'active' : ''}`}
            onClick={() => setActiveTab('REQUEST')}
          >
            <FileEdit size={14} />
            <span>1. REQUEST</span>
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'RETURN' ? 'active' : ''}`}
            onClick={() => setActiveTab('RETURN')}
          >
            <RotateCcw size={14} />
            <span>2. RETURN</span>
            {activeInUseCount > 0 && (
              <span className="tab-badge">{activeInUseCount}</span>
            )}
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'TRACK' ? 'active' : ''}`}
            onClick={() => setActiveTab('TRACK')}
          >
            <Search size={14} />
            <span>3. TRACK</span>
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'LECTURER' ? 'active' : ''}`}
            onClick={() => setActiveTab('LECTURER')}
          >
            <UserCheck size={14} />
            <span>4. LECTURER</span>
            {pendingRequestsCount > 0 && (
              <span className="tab-badge">{pendingRequestsCount}</span>
            )}
          </button>
        </nav>

        {/* Right Actions: Room Selector & Reset */}
        <div className="header-actions">
          <div className="room-chip-group">
            <span className="room-chip-label">Room:</span>
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
            className="icon-button"
            title="Reset to Initial Demo Data"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>
    </header>
  );
};
