import React, { useState } from 'react';
import { useLab } from '../context/LabContext';
import type { BookingRequest, Machine, Lecturer, RequestStatus } from '../types/lab';
import { 
  Check, 
  X, 
  Clock, 
  Layers, 
  Award, 
  ShieldCheck, 
  Edit3,
  Lock,
  Unlock,
  KeyRound,
  LogOut,
  Eye,
  EyeOff,
  AlertCircle,
  Download,
  Plus,
  Settings,
  UserPlus,
  BookPlus,
  Cpu,
  Trash2,
  Search,
  CheckCircle2,
  Ticket,
  FileCheck,
  Filter
} from 'lucide-react';
import { formatDate } from '../utils/helpers';
import { SignaturePad } from './SignaturePad';

const LECTURER_PASSCODE = 'SamSam22';

export const LecturerDashboard: React.FC = () => {
  const { 
    requests, 
    lecturers, 
    modules,
    machines, 
    approveRequest, 
    rejectRequest, 
    addMachine,
    editMachine,
    deleteMachine,
    addLecturer,
    editLecturer,
    deleteLecturer,
    addClassModule,
    editClassModule,
    deleteClassModule,
    deleteRequest,
    exportRequestsToCSV,
    exportMachinesToCSV,
    exportStudentSummaryToCSV,
    setActiveTab,
    setActivePassRequest,
    showToast 
  } = useLab();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('lecturer_authenticated') === 'true';
  });
  const [enteredPasscode, setEnteredPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const [activeSubTab, setActiveSubTab] = useState<'VERIFY' | 'MACHINE_REPORTS' | 'STUDENT_REPORTS' | 'TRACK_HISTORY' | 'MANAGE'>('VERIFY');
  const [selectedLecturer, setSelectedLecturer] = useState<string>('ALL');

  // Track History & Request Status sub-states
  const [trackSearchQuery, setTrackSearchQuery] = useState('');
  const [trackStatusFilter, setTrackStatusFilter] = useState<'ALL' | RequestStatus>('ALL');
  const [trackDateFilter, setTrackDateFilter] = useState<'ALL' | 'TODAY' | 'UPCOMING' | 'PAST'>('ALL');
  const [selectedTrackReqId, setSelectedTrackReqId] = useState<string>('');

  // Modals for Actions
  const [modalRequest, setModalRequest] = useState<BookingRequest | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [feedbackNote, setFeedbackNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [lecturerSig, setLecturerSig] = useState('');

  // Add & Edit Machine Modal State
  const [showMachineModal, setShowMachineModal] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [machineFormCode, setMachineFormCode] = useState('');
  const [machineFormType, setMachineFormType] = useState<'SEWING' | 'OVERLOCKING' | 'CUSTOM'>('SEWING');
  const [machineFormRoom, setMachineFormRoom] = useState<'719' | '721' | '724'>('719');
  const [machineFormModel, setMachineFormModel] = useState('');
  const [machineFormStatus, setMachineFormStatus] = useState<'AVAILABLE' | 'IN_USE' | 'MAINTENANCE'>('AVAILABLE');
  const [machineFormNotes, setMachineFormNotes] = useState('');

  // Add & Edit Lecturer Modal State
  const [showLecturerModal, setShowLecturerModal] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState<Lecturer | null>(null);
  const [lecturerFormName, setLecturerFormName] = useState('');
  const [lecturerFormEmail, setLecturerFormEmail] = useState('');
  const [lecturerFormDept, setLecturerFormDept] = useState('Textile & Apparel Design');

  // Add & Edit Module Modal State
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModuleOldName, setEditingModuleOldName] = useState<string | null>(null);
  const [moduleFormName, setModuleFormName] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPasscode === LECTURER_PASSCODE) {
      setIsAuthenticated(true);
      sessionStorage.setItem('lecturer_authenticated', 'true');
      setAuthError('');
      showToast('Lecturer access granted.', 'success');
    } else {
      setAuthError('Incorrect passcode. Access is restricted to authorized faculty.');
      showToast('Access denied: incorrect password.', 'error');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('lecturer_authenticated');
    setEnteredPasscode('');
    showToast('Lecturer session locked.', 'info');
  };

  const filteredRequests = requests.filter(r => {
    if (selectedLecturer === 'ALL') return true;
    return r.applicant.lecturer === selectedLecturer || r.approval.verifiedByLecturer === selectedLecturer;
  });

  const pendingRequests = filteredRequests.filter(r => r.approval.status === 'PENDING');

  // Filtered requests for the Track History tab
  const trackedRequests = filteredRequests.filter(r => {
    const q = trackSearchQuery.toLowerCase().trim();
    const matchesQuery = 
      !q ||
      r.id.toLowerCase().includes(q) ||
      r.applicant.studentName.toLowerCase().includes(q) ||
      r.applicant.studentId.toLowerCase().includes(q) ||
      r.applicant.classModule.toLowerCase().includes(q) ||
      r.applicant.lecturer.toLowerCase().includes(q) ||
      r.requestDetails.facilityRoom.includes(q) ||
      r.requestDetails.machineIds.some(m => m.includes(q));

    const matchesStatus = trackStatusFilter === 'ALL' || r.approval.status === trackStatusFilter;

    const reqDate = r.requestDetails.date;
    const todayStr = '2026-08-12';
    let matchesDate = true;
    if (trackDateFilter === 'TODAY') {
      matchesDate = reqDate === todayStr;
    } else if (trackDateFilter === 'UPCOMING') {
      matchesDate = reqDate > todayStr;
    } else if (trackDateFilter === 'PAST') {
      matchesDate = reqDate < todayStr || r.approval.status === 'RETURNED';
    }

    return matchesQuery && matchesStatus && matchesDate;
  });

  const activeTrackRequest: BookingRequest | undefined = 
    requests.find(r => r.id === selectedTrackReqId) || trackedRequests[0];

  const handleOpenAction = (req: BookingRequest, type: 'APPROVE' | 'REJECT') => {
    setModalRequest(req);
    setActionType(type);
    setFeedbackNote(type === 'APPROVE' ? 'Application verified. Approved for studio workstation use.' : '');
    setRejectionReason(type === 'REJECT' ? 'Facility maintenance conflict or scheduled group lecture.' : '');
  };

  const handleConfirmAction = () => {
    if (!modalRequest) return;

    if (actionType === 'APPROVE') {
      approveRequest(
        modalRequest.id,
        feedbackNote,
        lecturerSig || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50"><path d="M 10 25 Q 60 5 110 30 T 180 15" stroke="%23000000" stroke-width="2" fill="none"/></svg>'
      );
    } else {
      if (!rejectionReason.trim()) {
        showToast('Please state a rejection reason.', 'error');
        return;
      }
      rejectRequest(modalRequest.id, rejectionReason);
    }

    setModalRequest(null);
  };

  // Open Machine Add / Edit
  const handleOpenAddMachine = () => {
    setEditingMachine(null);
    setMachineFormCode('');
    setMachineFormType('SEWING');
    setMachineFormRoom('719');
    setMachineFormModel('');
    setMachineFormStatus('AVAILABLE');
    setMachineFormNotes('');
    setShowMachineModal(true);
  };

  const handleOpenEditMachine = (m: Machine) => {
    setEditingMachine(m);
    setMachineFormCode(m.code);
    setMachineFormType(m.type as any);
    setMachineFormRoom(m.room as any);
    setMachineFormModel(m.model);
    setMachineFormStatus(m.status as any);
    setMachineFormNotes(m.notes || '');
    setShowMachineModal(true);
  };

  const handleSaveMachine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!machineFormCode.trim()) {
      showToast('Please enter a machine code.', 'error');
      return;
    }

    if (editingMachine) {
      editMachine(editingMachine.id, {
        code: machineFormCode.trim(),
        type: machineFormType,
        room: machineFormRoom,
        model: machineFormModel,
        status: machineFormStatus,
        notes: machineFormNotes
      });
    } else {
      addMachine({
        code: machineFormCode.trim(),
        name: `${machineFormType === 'SEWING' ? 'Lockstitch' : machineFormType === 'OVERLOCKING' ? 'Overlocker' : 'Equipment'} #${machineFormCode}`,
        type: machineFormType,
        room: machineFormRoom,
        status: machineFormStatus,
        model: machineFormModel || (machineFormType === 'SEWING' ? 'Juki DDL-8700 Industrial' : 'Pegasus M900 Overlocker'),
        notes: machineFormNotes || 'Newly registered workstation equipment.'
      });
    }

    setShowMachineModal(false);
  };

  const handleDeleteMachine = (m: Machine) => {
    if (window.confirm(`Are you sure you want to delete Machine #${m.code} from Room ${m.room}?`)) {
      deleteMachine(m.id);
    }
  };

  // Open Lecturer Add / Edit
  const handleOpenAddLecturer = () => {
    setEditingLecturer(null);
    setLecturerFormName('');
    setLecturerFormEmail('');
    setLecturerFormDept('Textile & Apparel Design');
    setShowLecturerModal(true);
  };

  const handleOpenEditLecturer = (l: Lecturer) => {
    setEditingLecturer(l);
    setLecturerFormName(l.name);
    setLecturerFormEmail(l.email);
    setLecturerFormDept(l.department);
    setShowLecturerModal(true);
  };

  const handleSaveLecturer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lecturerFormName.trim()) {
      showToast('Please enter faculty name.', 'error');
      return;
    }

    if (editingLecturer) {
      editLecturer(editingLecturer.id, {
        name: lecturerFormName.trim(),
        email: lecturerFormEmail.trim(),
        department: lecturerFormDept.trim()
      });
    } else {
      addLecturer({
        name: lecturerFormName.trim(),
        email: lecturerFormEmail || `${lecturerFormName.toLowerCase().replace(/\s+/g, '.')}@fashion-institute.edu`,
        department: lecturerFormDept,
        modules: []
      });
    }

    setShowLecturerModal(false);
  };

  const handleDeleteLecturer = (l: Lecturer) => {
    if (window.confirm(`Are you sure you want to delete faculty member "${l.name}"?`)) {
      deleteLecturer(l.id);
    }
  };

  // Open Module Add / Edit
  const handleOpenAddModule = () => {
    setEditingModuleOldName(null);
    setModuleFormName('');
    setShowModuleModal(true);
  };

  const handleOpenEditModule = (modName: string) => {
    setEditingModuleOldName(modName);
    setModuleFormName(modName);
    setShowModuleModal(true);
  };

  const handleSaveModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleFormName.trim()) {
      showToast('Please enter module title.', 'error');
      return;
    }

    if (editingModuleOldName) {
      editClassModule(editingModuleOldName, moduleFormName.trim());
    } else {
      addClassModule(moduleFormName.trim());
    }

    setShowModuleModal(false);
  };

  const handleDeleteModule = (modName: string) => {
    if (window.confirm(`Are you sure you want to delete module "${modName}"?`)) {
      deleteClassModule(modName);
    }
  };

  const handleDeleteRequest = (id: string) => {
    if (window.confirm(`Are you sure you want to delete/cancel Request ${id}?`)) {
      deleteRequest(id);
    }
  };

  // Stepper helper
  const getStepState = (req: BookingRequest, step: 1 | 2 | 3 | 4) => {
    const status = req.approval.status;
    if (step === 1) return 'completed';
    if (step === 2) {
      if (status === 'REJECTED') return 'rejected';
      if (status === 'PENDING') return 'current';
      return 'completed';
    }
    if (step === 3) {
      if (status === 'PENDING' || status === 'REJECTED') return 'upcoming';
      if (status === 'IN_USE' || status === 'APPROVED') return 'current';
      return 'completed';
    }
    if (step === 4) {
      if (status === 'RETURNED') return 'completed';
      return 'upcoming';
    }
    return 'upcoming';
  };

  // Compute student tracking statistics
  const studentMap = new Map<string, {
    name: string;
    studentId: string;
    semester: string;
    classModule: string;
    totalBookings: number;
    completedReturns: number;
    pendingBookings: number;
  }>();

  requests.forEach(r => {
    const sId = r.applicant.studentId;
    if (!studentMap.has(sId)) {
      studentMap.set(sId, {
        name: r.applicant.studentName,
        studentId: sId,
        semester: r.applicant.semester,
        classModule: r.applicant.classModule,
        totalBookings: 0,
        completedReturns: 0,
        pendingBookings: 0
      });
    }
    const st = studentMap.get(sId)!;
    st.totalBookings += 1;
    if (r.approval.status === 'RETURNED') st.completedReturns += 1;
    if (r.approval.status === 'PENDING') st.pendingBookings += 1;
  });

  const studentTrackList = Array.from(studentMap.values());

  // =========================================================================
  // PASSWORD GATE IF NOT AUTHENTICATED
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="fluid-page-wrapper flex items-center justify-center py-12" style={{ minHeight: '60vh' }}>
        <div className="form-card-container" style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--text-primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto' }}>
            <Lock size={18} />
          </div>

          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Lecturer Verification Portal
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Enter your faculty passcode to access verification & reports
          </p>

          <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
            <div className="form-field">
              <label className="field-label">
                Faculty Passcode <span className="required-dot">*</span>
              </label>
              <div className="input-container">
                <KeyRound size={14} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={enteredPasscode}
                  onChange={e => {
                    setEnteredPasscode(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  placeholder="Enter passcode (SamSam22)"
                  className="form-input"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.75rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {authError && (
              <div style={{ padding: '0.65rem', background: 'var(--bg-card-subtle)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', marginBottom: '0.85rem' }}>
                <AlertCircle size={14} />
                <span>{authError}</span>
              </div>
            )}

            <button type="submit" className="btn-submit-primary">
              <Unlock size={14} />
              <span>UNLOCK LECTURER PORTAL</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('REQUEST')}
              style={{ width: '100%', textAlign: 'center', marginTop: '0.75rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.75rem' }}
            >
              ← Return to Student Request Form
            </button>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // AUTHENTICATED LECTURER HUB
  // =========================================================================
  return (
    <div className="fluid-page-wrapper">
      {/* Intro Header */}
      <div className="page-intro">
        <div>
          <h1 className="page-intro-title">Lecturer Portal & Verification Hub</h1>
          <p className="page-intro-desc">Review student applications, maintain machine logs, and track compliance</p>
        </div>

        {/* Right Controls: Export, Filter & Lock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={exportRequestsToCSV}
            className="room-chip"
            style={{ border: '1px solid var(--border-dark)', color: 'var(--text-primary)', background: '#ffffff', padding: '0.35rem 0.75rem', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            title="Download full request audit logs into Excel (CSV format)"
          >
            <Download size={13} />
            <span>Export Excel (.csv)</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Filter:</span>
            <select
              value={selectedLecturer}
              onChange={e => setSelectedLecturer(e.target.value)}
              className="form-select"
              style={{ minHeight: '34px', padding: '0.2rem 0.65rem', fontSize: '0.78rem', width: 'auto' }}
            >
              <option value="ALL">All Lecturers</option>
              {lecturers.map(l => (
                <option key={l.id} value={l.name}>{l.name}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="room-chip"
            style={{ border: '1px solid var(--border-medium)', color: 'var(--text-secondary)', background: '#ffffff', padding: '0.35rem 0.75rem', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            title="Lock Lecturer Portal"
          >
            <LogOut size={13} />
            <span>Lock Portal</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="lecturer-subnav-row">
        <button
          type="button"
          className={`subnav-btn-minimal ${activeSubTab === 'VERIFY' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('VERIFY')}
        >
          <Clock size={14} />
          <span>Verifying Applications ({pendingRequests.length})</span>
        </button>

        <button
          type="button"
          className={`subnav-btn-minimal ${activeSubTab === 'TRACK_HISTORY' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('TRACK_HISTORY')}
        >
          <Search size={14} />
          <span>Track History & Status</span>
        </button>

        <button
          type="button"
          className={`subnav-btn-minimal ${activeSubTab === 'MACHINE_REPORTS' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('MACHINE_REPORTS')}
        >
          <Layers size={14} />
          <span>Reports: Each Machine</span>
        </button>

        <button
          type="button"
          className={`subnav-btn-minimal ${activeSubTab === 'STUDENT_REPORTS' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('STUDENT_REPORTS')}
        >
          <Award size={14} />
          <span>Reports: Students Request</span>
        </button>

        <button
          type="button"
          className={`subnav-btn-minimal ${activeSubTab === 'MANAGE' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('MANAGE')}
        >
          <Settings size={14} />
          <span>Inventory & Settings</span>
        </button>
      </div>

      {/* 1. VERIFYING APPLICATIONS */}
      {activeSubTab === 'VERIFY' && (
        <div>
          {pendingRequests.length === 0 ? (
            <div className="form-card-container text-center py-8">
              <ShieldCheck size={36} className="mx-auto mb-2 opacity-40 text-slate-900" />
              <h3 className="font-bold text-sm text-slate-800">All Applications Verified</h3>
              <p className="text-xs text-muted mt-0.5">There are currently no pending student equipment requests requiring review.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
              {pendingRequests.map(req => (
                <div key={req.id} className="form-card-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '0.5rem', marginBottom: '0.65rem', borderBottom: '1px solid var(--border-light)' }}>
                      <div>
                        <span className="mono font-bold" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{req.id}</span>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{req.applicant.studentName}</h3>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{req.applicant.semester} • {req.applicant.classModule}</div>
                      </div>
                      <span className="status-pill-subtle pill-green">PENDING</span>
                    </div>

                    <div className="detail-card-grid" style={{ marginBottom: '0.85rem' }}>
                      <div className="detail-item">
                        <span className="detail-label">Facility / Room</span>
                        <span className="detail-value">Room {req.requestDetails.facilityRoom}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Machines</span>
                        <span className="detail-value font-bold">{req.requestDetails.machineIds.join(', ')}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Usage Date</span>
                        <span className="detail-value">{formatDate(req.requestDetails.date)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Time Slot</span>
                        <span className="detail-value">{req.requestDetails.startTime} - {req.requestDetails.endTime}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.65rem', borderTop: '1px solid var(--border-light)' }}>
                    <button
                      type="button"
                      onClick={() => handleDeleteRequest(req.id)}
                      className="room-chip"
                      style={{ border: '1px solid var(--border-medium)', color: 'var(--text-muted)', background: '#ffffff', padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                      title="Cancel / Delete Application"
                    >
                      <Trash2 size={12} style={{ display: 'inline', marginRight: '0.2rem' }} />
                      Delete
                    </button>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenAction(req, 'REJECT')}
                        className="btn-action-reject"
                      >
                        <X size={13} />
                        <span>Reject</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenAction(req, 'APPROVE')}
                        className="btn-action-approve"
                      >
                        <Check size={13} />
                        <span>Approve</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. TRACK HISTORY & REQUEST STATUS (INTEGRATED FULL TRACKER) */}
      {activeSubTab === 'TRACK_HISTORY' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Filter & Search Bar */}
          <div className="form-card-container" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="input-container" style={{ maxWidth: '360px', flex: 1 }}>
                <Search size={16} className="input-icon" />
                <input
                  type="text"
                  value={trackSearchQuery}
                  onChange={e => setTrackSearchQuery(e.target.value)}
                  placeholder="Search by Student, ID (REQ-2026-...), or Room..."
                  className="form-input"
                  style={{ minHeight: '40px', paddingLeft: '2.4rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Filter size={12} /> Status:
                </span>
                {[
                  { id: 'ALL', label: 'All Requests' },
                  { id: 'IN_USE', label: 'In Studio Usage' },
                  { id: 'PENDING', label: 'Pending' },
                  { id: 'APPROVED', label: 'Approved' },
                  { id: 'RETURNED', label: 'Returned' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setTrackStatusFilter(tab.id as any)}
                    className={`room-chip ${trackStatusFilter === tab.id ? 'active' : ''}`}
                    style={{ border: trackStatusFilter === tab.id ? '1px solid var(--text-primary)' : '1px solid var(--border-medium)', color: trackStatusFilter === tab.id ? '#ffffff' : 'var(--text-primary)', background: trackStatusFilter === tab.id ? 'var(--text-primary)' : '#ffffff', padding: '0.25rem 0.65rem', fontSize: '0.78rem', fontWeight: 700 }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Date:</span>
                <select
                  value={trackDateFilter}
                  onChange={e => setTrackDateFilter(e.target.value as any)}
                  className="form-select"
                  style={{ minHeight: '34px', padding: '0.2rem 0.65rem', fontSize: '0.78rem', width: 'auto' }}
                >
                  <option value="ALL">All Available Dates</option>
                  <option value="TODAY">Today (Aug 12)</option>
                  <option value="UPCOMING">Upcoming Dates (Aug 13 - 18)</option>
                  <option value="PAST">Past & Completed Sessions</option>
                </select>

                <button
                  type="button"
                  onClick={exportRequestsToCSV}
                  className="room-chip"
                  style={{ border: '1px solid var(--border-dark)', color: 'var(--text-primary)', background: '#ffffff', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.65rem' }}
                >
                  <Download size={12} />
                  <span>CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2-Column Track & Stepper View */}
          <div className="return-layout-container">
            {/* Left: Request List */}
            <div className="sidebar-sessions-box">
              <div className="card-header-minimal" style={{ marginBottom: '0.75rem' }}>
                <span className="card-title-minimal" style={{ fontSize: '0.88rem' }}>Requisition Records</span>
                <span className="tab-badge">{trackedRequests.length} Listed</span>
              </div>

              <div className="sidebar-sessions-list">
                {trackedRequests.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted">
                    <FileCheck size={28} className="mx-auto mb-1 opacity-40" />
                    <span>No matching requests found</span>
                  </div>
                ) : (
                  trackedRequests.map(r => {
                    const isSelected = activeTrackRequest?.id === r.id;
                    return (
                      <div
                        key={r.id}
                        onClick={() => setSelectedTrackReqId(r.id)}
                        className={`session-select-item ${isSelected ? 'active' : ''}`}
                      >
                        <div className="session-item-row">
                          <span className="session-item-title">{r.applicant.studentName}</span>
                          <span className="mono font-bold text-xs">#{r.id}</span>
                        </div>

                        <div className="session-item-sub">
                          Studio {r.requestDetails.facilityRoom} • {formatDate(r.requestDetails.date)}
                        </div>

                        <div className="session-item-row mt-1 text-xs">
                          <span>Machines: <strong>{r.requestDetails.machineIds.join(', ')}</strong></span>
                          <span className="font-bold">{r.approval.status}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: Live Stepper & Full Requisition Audit */}
            <div className="form-card-container">
              {!activeTrackRequest ? (
                <div className="p-12 text-center text-muted">
                  <Search size={36} className="mx-auto mb-2 opacity-30 text-slate-900" />
                  <h3 className="font-bold text-sm text-slate-800">Select a Request to Track</h3>
                  <p className="text-xs text-muted mt-1">Choose a student booking to view live progress & return details.</p>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '0.75rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span className="mono font-bold" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {activeTrackRequest.id}
                        </span>
                        <span className="status-pill-subtle pill-green font-bold">
                          {activeTrackRequest.approval.status}
                        </span>
                      </div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                        {activeTrackRequest.applicant.studentName}
                      </h2>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {activeTrackRequest.applicant.semester} • {activeTrackRequest.applicant.classModule}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleDeleteRequest(activeTrackRequest.id)}
                        className="room-chip"
                        style={{ border: '1px solid var(--border-medium)', background: '#ffffff', color: 'var(--text-muted)', padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
                        title="Delete Record"
                      >
                        <Trash2 size={13} style={{ display: 'inline', marginRight: '0.2rem' }} />
                        Delete
                      </button>

                      <button
                        type="button"
                        onClick={() => setActivePassRequest(activeTrackRequest)}
                        className="room-chip"
                        style={{ border: '1px solid var(--text-primary)', background: 'var(--text-primary)', color: '#ffffff', padding: '0.45rem 0.95rem', fontSize: '0.82rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <Ticket size={14} />
                        <span>View Pass</span>
                      </button>
                    </div>
                  </div>

                  {/* Visual 4-Step Progress Stepper */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <span className="detail-label" style={{ marginBottom: '0.65rem' }}>Requisition Progress</span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                      {[
                        { step: 1, label: '1. Submitted', sub: formatDate(activeTrackRequest.requestDetails.date) },
                        { step: 2, label: '2. Lecturer Verified', sub: activeTrackRequest.applicant.lecturer },
                        { step: 3, label: '3. In Studio Usage', sub: `Studio ${activeTrackRequest.requestDetails.facilityRoom}` },
                        { step: 4, label: '4. Returned & Checked', sub: activeTrackRequest.returnInfo ? activeTrackRequest.returnInfo.returnCondition : 'Pending Return' }
                      ].map(s => {
                        const state = getStepState(activeTrackRequest, s.step as any);
                        const isDone = state === 'completed';
                        const isCurr = state === 'current';
                        return (
                          <div
                            key={s.step}
                            style={{
                              background: isDone || isCurr ? 'var(--text-primary)' : 'var(--bg-card-subtle)',
                              color: isDone || isCurr ? '#ffffff' : 'var(--text-muted)',
                              borderRadius: '8px',
                              padding: '0.75rem 0.65rem',
                              border: '1px solid var(--border-light)',
                              textAlign: 'left'
                            }}
                          >
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              {isDone ? <CheckCircle2 size={12} /> : isCurr ? <Clock size={12} /> : null}
                              <span>{s.label}</span>
                            </div>
                            <div style={{ fontSize: '0.68rem', opacity: 0.8, marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {s.sub}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Requisition Details */}
                  <div className="card-header-minimal">
                    <span className="card-title-minimal" style={{ fontSize: '0.85rem' }}>Requisition & Equipment Parameters</span>
                  </div>

                  <div className="detail-card-grid">
                    <div className="detail-item">
                      <span className="detail-label">Facility / Room</span>
                      <span className="detail-value">Studio {activeTrackRequest.requestDetails.facilityRoom}</span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Allocated Machines</span>
                      <div className="flex gap-1.5 mt-0.5">
                        {activeTrackRequest.requestDetails.machineIds.map(mId => (
                          <span key={mId} className="mono text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                            #{mId}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Usage Date & Time Slot</span>
                      <span className="detail-value">
                        {formatDate(activeTrackRequest.requestDetails.date)} ({activeTrackRequest.requestDetails.startTime} - {activeTrackRequest.requestDetails.endTime})
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Allocated Duration</span>
                      <span className="detail-value">{activeTrackRequest.requestDetails.durationHours} Hours</span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Designated Faculty</span>
                      <span className="detail-value">{activeTrackRequest.applicant.lecturer}</span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Student Agreement</span>
                      <span className="detail-value font-bold text-slate-900">✓ Confirmed & Digitally Signed</span>
                    </div>
                  </div>

                  {/* Return Inspection Record (if returned) */}
                  {activeTrackRequest.returnInfo && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-card-subtle)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          ✓ Return Inspection Completed ({activeTrackRequest.returnInfo.returnCondition})
                        </span>
                        <span className="mono text-xs font-bold text-muted">
                          {activeTrackRequest.returnInfo.returnedAt ? formatDate(activeTrackRequest.returnInfo.returnedAt) : '-'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        <strong>Inspector Notes:</strong> "{activeTrackRequest.returnInfo.lecturerNotes}"
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. REPORTS: EACH MACHINE */}
      {activeSubTab === 'MACHINE_REPORTS' && (
        <div className="form-card-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>Machine Telemetry & Notes</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total {machines.length} machines registered across Studios 719, 721, 724</p>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={handleOpenAddMachine}
                className="room-chip"
                style={{ border: '1px solid var(--text-primary)', color: '#ffffff', background: 'var(--text-primary)', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Plus size={12} />
                <span>Add Machine</span>
              </button>

              <button
                type="button"
                onClick={exportMachinesToCSV}
                className="room-chip"
                style={{ border: '1px solid var(--border-dark)', color: 'var(--text-primary)', background: '#ffffff', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Download size={12} />
                <span>Export Machines (.csv)</span>
              </button>
            </div>
          </div>

          <div className="table-responsive-wrapper">
            <table className="minimal-data-table">
              <thead>
                <tr>
                  <th>Machine Code</th>
                  <th>Type</th>
                  <th>Room</th>
                  <th>Status</th>
                  <th>Usage Hours</th>
                  <th>Feedback & Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {machines.map(m => (
                  <tr key={m.id}>
                    <td className="mono font-bold">#{m.code}</td>
                    <td>{m.type === 'SEWING' ? 'Sewing Machine' : m.type === 'OVERLOCKING' ? 'Overlocking Machine' : m.type}</td>
                    <td className="font-semibold">Room {m.room}</td>
                    <td>
                      <span className={`status-pill-subtle ${m.status === 'AVAILABLE' ? 'pill-green' : m.status === 'IN_USE' ? 'pill-amber' : 'pill-rose'}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="text-xs">{m.totalUsageHours} hrs</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '240px' }}>
                      "{m.notes || 'In standard working order.'}"
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditMachine(m)}
                          className="room-chip"
                          style={{ border: '1px solid var(--border-medium)', color: 'var(--text-primary)', background: '#ffffff', fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                          title="Edit Machine Details"
                        >
                          <Edit3 size={11} style={{ display: 'inline', marginRight: '0.2rem' }} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMachine(m)}
                          className="room-chip"
                          style={{ border: '1px solid var(--border-medium)', color: 'var(--text-secondary)', background: '#ffffff', fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                          title="Delete Machine from Fleet"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. REPORTS: STUDENTS REQUEST */}
      {activeSubTab === 'STUDENT_REPORTS' && (
        <div className="form-card-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>Student Requisition & Compliance Log</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Summary of applicant history and completed returns</p>
            </div>

            <button
              type="button"
              onClick={exportStudentSummaryToCSV}
              className="room-chip"
              style={{ border: '1px solid var(--border-dark)', color: 'var(--text-primary)', background: '#ffffff', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <Download size={12} />
              <span>Export Summary (.csv)</span>
            </button>
          </div>

          <div className="table-responsive-wrapper">
            <table className="minimal-data-table">
              <thead>
                <tr>
                  <th>Student's Name</th>
                  <th>Semester</th>
                  <th>Class / Module</th>
                  <th>Total Bookings</th>
                  <th>Completed Returns</th>
                  <th>Pending Requests</th>
                  <th>Compliance Status</th>
                </tr>
              </thead>
              <tbody>
                {studentTrackList.map(st => (
                  <tr key={st.studentId}>
                    <td className="font-bold">{st.name}</td>
                    <td>{st.semester}</td>
                    <td style={{ fontSize: '0.8rem' }}>{st.classModule}</td>
                    <td className="font-semibold">{st.totalBookings}</td>
                    <td className="font-bold">{st.completedReturns}</td>
                    <td className="font-semibold text-slate-600">{st.pendingBookings}</td>
                    <td>
                      <span className="status-pill-subtle pill-green">
                        Verified Student
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. MANAGE & INVENTORY SETTINGS */}
      {activeSubTab === 'MANAGE' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {/* Manage Machines Card */}
          <div className="form-card-container">
            <div className="card-header-minimal">
              <div className="card-title-minimal">
                <Cpu size={15} />
                <span>Machines Inventory ({machines.length})</span>
              </div>
              <button
                type="button"
                onClick={handleOpenAddMachine}
                className="room-chip"
                style={{ border: '1px solid var(--text-primary)', background: 'var(--text-primary)', color: '#ffffff', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Plus size={12} />
                <span>Add Machine</span>
              </button>
            </div>

            <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {machines.map(m => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', background: 'var(--bg-card-subtle)', borderRadius: '6px', fontSize: '0.85rem' }}>
                  <div>
                    <span className="mono font-bold">#{m.code}</span>
                    <span className="text-muted ml-2">Studio {m.room}</span>
                    <span className="text-muted ml-2">({m.type})</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEditMachine(m)}
                      className="room-chip"
                      style={{ border: '1px solid var(--border-medium)', background: '#ffffff', padding: '0.2rem 0.45rem', fontSize: '0.72rem' }}
                      title="Edit Machine"
                    >
                      <Edit3 size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMachine(m)}
                      className="room-chip"
                      style={{ border: '1px solid var(--border-medium)', background: '#ffffff', padding: '0.2rem 0.45rem', fontSize: '0.72rem' }}
                      title="Delete Machine"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Manage Lecturers Card */}
          <div className="form-card-container">
            <div className="card-header-minimal">
              <div className="card-title-minimal">
                <UserPlus size={15} />
                <span>Faculty Directory ({lecturers.length})</span>
              </div>
              <button
                type="button"
                onClick={handleOpenAddLecturer}
                className="room-chip"
                style={{ border: '1px solid var(--text-primary)', background: 'var(--text-primary)', color: '#ffffff', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Plus size={12} />
                <span>Add Lecturer</span>
              </button>
            </div>

            <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {lecturers.map(l => (
                <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', background: 'var(--bg-card-subtle)', borderRadius: '6px', fontSize: '0.85rem' }}>
                  <div>
                    <span className="font-bold text-slate-900">{l.name}</span>
                    <div className="text-xs text-muted">{l.department}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEditLecturer(l)}
                      className="room-chip"
                      style={{ border: '1px solid var(--border-medium)', background: '#ffffff', padding: '0.2rem 0.45rem', fontSize: '0.72rem' }}
                      title="Edit Lecturer"
                    >
                      <Edit3 size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteLecturer(l)}
                      className="room-chip"
                      style={{ border: '1px solid var(--border-medium)', background: '#ffffff', padding: '0.2rem 0.45rem', fontSize: '0.72rem' }}
                      title="Delete Lecturer"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Manage Modules Card */}
          <div className="form-card-container">
            <div className="card-header-minimal">
              <div className="card-title-minimal">
                <BookPlus size={15} />
                <span>Class & Modules ({modules.length})</span>
              </div>
              <button
                type="button"
                onClick={handleOpenAddModule}
                className="room-chip"
                style={{ border: '1px solid var(--text-primary)', background: 'var(--text-primary)', color: '#ffffff', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Plus size={12} />
                <span>Add Module</span>
              </button>
            </div>

            <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {modules.map(mod => (
                <div key={mod} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', background: 'var(--bg-card-subtle)', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
                  <span>{mod}</span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModule(mod)}
                      className="room-chip"
                      style={{ border: '1px solid var(--border-medium)', background: '#ffffff', padding: '0.2rem 0.45rem', fontSize: '0.72rem' }}
                      title="Edit Module"
                    >
                      <Edit3 size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteModule(mod)}
                      className="room-chip"
                      style={{ border: '1px solid var(--border-medium)', background: '#ffffff', padding: '0.2rem 0.45rem', fontSize: '0.72rem' }}
                      title="Delete Module"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD / EDIT MACHINE
         ======================================================== */}
      {showMachineModal && (
        <div className="clean-modal-backdrop" onClick={() => setShowMachineModal(false)}>
          <div className="clean-modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="clean-modal-header">
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {editingMachine ? `Edit Machine #${editingMachine.code}` : 'Add New Studio Machine'}
              </h3>
              <button type="button" onClick={() => setShowMachineModal(false)} className="btn-close">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveMachine} style={{ padding: '1.25rem' }}>
              <div className="grid-2">
                <div className="form-field">
                  <label className="field-label">
                    Machine Code / Number <span className="required-dot">*</span>
                  </label>
                  <input
                    type="text"
                    value={machineFormCode}
                    onChange={e => setMachineFormCode(e.target.value)}
                    placeholder="e.g. 2417 or 2103"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">
                    Machine Type <span className="required-dot">*</span>
                  </label>
                  <select
                    value={machineFormType}
                    onChange={e => setMachineFormType(e.target.value as any)}
                    className="form-select"
                  >
                    <option value="SEWING">Sewing Machine</option>
                    <option value="OVERLOCKING">Overlocking Machine</option>
                    <option value="CUSTOM">Specialty / Custom</option>
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-field">
                  <label className="field-label">
                    Assigned Studio Room <span className="required-dot">*</span>
                  </label>
                  <select
                    value={machineFormRoom}
                    onChange={e => setMachineFormRoom(e.target.value as any)}
                    className="form-select"
                  >
                    <option value="719">Studio 719</option>
                    <option value="721">Studio 721</option>
                    <option value="724">Studio 724</option>
                  </select>
                </div>

                <div className="form-field">
                  <label className="field-label">Current Status</label>
                  <select
                    value={machineFormStatus}
                    onChange={e => setMachineFormStatus(e.target.value as any)}
                    className="form-select"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="IN_USE">In Use</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">Model / Manufacturer</label>
                <input
                  type="text"
                  value={machineFormModel}
                  onChange={e => setMachineFormModel(e.target.value)}
                  placeholder="e.g. Juki DDL-8700 Industrial"
                  className="form-input"
                />
              </div>

              <div className="form-field">
                <label className="field-label">Notes & Setup Info</label>
                <textarea
                  value={machineFormNotes}
                  onChange={e => setMachineFormNotes(e.target.value)}
                  placeholder="e.g. Teflon foot installed, standard bobbin case."
                  rows={2}
                  className="form-textarea"
                />
              </div>

              <div className="clean-modal-footer" style={{ margin: '1.25rem -1.25rem -1.25rem -1.25rem' }}>
                <button type="button" onClick={() => setShowMachineModal(false)} className="btn-action-reject">
                  Cancel
                </button>
                <button type="submit" className="btn-action-approve">
                  {editingMachine ? 'Save Changes' : 'Add Machine to Fleet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD / EDIT LECTURER
         ======================================================== */}
      {showLecturerModal && (
        <div className="clean-modal-backdrop" onClick={() => setShowLecturerModal(false)}>
          <div className="clean-modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="clean-modal-header">
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {editingLecturer ? `Edit Faculty: ${editingLecturer.name}` : 'Add Faculty Member'}
              </h3>
              <button type="button" onClick={() => setShowLecturerModal(false)} className="btn-close">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveLecturer} style={{ padding: '1.25rem' }}>
              <div className="form-field">
                <label className="field-label">
                  Faculty Name <span className="required-dot">*</span>
                </label>
                <input
                  type="text"
                  value={lecturerFormName}
                  onChange={e => setLecturerFormName(e.target.value)}
                  placeholder="e.g. Prof. Samantha Reed"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-field">
                <label className="field-label">Email Address</label>
                <input
                  type="email"
                  value={lecturerFormEmail}
                  onChange={e => setLecturerFormEmail(e.target.value)}
                  placeholder="e.g. s.reed@fashion-institute.edu"
                  className="form-input"
                />
              </div>

              <div className="form-field">
                <label className="field-label">Department / Discipline</label>
                <input
                  type="text"
                  value={lecturerFormDept}
                  onChange={e => setLecturerFormDept(e.target.value)}
                  placeholder="e.g. Textile & Apparel Design"
                  className="form-input"
                />
              </div>

              <div className="clean-modal-footer" style={{ margin: '1.25rem -1.25rem -1.25rem -1.25rem' }}>
                <button type="button" onClick={() => setShowLecturerModal(false)} className="btn-action-reject">
                  Cancel
                </button>
                <button type="submit" className="btn-action-approve">
                  {editingLecturer ? 'Save Changes' : 'Save Faculty Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD / EDIT MODULE
         ======================================================== */}
      {showModuleModal && (
        <div className="clean-modal-backdrop" onClick={() => setShowModuleModal(false)}>
          <div className="clean-modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="clean-modal-header">
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {editingModuleOldName ? 'Edit Class / Module' : 'Add Class / Module'}
              </h3>
              <button type="button" onClick={() => setShowModuleModal(false)} className="btn-close">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveModule} style={{ padding: '1.25rem' }}>
              <div className="form-field">
                <label className="field-label">
                  Module Code & Title <span className="required-dot">*</span>
                </label>
                <input
                  type="text"
                  value={moduleFormName}
                  onChange={e => setModuleFormName(e.target.value)}
                  placeholder="e.g. FD305 - Tailoring Workshop"
                  className="form-input"
                  required
                />
              </div>

              <div className="clean-modal-footer" style={{ margin: '1.25rem -1.25rem -1.25rem -1.25rem' }}>
                <button type="button" onClick={() => setShowModuleModal(false)} className="btn-action-reject">
                  Cancel
                </button>
                <button type="submit" className="btn-action-approve">
                  {editingModuleOldName ? 'Save Changes' : 'Add to Curriculum'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: APPROVE / REJECT APPLICATION
         ======================================================== */}
      {modalRequest && (
        <div className="clean-modal-backdrop" onClick={() => setModalRequest(null)}>
          <div className="clean-modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="clean-modal-header">
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {actionType === 'APPROVE' ? 'Approve Student Application' : 'Reject Student Application'}
              </h3>
              <button type="button" onClick={() => setModalRequest(null)} className="btn-close">
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '1.25rem' }}>
              <div className="detail-card-grid" style={{ marginBottom: '1rem' }}>
                <div className="detail-item">
                  <span className="detail-label">Student</span>
                  <span className="detail-value">{modalRequest.applicant.studentName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Room & Machines</span>
                  <span className="detail-value">Room {modalRequest.requestDetails.facilityRoom} (#{modalRequest.requestDetails.machineIds.join(', ')})</span>
                </div>
              </div>

              {actionType === 'APPROVE' ? (
                <>
                  <div className="form-field">
                    <label className="field-label">Lecturer Approval Note</label>
                    <textarea
                      value={feedbackNote}
                      onChange={e => setFeedbackNote(e.target.value)}
                      rows={2}
                      className="form-textarea"
                    />
                  </div>

                  <div className="signature-wrapper">
                    <SignaturePad
                      label="Lecturer Approval Signature"
                      required
                      onSave={sig => setLecturerSig(sig)}
                    />
                  </div>
                </>
              ) : (
                <div className="form-field">
                  <label className="field-label">Reason for Rejection <span className="required-dot">*</span></label>
                  <textarea
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    rows={3}
                    className="form-textarea"
                    required
                  />
                </div>
              )}
            </div>

            <div className="clean-modal-footer">
              <button type="button" onClick={() => setModalRequest(null)} className="btn-action-reject">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className={actionType === 'APPROVE' ? 'btn-action-approve' : 'btn-action-reject'}
              >
                {actionType === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
