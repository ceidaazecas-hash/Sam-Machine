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
    <div className="simple-section-container">
      {/* Header Banner */}
      <div className="section-title-card">
        <div>
          <div className="section-badge">LECTURER</div>
          <h1 className="section-heading">Lecturer Management & Verification Portal</h1>
          <p className="section-subheading">Verify student applications, manage machine reports, and track history</p>
        </div>

        {/* Lecturer Filter */}
        <div className="lecturer-filter-select-box">
          <span className="text-xs font-bold text-muted mr-2">Lecturer:</span>
          <select
            value={selectedLecturer}
            onChange={e => setSelectedLecturer(e.target.value)}
            className="clean-select font-semibold text-xs py-1"
          >
            <option value="ALL">All Lecturers</option>
            {lecturers.map(l => (
              <option key={l.id} value={l.name}>{l.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub Tabs (Directly matching the 4 bullet points under LECTURER) */}
      <div className="lecturer-tabs-bar">
        <button
          type="button"
          className={`subtab-pill ${activeSubTab === 'VERIFY' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('VERIFY')}
        >
          <Clock size={15} />
          <span>Verifying Applications ({pendingRequests.length})</span>
        </button>

        <button
          type="button"
          className={`subtab-pill ${activeSubTab === 'MACHINE_REPORTS' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('MACHINE_REPORTS')}
        >
          <Layers size={15} />
          <span>Reports & Notes: Each Machine</span>
        </button>

        <button
          type="button"
          className={`subtab-pill ${activeSubTab === 'STUDENT_REPORTS' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('STUDENT_REPORTS')}
        >
          <Award size={15} />
          <span>Reports & Notes: Students Request</span>
        </button>

        <button
          type="button"
          className={`subtab-pill ${activeSubTab === 'HISTORY' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('HISTORY')}
        >
          <FileText size={15} />
          <span>Track History</span>
        </button>
      </div>

      {/* 1. VERIFYING THE APPLICANT'S APPLICATION */}
      {activeSubTab === 'VERIFY' && (
        <div className="lecturer-view-content">
          {pendingRequests.length === 0 ? (
            <div className="clean-form-card text-center py-10">
              <ShieldCheck size={40} className="text-emerald-600 mx-auto opacity-70" />
              <h3 className="font-bold text-base mt-2">No Pending Applications</h3>
              <p className="text-xs text-muted">All student equipment requests have been verified.</p>
            </div>
          ) : (
            <div className="pending-grid">
              {pendingRequests.map(req => (
                <div key={req.id} className="clean-form-card pending-card">
                  <div className="flex justify-between items-start border-b pb-2 mb-3">
                    <div>
                      <span className="text-xs text-muted mono">{req.id}</span>
                      <h3 className="font-bold text-base">{req.applicant.studentName}</h3>
                      <div className="text-xs text-muted">{req.applicant.semester} • {req.applicant.classModule}</div>
                    </div>
                    <span className="status-pill-amber">Pending Approval</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-secondary mb-4">
                    <div className="flex justify-between">
                      <span className="text-muted">Facility / Room:</span>
                      <span className="font-bold text-black">Room {req.requestDetails.facilityRoom}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted">Date & Time usage:</span>
                      <span className="font-semibold">
                        {formatDate(req.requestDetails.date)} ({req.requestDetails.startTime} - {req.requestDetails.endTime})
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted">Machine types & Code:</span>
                      <span className="font-bold">{req.requestDetails.machineIds.join(', ')}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted">Verified by Lecturer:</span>
                      <span className="font-semibold">{req.applicant.lecturer}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted">Student's Agreement:</span>
                      <span className="text-emerald-600 font-semibold">✓ Confirmed & Signed</span>
                    </div>
                  </div>

                  {/* Actions: Approve / Reject */}
                  <div className="flex gap-2 justify-end pt-2 border-t">
                    <button
                      type="button"
                      onClick={() => handleOpenAction(req, 'REJECT')}
                      className="btn-danger-sm"
                    >
                      <X size={14} />
                      <span>Reject</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenAction(req, 'APPROVE')}
                      className="btn-success-sm"
                    >
                      <Check size={14} />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. REPORTS AND FEEDBACK/NOTES: EACH MACHINE */}
      {activeSubTab === 'MACHINE_REPORTS' && (
        <div className="clean-form-card">
          <div className="border-b pb-3 mb-4">
            <h3 className="font-bold text-base">Each Machine: Reports & Feedback / Notes</h3>
            <p className="text-xs text-muted">Sewing Machines (2401–2416) & Overlocking Machines (2101–2102) across Rooms 719, 721, 724</p>
          </div>

          <div className="table-responsive">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>Machine Code</th>
                  <th>Machine Type</th>
                  <th>Room</th>
                  <th>Status</th>
                  <th>Total Usage</th>
                  <th>Feedback / Notes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {machines.map(m => (
                  <tr key={m.id}>
                    <td className="font-bold mono">#{m.code}</td>
                    <td>{m.type === 'SEWING' ? 'Sewing Machine' : 'Overlocking Machine'}</td>
                    <td className="font-semibold">Room {m.room}</td>
                    <td>
                      <span className={`status-pill ${m.status === 'AVAILABLE' ? 'status-avail' : m.status === 'IN_USE' ? 'status-inuse' : 'status-maint'}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="text-xs">{m.totalUsageHours} hrs</td>
                    <td className="text-xs text-secondary max-w-xs">
                      {editingMachineId === m.id ? (
                        <input
                          type="text"
                          value={machineNoteText}
                          onChange={e => setMachineNoteText(e.target.value)}
                          className="clean-input text-xs py-1"
                          placeholder="Type report or note..."
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
                          className="btn-success-sm text-xs py-0.5 px-2"
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
                          className="btn-card-action text-xs"
                        >
                          <Edit3 size={12} />
                          <span>Edit Note</span>
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

      {/* 3. REPORTS AND FEEDBACK/NOTES: STUDENTS REQUEST */}
      {activeSubTab === 'STUDENT_REPORTS' && (
        <div className="clean-form-card">
          <div className="border-b pb-3 mb-4">
            <h3 className="font-bold text-base">Students Request: Compliance & History Reports</h3>
            <p className="text-xs text-muted">Summary of student applications, completed returns, and compliance status</p>
          </div>

          <div className="table-responsive">
            <table className="clean-table">
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
                    <td className="font-bold">{st.name}</td>
                    <td>{st.semester}</td>
                    <td className="text-xs">{st.classModule}</td>
                    <td className="font-semibold">{st.totalBookings}</td>
                    <td className="text-emerald-700 font-semibold">{st.completedReturns}</td>
                    <td className="text-amber-700 font-semibold">{st.pendingBookings}</td>
                    <td>
                      <span className="status-pill status-avail">
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
        <div className="clean-form-card">
          <div className="border-b pb-3 mb-4">
            <h3 className="font-bold text-base">Track History</h3>
            <p className="text-xs text-muted">Chronological log of all requests, approvals, returns, and rejections</p>
          </div>

          <div className="table-responsive">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Student's Name</th>
                  <th>Room</th>
                  <th>Machine Types & Code</th>
                  <th>Date & Time Usage</th>
                  <th>Lecturer Approval</th>
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
                        <span className={`status-pill ${badge.bgClass} ${badge.colorClass}`}>
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

      {/* APPROVE / REJECT MODAL */}
      {modalRequest && (
        <div className="clean-modal-backdrop" onClick={() => setModalRequest(null)}>
          <div className="clean-modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="clean-modal-header">
              <h3 className="font-bold text-base">
                {actionType === 'APPROVE' ? 'Approve Student Application' : 'Reject Student Application'}
              </h3>
              <button type="button" onClick={() => setModalRequest(null)} className="btn-close">
                <X size={18} />
              </button>
            </div>

            <div className="p-4">
              <div className="info-box mb-3">
                <div className="font-bold text-sm">{modalRequest.applicant.studentName}</div>
                <div className="text-xs text-muted">
                  Room {modalRequest.requestDetails.facilityRoom} • Machines: {modalRequest.requestDetails.machineIds.join(', ')} • {formatDate(modalRequest.requestDetails.date)}
                </div>
              </div>

              {actionType === 'APPROVE' ? (
                <>
                  <div className="form-group">
                    <label className="field-label">Lecturer Feedback / Approval Note</label>
                    <textarea
                      value={feedbackNote}
                      onChange={e => setFeedbackNote(e.target.value)}
                      rows={2}
                      className="clean-textarea"
                    />
                  </div>

                  <div className="mt-3">
                    <SignaturePad
                      label="Lecturer Approval Signature"
                      required
                      onSave={sig => setLecturerSig(sig)}
                    />
                  </div>
                </>
              ) : (
                <div className="form-group">
                  <label className="field-label">Reason for Rejection <span className="req-star">*</span></label>
                  <textarea
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    rows={3}
                    className="clean-textarea"
                    required
                  />
                </div>
              )}
            </div>

            <div className="clean-modal-footer">
              <button type="button" onClick={() => setModalRequest(null)} className="btn-secondary-sm">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className={actionType === 'APPROVE' ? 'btn-success-sm' : 'btn-danger-sm'}
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
