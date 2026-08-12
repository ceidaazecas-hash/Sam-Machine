import React, { useState, useEffect } from 'react';
import { useLab } from '../context/LabContext';
import { 
  FileEdit, 
  RotateCcw, 
  UserCheck, 
  RefreshCw,
  Clock
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

  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }) + ' • ' + now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setCurrentTimeStr(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const pendingRequestsCount = requests.filter(r => r.approval.status === 'PENDING').length;
  const activeInUseCount = requests.filter(r => r.approval.status === 'IN_USE' || r.approval.status === 'APPROVED').length;

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Brand / Title & Live Date/Time */}
        <div className="brand-group" onClick={() => setActiveTab('REQUEST')} style={{ cursor: 'pointer' }}>
          <span className="brand-title">EQUIPMENT & FACILITY LAB</span>
          <span className="brand-dot" />
          <span className="brand-subtitle">Studios 719 • 721 • 724</span>
        </div>

        {/* 3 Main Navigation Tabs (Strict Black & White) */}
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
            className={`nav-tab-btn ${activeTab === 'LECTURER' ? 'active' : ''}`}
            onClick={() => setActiveTab('LECTURER')}
          >
            <UserCheck size={14} />
            <span>3. LECTURER</span>
            {pendingRequestsCount > 0 && (
              <span className="tab-badge">{pendingRequestsCount}</span>
            )}
          </button>
        </nav>

        {/* Right Actions: Live Date & Time, Room Selector & Reset */}
        <div className="header-actions">
          {currentTimeStr && (
            <div className="room-chip" style={{ border: '1px solid var(--border-light)', background: 'var(--bg-card-subtle)', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'default' }}>
              <Clock size={12} className="text-muted" />
              <span>{currentTimeStr}</span>
            </div>
          )}

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
