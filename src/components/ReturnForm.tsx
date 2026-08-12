import React, { useState } from 'react';
import { useLab } from '../context/LabContext';
import type { BookingRequest, ConditionChecklist, ReturnInspection } from '../types/lab';
import { SignaturePad } from './SignaturePad';
import { 
  CheckCircle2, 
  Search, 
  RotateCcw, 
  ShieldCheck, 
  FileCheck, 
  Check 
} from 'lucide-react';
import { formatDate } from '../utils/helpers';

export const ReturnForm: React.FC = () => {
  const { requests, lecturers, submitReturnInspection, showToast } = useLab();

  // Active bookings eligible for return (IN_USE or APPROVED)
  const activeBookings = requests.filter(
    r => r.approval.status === 'IN_USE' || r.approval.status === 'APPROVED'
  );

  const [selectedRequestId, setSelectedRequestId] = useState<string>(
    activeBookings[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');

  const activeRequest = requests.find(r => r.id === selectedRequestId);

  // Return section states
  const [returnDateTime, setReturnDateTime] = useState(() => {
    return new Date().toISOString().slice(0, 16);
  });
  const [returnCondition, setReturnCondition] = useState<'EXCELLENT' | 'GOOD' | 'MINOR_ISSUES' | 'DAMAGED'>('EXCELLENT');
  
  const [checklist, setChecklist] = useState<ConditionChecklist>({
    needleIntact: true,
    bobbinCaseClean: true,
    tensionCalibrated: true,
    accessoriesReturned: true,
    workspaceCleaned: true
  });

  const [conditionNotes, setConditionNotes] = useState('Machine inspected in clean working condition.');
  const [verifiedLecturer, setVerifiedLecturer] = useState(
    activeRequest?.applicant.lecturer || lecturers[0]?.name || ''
  );
  const [lecturerSignature, setLecturerSignature] = useState('');

  const handleChecklistToggle = (key: keyof ConditionChecklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectBooking = (req: BookingRequest) => {
    setSelectedRequestId(req.id);
    setVerifiedLecturer(req.applicant.lecturer);
  };

  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequest) {
      showToast('Please select a student request to return.', 'error');
      return;
    }

    if (!lecturerSignature) {
      showToast("Lecturer's verification signature is required for return.", 'error');
      return;
    }

    const inspection: ReturnInspection = {
      returnedAt: returnDateTime,
      returnCondition,
      checklist,
      verifiedByLecturer: verifiedLecturer,
      lecturerNotes: conditionNotes,
      lecturerSignature,
      isAccepted: true
    };

    submitReturnInspection(activeRequest.id, inspection);
    setSelectedRequestId('');
    setLecturerSignature('');
  };

  const filteredBookings = activeBookings.filter(b => {
    const q = searchQuery.toLowerCase();
    return (
      b.id.toLowerCase().includes(q) ||
      b.applicant.studentName.toLowerCase().includes(q) ||
      b.requestDetails.facilityRoom.includes(q) ||
      b.requestDetails.machineIds.some(m => m.includes(q))
    );
  });

  return (
    <div className="main-content-area wide">
      {/* Intro Header */}
      <div className="page-intro">
        <span className="page-intro-badge">RETURN</span>
        <h1 className="page-intro-title">Equipment Return & Condition Verification</h1>
        <p className="page-intro-desc">Review original request details and complete physical machine inspection</p>
      </div>

      <div className="return-view-grid">
        {/* Left Column: Select Active Session */}
        <div className="sidebar-list-card">
          <div className="sidebar-list-title">
            <span>Active Sessions</span>
            <span className="pill-tag">{activeBookings.length} In Use</span>
          </div>

          <div className="input-container mb-3">
            <Search size={14} className="input-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search student or room..."
              className="form-input"
              style={{ fontSize: '0.8rem', paddingLeft: '2.1rem', minHeight: '36px' }}
            />
          </div>

          <div className="sidebar-sessions-list">
            {filteredBookings.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted">
                <FileCheck size={24} className="mx-auto mb-1 opacity-40" />
                <span>No active sessions found</span>
              </div>
            ) : (
              filteredBookings.map(b => {
                const isSelected = b.id === selectedRequestId;
                return (
                  <div
                    key={b.id}
                    onClick={() => handleSelectBooking(b)}
                    className={`session-card-item ${isSelected ? 'active' : ''}`}
                  >
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span>{b.applicant.studentName}</span>
                      <span className="mono">Room {b.requestDetails.facilityRoom}</span>
                    </div>

                    <div className="text-xs text-muted mt-1">
                      {b.applicant.semester} • {b.applicant.classModule}
                    </div>

                    <div className="text-xs text-muted mt-1 flex justify-between">
                      <span>Machines: <strong>{b.requestDetails.machineIds.join(', ')}</strong></span>
                      <span>{b.requestDetails.startTime} - {b.requestDetails.endTime}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Return Form */}
        <div className="form-card-container">
          {!activeRequest ? (
            <div className="empty-selection-placeholder">
              <RotateCcw size={36} className="text-muted opacity-40" />
              <h3 className="font-bold text-sm mt-2 text-slate-800">Select an Active Session to Process Return</h3>
              <p className="text-xs text-muted">Choose a student booking from the left sidebar to verify equipment condition.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitReturn}>
              {/* ========================================================
                  SECTION 1: APPLICANT'S INFORMATION DISPLAY
                 ======================================================== */}
              <div className="form-section-block">
                <div className="form-section-header">
                  <div className="form-section-num">1</div>
                  <h2 className="form-section-title">Applicant's Information</h2>
                </div>

                <div className="grid-2">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                    <span className="summary-item-label">Student's Name</span>
                    <span className="summary-item-value">{activeRequest.applicant.studentName}</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                    <span className="summary-item-label">Semester</span>
                    <span className="summary-item-value">{activeRequest.applicant.semester}</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                    <span className="summary-item-label">Class / Module</span>
                    <span className="summary-item-value">{activeRequest.applicant.classModule}</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                    <span className="summary-item-label">Lecturers</span>
                    <span className="summary-item-value">{activeRequest.applicant.lecturer}</span>
                  </div>
                </div>
              </div>

              {/* ========================================================
                  SECTION 2: REQUEST DETAILS DISPLAY
                 ======================================================== */}
              <div className="form-section-block">
                <div className="form-section-header">
                  <div className="form-section-num">2</div>
                  <h2 className="form-section-title">Request Details (Original Application)</h2>
                </div>

                <div className="details-summary-card">
                  <div className="details-summary-grid">
                    <div className="summary-item">
                      <span className="summary-item-label">Facility / Room</span>
                      <span className="summary-item-value font-bold">Room {activeRequest.requestDetails.facilityRoom}</span>
                    </div>

                    <div className="summary-item">
                      <span className="summary-item-label">Date & Time Usage</span>
                      <span className="summary-item-value">
                        {formatDate(activeRequest.requestDetails.date)} ({activeRequest.requestDetails.startTime} - {activeRequest.requestDetails.endTime})
                      </span>
                    </div>

                    <div className="summary-item">
                      <span className="summary-item-label">Machine Types & Code</span>
                      <div className="flex gap-1 mt-0.5">
                        {activeRequest.requestDetails.machineIds.map(mId => (
                          <span key={mId} className="pill-tag">#{mId}</span>
                        ))}
                      </div>
                    </div>

                    <div className="summary-item">
                      <span className="summary-item-label">Verified by Lecturer</span>
                      <span className="summary-item-value">{activeRequest.applicant.lecturer}</span>
                    </div>

                    <div className="summary-item">
                      <span className="summary-item-label">Student's Agreement</span>
                      <span className="summary-item-value text-emerald-700 font-semibold flex items-center gap-1">
                        <Check size={13} /> Confirmed & Signed
                      </span>
                    </div>

                    <div className="summary-item">
                      <span className="summary-item-label">Lecturer Approval</span>
                      <span className="summary-item-value text-emerald-700 font-semibold flex items-center gap-1">
                        <ShieldCheck size={13} /> Approved for Studio Use
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ========================================================
                  SECTION 3: RETURN CONDITION & LECTURER ACCEPTANCE
                 ======================================================== */}
              <div className="form-section-block">
                <div className="form-section-header">
                  <div className="form-section-num">3</div>
                  <h2 className="form-section-title">Return Details & Condition Verification</h2>
                </div>

                <div className="grid-2">
                  <div className="form-field">
                    <label className="field-label">
                      <span className="field-label-text">Return Date & Time <span className="required-dot">*</span></span>
                    </label>
                    <input
                      type="datetime-local"
                      value={returnDateTime}
                      onChange={e => setReturnDateTime(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="field-label">
                      <span className="field-label-text">Verified by (Same Lecturer) <span className="required-dot">*</span></span>
                    </label>
                    <select
                      value={verifiedLecturer}
                      onChange={e => setVerifiedLecturer(e.target.value)}
                      className="form-select font-semibold"
                      required
                    >
                      {lecturers.map(l => (
                        <option key={l.id} value={l.name}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Condition Rating */}
                <div className="form-field">
                  <label className="field-label">
                    <span className="field-label-text">Condition Rating</span>
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { id: 'EXCELLENT', label: 'Excellent Condition' },
                      { id: 'GOOD', label: 'Good Working Order' },
                      { id: 'MINOR_ISSUES', label: 'Minor Lint / Adjustment' },
                      { id: 'DAMAGED', label: 'Damaged / Needs Tech' }
                    ].map(cond => (
                      <button
                        key={cond.id}
                        type="button"
                        onClick={() => setReturnCondition(cond.id as any)}
                        className={`room-chip ${returnCondition === cond.id ? 'active' : ''}`}
                        style={{ border: '1px solid #e2e8f0', color: returnCondition === cond.id ? '#ffffff' : '#334155', background: returnCondition === cond.id ? '#09090b' : '#f8fafc' }}
                      >
                        {cond.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5-Point Condition Checklist */}
                <div className="form-field">
                  <label className="field-label">
                    <span className="field-label-text">5-Point Condition Checklist</span>
                  </label>
                  <div className="condition-checklist-grid">
                    <label className="condition-check-label">
                      <input
                        type="checkbox"
                        checked={checklist.needleIntact}
                        onChange={() => handleChecklistToggle('needleIntact')}
                        className="checkbox-clean"
                      />
                      <span>Needle intact & presser foot secured</span>
                    </label>

                    <label className="condition-check-label">
                      <input
                        type="checkbox"
                        checked={checklist.bobbinCaseClean}
                        onChange={() => handleChecklistToggle('bobbinCaseClean')}
                        className="checkbox-clean"
                      />
                      <span>Bobbin case and feed dog clean</span>
                    </label>

                    <label className="condition-check-label">
                      <input
                        type="checkbox"
                        checked={checklist.tensionCalibrated}
                        onChange={() => handleChecklistToggle('tensionCalibrated')}
                        className="checkbox-clean"
                      />
                      <span>Thread tension dials calibrated</span>
                    </label>

                    <label className="condition-check-label">
                      <input
                        type="checkbox"
                        checked={checklist.accessoriesReturned}
                        onChange={() => handleChecklistToggle('accessoriesReturned')}
                        className="checkbox-clean"
                      />
                      <span>All accessories & pedal returned</span>
                    </label>

                    <label className="condition-check-label col-span-2" style={{ gridColumn: 'span 2' }}>
                      <input
                        type="checkbox"
                        checked={checklist.workspaceCleaned}
                        onChange={() => handleChecklistToggle('workspaceCleaned')}
                        className="checkbox-clean"
                      />
                      <span>Station table and floor cleaned</span>
                    </label>
                  </div>
                </div>

                {/* Verification Notes */}
                <div className="form-field">
                  <label className="field-label">
                    <span className="field-label-text">Condition Notes & Feedback</span>
                  </label>
                  <textarea
                    value={conditionNotes}
                    onChange={e => setConditionNotes(e.target.value)}
                    rows={2}
                    className="form-textarea"
                    placeholder="Enter return notes..."
                  />
                </div>

                {/* Lecturer Signature */}
                <div className="signature-card">
                  <SignaturePad
                    label="Lecturer Sign-Off & Approval Signature"
                    required
                    onSave={sig => setLecturerSignature(sig)}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn-primary-action">
                <CheckCircle2 size={16} />
                <span>LECTURER'S APPROVAL / ACCEPT RETURN</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
