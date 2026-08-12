import React, { useState } from 'react';
import { useLab } from '../context/LabContext';
import type { BookingRequest } from '../types/lab';
import { 
  UserCheck, 
  CheckCircle, 
  Clock, 
  Layers, 
  FileText, 
  Check, 
  X, 
  ShieldCheck, 
  Award,
  Activity
} from 'lucide-react';
import { formatDate, formatDateTime, getStatusBadge } from '../utils/helpers';
import { SignaturePad } from './SignaturePad';

export const LecturerDashboard: React.FC = () => {
  const { 
    requests, 
    lecturers, 
    machines, 
    approveRequest, 
    rejectRequest, 
    showToast 
  } = useLab();

  const [selectedLecturerFilter, setSelectedLecturerFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'PENDING' | 'MACHINE_REPORTS' | 'STUDENT_TRACK' | 'HISTORY'>('PENDING');
  
  // Modal for approve/reject
  const [reviewModalRequest, setReviewModalRequest] = useState<BookingRequest | null>(null);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [lecturerSig, setLecturerSig] = useState('');
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT'>('APPROVE');

  // Filter requests based on lecturer filter
  const filteredRequests = requests.filter(r => {
    if (selectedLecturerFilter === 'ALL') return true;
    return r.applicant.lecturer === selectedLecturerFilter || r.approval.verifiedByLecturer === selectedLecturerFilter;
  });

  const pendingRequests = filteredRequests.filter(r => r.approval.status === 'PENDING');
  const activeInUseRequests = filteredRequests.filter(r => r.approval.status === 'IN_USE');

  const handleOpenReview = (req: BookingRequest, type: 'APPROVE' | 'REJECT') => {
    setReviewModalRequest(req);
    setActionType(type);
    setFeedbackNote(type === 'APPROVE' ? 'Application verified. Safe studio operating standards confirmed.' : '');
    setRejectionReason(type === 'REJECT' ? 'Facility maintenance conflict or prerequisite module check pending.' : '');
  };

  const handleConfirmAction = () => {
    if (!reviewModalRequest) return;

    if (actionType === 'APPROVE') {
      approveRequest(
        reviewModalRequest.id,
        feedbackNote,
        lecturerSig || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50"><path d="M 10 25 Q 60 5 110 30 T 180 15" stroke="%2310b981" stroke-width="2" fill="none"/></svg>'
      );
    } else {
      if (!rejectionReason.trim()) {
        showToast('Please state a rejection reason for the student.', 'error');
        return;
      }
      rejectRequest(reviewModalRequest.id, rejectionReason);
    }

    setReviewModalRequest(null);
  };

  // Compute student tracking statistics
  const studentMap = new Map<string, {
    name: string;
    studentId: string;
    semester: string;
    totalBookings: number;
    completedReturns: number;
    pendingBookings: number;
    damageIncidents: number;
  }>();

  requests.forEach(r => {
    const sId = r.applicant.studentId;
    if (!studentMap.has(sId)) {
      studentMap.set(sId, {
        name: r.applicant.studentName,
        studentId: sId,
        semester: r.applicant.semester,
        totalBookings: 0,
        completedReturns: 0,
        pendingBookings: 0,
        damageIncidents: 0
      });
    }
    const st = studentMap.get(sId)!;
    st.totalBookings += 1;
    if (r.approval.status === 'RETURNED') st.completedReturns += 1;
    if (r.approval.status === 'PENDING') st.pendingBookings += 1;
    if (r.returnInfo?.returnCondition === 'DAMAGED') st.damageIncidents += 1;
  });

  const studentTrackList = Array.from(studentMap.values());

  return (
    <div className="lecturer-hub-container">
      {/* Top Banner */}
      <div className="page-header-card">
        <div className="page-header-content">
          <div className="header-badge badge-amber">
            <UserCheck size={14} />
            <span>Lecturer Verification Portal</span>
          </div>
          <h1 className="page-title">Instructor Verification & Performance Command</h1>
          <p className="page-description">
            Verify student equipment requisitions, authorize studio access, review machine health logs, and track student compliance.
          </p>
        </div>

        {/* Lecturer Filter */}
        <div className="lecturer-filter-box">
          <span className="text-xs text-muted font-medium">Filter by Instructor:</span>
          <select
            value={selectedLecturerFilter}
            onChange={e => setSelectedLecturerFilter(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Lecturers (All Departments)</option>
            {lecturers.map(l => (
              <option key={l.id} value={l.name}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="stats-cards-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-title">Pending Approvals</span>
            <span className="stat-card-icon text-amber-400 bg-amber-500/10">
              <Clock size={18} />
            </span>
          </div>
          <div className="stat-card-val text-amber-400">{pendingRequests.length}</div>
          <div className="stat-card-foot text-muted">Awaiting your authorization</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-title">In Studio Use</span>
            <span className="stat-card-icon text-cyan-400 bg-cyan-500/10">
              <Activity size={18} />
            </span>
          </div>
          <div className="stat-card-val text-cyan-400">{activeInUseRequests.length}</div>
          <div className="stat-card-foot text-muted">Active sessions across rooms</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-title">Total Machines</span>
            <span className="stat-card-icon text-emerald-400 bg-emerald-500/10">
              <Layers size={18} />
            </span>
          </div>
          <div className="stat-card-val text-emerald-400">18</div>
          <div className="stat-card-foot text-muted">16 Sewing + 2 Overlockers</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-title">Completed Returns</span>
            <span className="stat-card-icon text-blue-400 bg-blue-500/10">
              <CheckCircle size={18} />
            </span>
          </div>
          <div className="stat-card-val text-blue-400">
            {requests.filter(r => r.approval.status === 'RETURNED').length}
          </div>
          <div className="stat-card-foot text-muted">Fully verified & checked</div>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="subtabs-bar">
        <button
          type="button"
          className={`subtab-btn ${activeTab === 'PENDING' ? 'active' : ''}`}
          onClick={() => setActiveTab('PENDING')}
        >
          <Clock size={15} />
          <span>Pending Applications ({pendingRequests.length})</span>
        </button>

        <button
          type="button"
          className={`subtab-btn ${activeTab === 'STUDENT_TRACK' ? 'active' : ''}`}
          onClick={() => setActiveTab('STUDENT_TRACK')}
        >
          <Award size={15} />
          <span>Student Track Record</span>
        </button>

        <button
          type="button"
          className={`subtab-btn ${activeTab === 'MACHINE_REPORTS' ? 'active' : ''}`}
          onClick={() => setActiveTab('MACHINE_REPORTS')}
        >
          <Layers size={15} />
          <span>Machine Health & Notes</span>
        </button>

        <button
          type="button"
          className={`subtab-btn ${activeTab === 'HISTORY' ? 'active' : ''}`}
          onClick={() => setActiveTab('HISTORY')}
        >
          <FileText size={15} />
          <span>Verification History</span>
        </button>
      </div>

      {/* TAB 1: PENDING REQUESTS REVIEW */}
      {activeTab === 'PENDING' && (
        <div className="pending-queue-view">
          {pendingRequests.length === 0 ? (
            <div className="empty-state-card">
              <ShieldCheck size={48} className="text-emerald-400 opacity-80" />
              <h3>All Clear! No Pending Applications</h3>
              <p className="text-sm text-muted">
                All student equipment requests for {selectedLecturerFilter === 'ALL' ? 'all faculty' : selectedLecturerFilter} have been reviewed.
              </p>
            </div>
          ) : (
            <div className="pending-cards-grid">
              {pendingRequests.map(req => (
                <div key={req.id} className="pending-review-card">
                  <div className="pending-card-top">
                    <div>
                      <span className="pending-id mono">{req.id}</span>
                      <h3 className="pending-name">{req.applicant.studentName}</h3>
                      <span className="pending-module">{req.applicant.classModule}</span>
                    </div>

                    <span className="status-pill bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      Pending Action
                    </span>
                  </div>

                  <div className="pending-details-grid">
                    <div className="pending-detail-item">
                      <span className="text-xs text-muted">Facility / Room</span>
                      <span className="font-semibold text-primary">Studio {req.requestDetails.facilityRoom}</span>
                    </div>

                    <div className="pending-detail-item">
                      <span className="text-xs text-muted">Requested Date & Slot</span>
                      <span className="font-medium text-xs">
                        {formatDate(req.requestDetails.date)} ({req.requestDetails.startTime} - {req.requestDetails.endTime})
                      </span>
                    </div>

                    <div className="pending-detail-item col-span-2">
                      <span className="text-xs text-muted">Assigned Equipment</span>
                      <div className="flex gap-1.5 mt-1">
                        {req.requestDetails.machineIds.map(mId => (
                          <span key={mId} className="machine-tag-pill">
                            Machine #{mId}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pending-detail-item col-span-2">
                      <span className="text-xs text-muted">Usage Purpose</span>
                      <p className="text-xs text-secondary mt-0.5">
                        "{req.requestDetails.purposeNotes || 'Standard studio course work.'}"
                      </p>
                    </div>

                    <div className="pending-detail-item col-span-2 flex items-center justify-between border-t border-glass pt-2">
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                        <Check size={14} />
                        <span>Safety Agreement Signed</span>
                      </div>
                      <span className="text-[11px] text-muted">
                        Submitted: {formatDateTime(req.requestDetails.submittedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pending-actions-row">
                    <button
                      type="button"
                      onClick={() => handleOpenReview(req, 'REJECT')}
                      className="btn-danger-sm"
                    >
                      <X size={15} />
                      <span>Reject</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenReview(req, 'APPROVE')}
                      className="btn-success-sm"
                    >
                      <Check size={15} />
                      <span>Verify & Approve</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STUDENT TRACK RECORD */}
      {activeTab === 'STUDENT_TRACK' && (
        <div className="table-card">
          <div className="table-header">
            <h3 className="table-title">Student Laboratory Compliance & History</h3>
            <p className="table-subtitle">Track record of equipment usage, on-time returns, and safety compliance.</p>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Matrix ID</th>
                  <th>Semester</th>
                  <th>Total Bookings</th>
                  <th>Completed Returns</th>
                  <th>Active / Pending</th>
                  <th>Safety Flag / Incidents</th>
                  <th>Compliance Status</th>
                </tr>
              </thead>
              <tbody>
                {studentTrackList.map(st => (
                  <tr key={st.studentId}>
                    <td className="font-medium text-primary">{st.name}</td>
                    <td className="mono text-xs">{st.studentId}</td>
                    <td>{st.semester}</td>
                    <td className="font-semibold">{st.totalBookings}</td>
                    <td className="text-emerald-400">{st.completedReturns}</td>
                    <td className="text-amber-400">{st.pendingBookings}</td>
                    <td>
                      {st.damageIncidents > 0 ? (
                        <span className="text-rose-400 font-semibold">{st.damageIncidents} incident(s)</span>
                      ) : (
                        <span className="text-muted">0 Clean</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-pill ${st.damageIncidents === 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
                        {st.damageIncidents === 0 ? '✅ Excellent Standing' : '⚠️ Flagged for Review'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MACHINE REPORTS & NOTES */}
      {activeTab === 'MACHINE_REPORTS' && (
        <div className="machine-reports-grid">
          {machines.map(m => (
            <div key={m.id} className="machine-report-card">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold text-primary">
                    {m.type === 'SEWING' ? '🧵 Sewing Machine' : '⚙️ Overlocking Serger'}
                  </span>
                  <h4 className="font-bold text-base mt-0.5">Machine #{m.code}</h4>
                  <div className="text-xs text-muted">{m.name} • Room {m.room}</div>
                </div>

                <span className={`status-pill ${m.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400' : m.status === 'IN_USE' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {m.status}
                </span>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">Health Index</span>
                  <span className="font-semibold">{m.healthScore}%</span>
                </div>
                <div className="health-bar-bg">
                  <div
                    className="health-bar-fill"
                    style={{
                      width: `${m.healthScore}%`,
                      backgroundColor: m.healthScore > 85 ? '#10b981' : m.healthScore > 70 ? '#f59e0b' : '#ef4444'
                    }}
                  />
                </div>
              </div>

              <div className="machine-report-meta">
                <div className="meta-item">
                  <span className="meta-label">Total Usage</span>
                  <span className="meta-val">{m.totalUsageHours} hrs</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Last Maintained</span>
                  <span className="meta-val">{m.lastMaintained || '2026-08-01'}</span>
                </div>
              </div>

              <div className="machine-notes-box">
                <span className="text-[11px] font-semibold uppercase text-muted block mb-0.5">Lecturer / Tech Notes:</span>
                <p className="text-xs text-secondary italic">"{m.notes || 'Station in optimal calibration.'}"</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: HISTORY */}
      {activeTab === 'HISTORY' && (
        <div className="table-card">
          <div className="table-header">
            <h3 className="table-title">Instructor Verification History</h3>
            <p className="table-subtitle">Chronological record of approved, returned, and rejected bookings.</p>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking Ref</th>
                  <th>Student</th>
                  <th>Room</th>
                  <th>Machines</th>
                  <th>Usage Date</th>
                  <th>Status</th>
                  <th>Verifier</th>
                  <th>Feedback / Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(r => {
                  const badge = getStatusBadge(r.approval.status);
                  return (
                    <tr key={r.id}>
                      <td className="mono font-semibold">{r.id}</td>
                      <td>{r.applicant.studentName}</td>
                      <td className="text-primary font-medium">Room {r.requestDetails.facilityRoom}</td>
                      <td>{r.requestDetails.machineIds.join(', ')}</td>
                      <td className="text-xs">{formatDate(r.requestDetails.date)}</td>
                      <td>
                        <span className={`status-pill ${badge.bgClass} ${badge.colorClass}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="text-xs">{r.approval.verifiedByLecturer}</td>
                      <td className="text-xs text-muted max-w-xs truncate">
                        {r.approval.lecturerFeedback || r.approval.rejectionReason || r.returnInfo?.lecturerNotes || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: APPROVE / REJECT DRAWER */}
      {reviewModalRequest && (
        <div className="modal-backdrop" onClick={() => setReviewModalRequest(null)}>
          <div className="modal-dialog review-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {actionType === 'APPROVE' ? 'Authorize Studio Request' : 'Reject Studio Request'}
              </h3>
              <button
                type="button"
                onClick={() => setReviewModalRequest(null)}
                className="btn-icon-close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Applicant Summary */}
              <div className="review-summary-box">
                <div className="font-semibold text-sm">{reviewModalRequest.applicant.studentName} ({reviewModalRequest.applicant.studentId})</div>
                <div className="text-xs text-muted mt-0.5">
                  {reviewModalRequest.applicant.classModule} • Studio {reviewModalRequest.requestDetails.facilityRoom}
                </div>
                <div className="text-xs text-primary mt-1 font-medium">
                  Machines: {reviewModalRequest.requestDetails.machineIds.join(', ')} | Slot: {formatDate(reviewModalRequest.requestDetails.date)} ({reviewModalRequest.requestDetails.startTime} - {reviewModalRequest.requestDetails.endTime})
                </div>
              </div>

              {actionType === 'APPROVE' ? (
                <>
                  <div className="form-group mt-3">
                    <label className="form-label">Lecturer Guidance / Studio Feedback Note</label>
                    <textarea
                      value={feedbackNote}
                      onChange={e => setFeedbackNote(e.target.value)}
                      rows={2}
                      placeholder="e.g. Approved. Verify upper tension before commencing sewing..."
                      className="form-textarea"
                    />
                  </div>

                  <div className="mt-3">
                    <SignaturePad
                      label="Lecturer Verification & Approval Signature"
                      required
                      onSave={sig => setLecturerSig(sig)}
                    />
                  </div>
                </>
              ) : (
                <div className="form-group mt-3">
                  <label className="form-label">
                    Reason for Rejection <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    rows={3}
                    placeholder="Provide clear reason for the student (e.g. room scheduled for class demo, prerequisite safety exam missing)..."
                    className="form-textarea"
                    required
                  />
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setReviewModalRequest(null)}
                className="btn-secondary-sm"
              >
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
