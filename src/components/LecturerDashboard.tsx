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
  Edit3
} from 'lucide-react';
import { formatDate, getStatusBadge } from '../utils/helpers';
import { SignaturePad } from './SignaturePad';

export const LecturerDashboard: React.FC = () => {
  const { 
    requests, 
    lecturers, 
    machines, 
    approveRequest, 
    rejectRequest, 
    updateMachineStatus,
    showToast 
  } = useLab();

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

  return (
    <div className="main-content-area wide">
      {/* Intro Header */}
      <div className="page-intro flex justify-between items-start flex-wrap gap-3">
        <div>
          <span className="page-intro-badge">LECTURER</span>
          <h1 className="page-intro-title">Lecturer Portal & Verification Hub</h1>
          <p className="page-intro-desc">Review student applications, maintain machine logs, and track compliance</p>
        </div>

        {/* Lecturer Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted">Filter:</span>
          <select
            value={selectedLecturer}
            onChange={e => setSelectedLecturer(e.target.value)}
            className="form-select text-xs py-1"
            style={{ minHeight: '34px', width: 'auto' }}
          >
            <option value="ALL">All Lecturers</option>
            {lecturers.map(l => (
              <option key={l.id} value={l.name}>{l.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="lecturer-subnav-bar">
        <button
          type="button"
          className={`subnav-pill-btn ${activeSubTab === 'VERIFY' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('VERIFY')}
        >
          <Clock size={14} />
          <span>Verifying Applications ({pendingRequests.length})</span>
        </button>

        <button
          type="button"
          className={`subnav-pill-btn ${activeSubTab === 'MACHINE_REPORTS' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('MACHINE_REPORTS')}
        >
          <Layers size={14} />
          <span>Reports: Each Machine</span>
        </button>

        <button
          type="button"
          className={`subnav-pill-btn ${activeSubTab === 'STUDENT_REPORTS' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('STUDENT_REPORTS')}
        >
          <Award size={14} />
          <span>Reports: Students Request</span>
        </button>

        <button
          type="button"
          className={`subnav-pill-btn ${activeSubTab === 'HISTORY' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('HISTORY')}
        >
          <FileText size={14} />
          <span>Track History</span>
        </button>
      </div>

      {/* 1. VERIFYING APPLICATIONS */}
      {activeSubTab === 'VERIFY' && (
        <div>
          {pendingRequests.length === 0 ? (
            <div className="form-card-container text-center py-10">
              <ShieldCheck size={36} className="text-emerald-600 mx-auto mb-2" />
              <h3 className="font-bold text-sm text-slate-800">All Applications Verified</h3>
              <p className="text-xs text-muted">There are currently no pending student equipment requests requiring sign-off.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map(req => (
                <div key={req.id} className="form-card-container p-4 flex flex-col justify-between" style={{ padding: '1.25rem' }}>
                  <div>
                    <div className="flex justify-between items-start pb-2 mb-2 border-b border-slate-100">
                      <div>
                        <span className="text-xs mono text-muted">{req.id}</span>
                        <h3 className="font-bold text-sm text-slate-900">{req.applicant.studentName}</h3>
                        <div className="text-xs text-muted">{req.applicant.semester} • {req.applicant.classModule}</div>
                      </div>
                      <span className="status-badge-chip badge-amber">PENDING</span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600 mb-3">
                      <div className="flex justify-between">
                        <span className="text-muted">Facility / Room:</span>
                        <span className="font-bold text-slate-900">Room {req.requestDetails.facilityRoom}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Usage Date & Slot:</span>
                        <span className="font-semibold">{formatDate(req.requestDetails.date)} ({req.requestDetails.startTime} - {req.requestDetails.endTime})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Machines:</span>
                        <span className="font-bold">{req.requestDetails.machineIds.join(', ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Agreement:</span>
                        <span className="text-emerald-700 font-semibold">✓ Confirmed & Signed</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleOpenAction(req, 'REJECT')}
                      className="btn-sm-reject"
                    >
                      <X size={13} />
                      <span>Reject</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenAction(req, 'APPROVE')}
                      className="btn-sm-approve"
                    >
                      <Check size={13} />
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
          <div className="mb-3 pb-2 border-b border-slate-200">
            <h3 className="font-bold text-sm text-slate-900">Each Machine: Status, Usage & Reports</h3>
            <p className="text-xs text-muted">Sewing Machines (2401–2416) and Overlocking Machines (2101–2102) across Rooms 719, 721, 724</p>
          </div>

          <div className="clean-table-responsive">
            <table className="clean-data-table">
              <thead>
                <tr>
                  <th>Machine Code</th>
                  <th>Machine Type</th>
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
                      <span className={`status-badge-chip ${m.status === 'AVAILABLE' ? 'badge-green' : m.status === 'IN_USE' ? 'badge-amber' : 'badge-rose'}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="text-xs">{m.totalUsageHours} hrs</td>
                    <td className="text-xs text-slate-600 max-w-xs">
                      {editingMachineId === m.id ? (
                        <input
                          type="text"
                          value={machineNoteText}
                          onChange={e => setMachineNoteText(e.target.value)}
                          className="form-input text-xs py-1"
                          style={{ minHeight: '32px' }}
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
                          className="btn-sm-approve text-xs"
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
                          style={{ border: '1px solid #e2e8f0', color: '#09090b', background: '#f8fafc', fontSize: '0.72rem' }}
                        >
                          <Edit3 size={11} className="inline mr-1" />
                          Edit Note
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
          <div className="mb-3 pb-2 border-b border-slate-200">
            <h3 className="font-bold text-sm text-slate-900">Students Request: Compliance & Activity</h3>
            <p className="text-xs text-muted">Summary of student applications, completed returns, and compliance standing</p>
          </div>

          <div className="clean-table-responsive">
            <table className="clean-data-table">
              <thead>
                <tr>
                  <th>Student's Name</th>
                  <th>Semester</th>
                  <th>Class / Module</th>
                  <th>Total Bookings</th>
                  <th>Completed Returns</th>
                  <th>Pending Requests</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {studentTrackList.map(st => (
                  <tr key={st.studentId}>
                    <td className="font-bold text-slate-900">{st.name}</td>
                    <td>{st.semester}</td>
                    <td className="text-xs">{st.classModule}</td>
                    <td className="font-semibold">{st.totalBookings}</td>
                    <td className="text-emerald-700 font-semibold">{st.completedReturns}</td>
                    <td className="text-amber-700 font-semibold">{st.pendingBookings}</td>
                    <td>
                      <span className="status-badge-chip badge-green">
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
          <div className="mb-3 pb-2 border-b border-slate-200">
            <h3 className="font-bold text-sm text-slate-900">Track History</h3>
            <p className="text-xs text-muted">Chronological audit log of all facility requests, returns, and approvals</p>
          </div>

          <div className="clean-table-responsive">
            <table className="clean-data-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Student's Name</th>
                  <th>Room</th>
                  <th>Machine Types & Code</th>
                  <th>Date & Time Usage</th>
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
                      <td className="text-xs">
                        {formatDate(r.requestDetails.date)} ({r.requestDetails.startTime} - {r.requestDetails.endTime})
                      </td>
                      <td>
                        <span className={`status-badge-chip ${badge.bgClass} ${badge.colorClass}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="text-xs">
                        {r.returnInfo ? (
                          <span className="text-emerald-700 font-bold">
                            ✓ Returned ({r.returnInfo.returnCondition})
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
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
              <h3 className="font-bold text-sm text-slate-900">
                {actionType === 'APPROVE' ? 'Approve Student Application' : 'Reject Student Application'}
              </h3>
              <button type="button" onClick={() => setModalRequest(null)} className="btn-close">
                <X size={16} />
              </button>
            </div>

            <div className="p-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md mb-3 text-xs">
                <div className="font-bold text-slate-900">{modalRequest.applicant.studentName}</div>
                <div className="text-muted">
                  Room {modalRequest.requestDetails.facilityRoom} • Machines: {modalRequest.requestDetails.machineIds.join(', ')} • {formatDate(modalRequest.requestDetails.date)}
                </div>
              </div>

              {actionType === 'APPROVE' ? (
                <>
                  <div className="form-field">
                    <label className="field-label">
                      <span className="field-label-text">Lecturer Feedback / Approval Note</span>
                    </label>
                    <textarea
                      value={feedbackNote}
                      onChange={e => setFeedbackNote(e.target.value)}
                      rows={2}
                      className="form-textarea"
                    />
                  </div>

                  <div className="signature-card">
                    <SignaturePad
                      label="Lecturer Approval Signature"
                      required
                      onSave={sig => setLecturerSig(sig)}
                    />
                  </div>
                </>
              ) : (
                <div className="form-field">
                  <label className="field-label">
                    <span className="field-label-text">Reason for Rejection <span className="required-dot">*</span></span>
                  </label>
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
              <button type="button" onClick={() => setModalRequest(null)} className="room-chip" style={{ border: '1px solid #e2e8f0', color: '#334155', background: '#ffffff', padding: '0.4rem 0.85rem' }}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className={actionType === 'APPROVE' ? 'btn-sm-approve' : 'btn-sm-reject'}
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
