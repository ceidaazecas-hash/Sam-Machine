import React, { useState } from 'react';
import { useLab } from '../context/LabContext';
import type { BookingRequest, Machine } from '../types/lab';
import { 
  Check, 
  X, 
  Clock, 
  Layers, 
  Award, 
  FileText, 
  ShieldCheck, 
  Edit3,
  Lock,
  Unlock,
  KeyRound,
  LogOut,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { formatDate, getStatusBadge } from '../utils/helpers';
import { SignaturePad } from './SignaturePad';

const LECTURER_PASSCODE = 'SamSam22';

export const LecturerDashboard: React.FC = () => {
  const { 
    requests, 
    lecturers, 
    machines, 
    approveRequest, 
    rejectRequest, 
    updateMachineStatus,
    setActiveTab,
    showToast 
  } = useLab();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('lecturer_authenticated') === 'true';
  });
  const [enteredPasscode, setEnteredPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const [activeSubTab, setActiveSubTab] = useState<'VERIFY' | 'MACHINE_REPORTS' | 'STUDENT_REPORTS' | 'HISTORY'>('VERIFY');
  const [selectedLecturer, setSelectedLecturer] = useState<string>('ALL');

  // Modal for Approve / Reject
  const [modalRequest, setModalRequest] = useState<BookingRequest | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [feedbackNote, setFeedbackNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [lecturerSig, setLecturerSig] = useState('');

  // Machine note editing state
  const [editingMachineId, setEditingMachineId] = useState<string | null>(null);
  const [machineNoteText, setMachineNoteText] = useState('');

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

  const handleSaveMachineNote = (m: Machine) => {
    updateMachineStatus(m.id, m.status, machineNoteText);
    setEditingMachineId(null);
    setMachineNoteText('');
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
              <div style={{ padding: '0.65rem', background: 'var(--accent-rose-bg)', border: '1px solid #fecdd3', color: '#be123c', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', marginBottom: '0.85rem' }}>
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

        {/* Right Controls: Filter & Lock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Filter:</span>
            <select
              value={selectedLecturer}
              onChange={e => setSelectedLecturer(e.target.value)}
              className="form-select"
              style={{ minHeight: '30px', padding: '0.2rem 0.5rem', fontSize: '0.75rem', width: 'auto' }}
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
            style={{ border: '1px solid #fecdd3', color: '#be123c', background: '#fff1f2', padding: '0.25rem 0.65rem', fontSize: '0.72rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
            title="Lock Lecturer Portal"
          >
            <LogOut size={12} />
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
          <Clock size={13} />
          <span>Verifying Applications ({pendingRequests.length})</span>
        </button>

        <button
          type="button"
          className={`subnav-btn-minimal ${activeSubTab === 'MACHINE_REPORTS' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('MACHINE_REPORTS')}
        >
          <Layers size={13} />
          <span>Reports: Each Machine</span>
        </button>

        <button
          type="button"
          className={`subnav-btn-minimal ${activeSubTab === 'STUDENT_REPORTS' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('STUDENT_REPORTS')}
        >
          <Award size={13} />
          <span>Reports: Students Request</span>
        </button>

        <button
          type="button"
          className={`subnav-btn-minimal ${activeSubTab === 'HISTORY' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('HISTORY')}
        >
          <FileText size={13} />
          <span>Track History</span>
        </button>
      </div>

      {/* 1. VERIFYING APPLICATIONS */}
      {activeSubTab === 'VERIFY' && (
        <div>
          {pendingRequests.length === 0 ? (
            <div className="form-card-container text-center py-8">
              <ShieldCheck size={32} className="mx-auto mb-2 text-emerald-600 opacity-60" />
              <h3 className="font-bold text-sm text-slate-800">All Applications Verified</h3>
              <p className="text-xs text-muted mt-0.5">There are currently no pending student equipment requests requiring review.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
              {pendingRequests.map(req => (
                <div key={req.id} className="form-card-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '0.5rem', marginBottom: '0.65rem', borderBottom: '1px solid var(--border-light)' }}>
                      <div>
                        <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{req.id}</span>
                        <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>{req.applicant.studentName}</h3>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{req.applicant.semester} • {req.applicant.classModule}</div>
                      </div>
                      <span className="status-pill-subtle pill-amber">PENDING</span>
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

                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid var(--border-light)' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenAction(req, 'REJECT')}
                      className="btn-action-reject"
                    >
                      <X size={12} />
                      <span>Reject</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenAction(req, 'APPROVE')}
                      className="btn-action-approve"
                    >
                      <Check size={12} />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. REPORTS: EACH MACHINE */}
      {activeSubTab === 'MACHINE_REPORTS' && (
        <div className="form-card-container">
          <div style={{ marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Machine Telemetry & Notes</h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sewing Machines (2401–2416) & Overlocking Machines (2101–2102) in Rooms 719, 721, 724</p>
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
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {machines.map(m => (
                  <tr key={m.id}>
                    <td className="mono font-bold">#{m.code}</td>
                    <td>{m.type === 'SEWING' ? 'Sewing Machine' : 'Overlocking Machine'}</td>
                    <td className="font-semibold">Room {m.room}</td>
                    <td>
                      <span className={`status-pill-subtle ${m.status === 'AVAILABLE' ? 'pill-green' : m.status === 'IN_USE' ? 'pill-amber' : 'pill-rose'}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="text-xs">{m.totalUsageHours} hrs</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '280px' }}>
                      {editingMachineId === m.id ? (
                        <input
                          type="text"
                          value={machineNoteText}
                          onChange={e => setMachineNoteText(e.target.value)}
                          className="form-input"
                          style={{ minHeight: '28px', padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                        />
                      ) : (
                        <span>"{m.notes || 'In standard working order.'}"</span>
                      )}
                    </td>
                    <td>
                      {editingMachineId === m.id ? (
                        <button
                          type="button"
                          onClick={() => handleSaveMachineNote(m)}
                          className="btn-action-approve"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMachineId(m.id);
                            setMachineNoteText(m.notes || '');
                          }}
                          className="room-chip"
                          style={{ border: '1px solid var(--border-light)', color: 'var(--text-primary)', background: 'var(--bg-card-subtle)', fontSize: '0.7rem' }}
                        >
                          <Edit3 size={10} style={{ display: 'inline', marginRight: '0.2rem' }} />
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. REPORTS: STUDENTS REQUEST */}
      {activeSubTab === 'STUDENT_REPORTS' && (
        <div className="form-card-container">
          <div style={{ marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Student Requisition & Compliance Log</h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Summary of applicant history and completed returns</p>
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
                    <td style={{ fontSize: '0.75rem' }}>{st.classModule}</td>
                    <td className="font-semibold">{st.totalBookings}</td>
                    <td style={{ color: '#059669', fontWeight: 600 }}>{st.completedReturns}</td>
                    <td style={{ color: '#d97706', fontWeight: 600 }}>{st.pendingBookings}</td>
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

      {/* 4. TRACK HISTORY */}
      {activeSubTab === 'HISTORY' && (
        <div className="form-card-container">
          <div style={{ marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Full Activity Audit Log</h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Chronological record of all equipment allocations and returns</p>
          </div>

          <div className="table-responsive-wrapper">
            <table className="minimal-data-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Student's Name</th>
                  <th>Room</th>
                  <th>Machines</th>
                  <th>Date & Time</th>
                  <th>Approval Status</th>
                  <th>Return Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(r => {
                  const badge = getStatusBadge(r.approval.status);
                  return (
                    <tr key={r.id}>
                      <td className="mono font-bold text-xs">{r.id}</td>
                      <td className="font-semibold">{r.applicant.studentName}</td>
                      <td>Room {r.requestDetails.facilityRoom}</td>
                      <td>{r.requestDetails.machineIds.join(', ')}</td>
                      <td style={{ fontSize: '0.75rem' }}>
                        {formatDate(r.requestDetails.date)} ({r.requestDetails.startTime} - {r.requestDetails.endTime})
                      </td>
                      <td>
                        <span className={`status-pill-subtle ${badge.bgClass} ${badge.colorClass}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.75rem' }}>
                        {r.returnInfo ? (
                          <span style={{ color: '#059669', fontWeight: 600 }}>
                            ✓ Returned ({r.returnInfo.returnCondition})
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-light)' }}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approve / Reject Modal */}
      {modalRequest && (
        <div className="clean-modal-backdrop" onClick={() => setModalRequest(null)}>
          <div className="clean-modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="clean-modal-header">
              <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {actionType === 'APPROVE' ? 'Approve Student Application' : 'Reject Student Application'}
              </h3>
              <button type="button" onClick={() => setModalRequest(null)} className="btn-close">
                <X size={15} />
              </button>
            </div>

            <div style={{ padding: '1rem' }}>
              <div className="detail-card-grid" style={{ marginBottom: '0.85rem' }}>
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
              <button type="button" onClick={() => setModalRequest(null)} className="room-chip" style={{ border: '1px solid var(--border-light)', padding: '0.35rem 0.75rem' }}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className={actionType === 'APPROVE' ? 'btn-action-approve' : 'btn-action-reject'}
                style={{ padding: '0.4rem 0.9rem', fontSize: '0.78rem' }}
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
