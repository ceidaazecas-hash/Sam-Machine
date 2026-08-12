import React from 'react';
import { useLab } from '../context/LabContext';
import { 
  Scissors, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  UserCheck, 
  ClipboardList, 
  Undo2, 
  Cpu, 
  FileText,
  DoorOpen
} from 'lucide-react';
import type { UserRole, RoomId } from '../types/lab';

export const Navbar: React.FC = () => {
  const { 
    currentRole, 
    setRole, 
    activeTab, 
    setActiveTab, 
    selectedRoom, 
    setSelectedRoom, 
    theme, 
    toggleTheme, 
    soundEnabled, 
    toggleSound, 
    resetDemoData,
    requests
  } = useLab();

  const pendingRequestsCount = requests.filter(r => r.approval.status === 'PENDING').length;
  const activeInUseCount = requests.filter(r => r.approval.status === 'IN_USE').length;

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Logo & Brand */}
        <div className="brand-group" onClick={() => setActiveTab('REQUEST')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon-box">
            <Scissors className="brand-icon" size={22} />
          </div>
          <div>
            <div className="brand-title">
              <span>TEXTILE</span>
              <span className="brand-highlight">LAB</span>
              <span className="brand-badge">PRO</span>
            </div>
            <div className="brand-subtitle">Fashion Equipment & Studio Management</div>
          </div>
        </div>

        {/* Room Switcher */}
        <div className="room-selector-pill">
          <DoorOpen size={16} className="text-secondary" />
          <span className="room-label">Studio Room:</span>
          {(['719', '721', '724'] as RoomId[]).map(room => (
            <button
              key={room}
              type="button"
              className={`room-chip ${selectedRoom === room ? 'active' : ''}`}
              onClick={() => setSelectedRoom(room)}
            >
              Room {room}
            </button>
          ))}
        </div>

        {/* Navigation Tabs */}
        <nav className="header-nav">
          <button
            type="button"
            className={`nav-link ${activeTab === 'REQUEST' ? 'active' : ''}`}
            onClick={() => setActiveTab('REQUEST')}
          >
            <ClipboardList size={16} />
            <span>Request Equipment</span>
          </button>

          <button
            type="button"
            className={`nav-link ${activeTab === 'RETURN' ? 'active' : ''}`}
            onClick={() => setActiveTab('RETURN')}
          >
            <Undo2 size={16} />
            <span>Return & Inspection</span>
            {activeInUseCount > 0 && (
              <span className="badge-counter badge-cyan">{activeInUseCount}</span>
            )}
          </button>

          <button
            type="button"
            className={`nav-link ${activeTab === 'LECTURER' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('LECTURER');
              if (currentRole === 'STUDENT') setRole('LECTURER');
            }}
          >
            <UserCheck size={16} />
            <span>Lecturer Hub</span>
            {pendingRequestsCount > 0 && (
              <span className="badge-counter badge-amber">{pendingRequestsCount}</span>
            )}
          </button>

          <button
            type="button"
            className={`nav-link ${activeTab === 'MACHINES' ? 'active' : ''}`}
            onClick={() => setActiveTab('MACHINES')}
          >
            <Cpu size={16} />
            <span>Machine Grid</span>
          </button>

          <button
            type="button"
            className={`nav-link ${activeTab === 'HISTORY' ? 'active' : ''}`}
            onClick={() => setActiveTab('HISTORY')}
          >
            <FileText size={16} />
            <span>Audit Logs</span>
          </button>
        </nav>

        {/* Right Actions: Role Selector, Sound, Theme, Reset */}
        <div className="header-actions">
          {/* Role Dropdown */}
          <div className="role-switcher">
            <span className="role-label">Role:</span>
            <select
              value={currentRole}
              onChange={e => setRole(e.target.value as UserRole)}
              className="role-select"
            >
              <option value="STUDENT">🎓 Student View</option>
              <option value="LECTURER">👨‍🏫 Lecturer View</option>
              <option value="LAB_TECH">🛠️ Lab Tech / Admin</option>
            </select>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className="action-icon-btn"
            title={soundEnabled ? 'Disable UI Sound Effects' : 'Enable UI Sound Effects'}
          >
            {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="action-icon-btn"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Reset Demo Data */}
          <button
            type="button"
            onClick={resetDemoData}
            className="action-icon-btn"
            title="Reset to Initial Demo State"
          >
            <RotateCcw size={17} />
          </button>
        </div>
      </div>
    </header>
  );
};
