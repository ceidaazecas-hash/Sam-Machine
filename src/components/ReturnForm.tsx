import React, { useState } from 'react';
import { useLab } from '../context/LabContext';
import type { BookingRequest, ConditionChecklist, ReturnInspection } from '../types/lab';
import { SignaturePad } from './SignaturePad';
import { 
  CheckCircle2, 
  Search, 
  RotateCcw, 
  FileCheck 
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
    <div className="fluid-page-wrapper">
      {/* Intro Header */}
      <div className="page-intro">
        <div>
          <h1 className="page-intro-title">Equipment Return & Condition Verification</h1>
          <p className="page-intro-desc">Review original request details and complete physical machine inspection</p>
        </div>
      </div>

      <div className="return-layout-container">
        {/* Left Column: Select Active Session */}
        <div className="sidebar-sessions-box">
          <div className="card-header-minimal" style={{ marginBottom: '0.75rem' }}>
            <span className="card-title-minimal" style={{ fontSize: '0.88rem' }}>Active Sessions</span>
            <span className="tab-badge">{activeBookings.length} In Use</span>
          </div>

          <div className="input-container">
            <Search size={15} className="input-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search student or room..."
              className="form-input"
              style={{ fontSize: '0.85rem', minHeight: '38px', paddingLeft: '2.25rem' }}
            />
          </div>

          <div className="sidebar-sessions-list">
            {filteredBookings.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted">
                <FileCheck size={26} className="mx-auto mb-1 opacity-40" />
                <span>No active sessions found</span>
              </div>
            ) : (
              filteredBookings.map(b => {
                const isSelected = b.id === selectedRequestId;
                return (
                  <div
                    key={b.id}
                    onClick={() => handleSelectBooking(b)}
                    className={`session-select-item ${isSelected ? 'active' : ''}`}
                  >
                    <div className="session-item-row">
                      <span className="session-item-title">{b.applicant.studentName}</span>
                      <span className="mono font-bold text-xs">Room {b.requestDetails.facilityRoom}</span>
                    </div>

                    <div className="session-item-sub">
                      {b.applicant.semester} • {b.applicant.classModule}
                    </div>

                    <div className="session-item-row mt-1 text-xs text-muted">
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
            <div className="p-12 text-center text-muted">
              <RotateCcw size={36} className="mx-auto mb-2 opacity-30 text-slate-900" />
              <h3 className="font-bold text-sm text-slate-800">Select an Active Session</h3>
              <p className="text-xs text-muted mt-1">Choose a student booking from the left list to process equipment return.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitReturn}>
              {/* ========================================================
                  SECTION 1: APPLICANT'S INFORMATION
                 ======================================================== */}
              <div className="card-header-minimal">
                <div className="card-title-minimal">
                  <span className="card-step-badge">01</span>
                  <span>Applicant's Information</span>
                </div>
              </div>

              <div className="detail-card-grid">
                <div className="detail-item">
                  <span className="detail-label">Student's Name</span>
                  <span className="detail-value">{activeRequest.applicant.studentName}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Semester</span>
                  <span className="detail-value">{activeRequest.applicant.semester}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Class / Module</span>
                  <span className="detail-value">{activeRequest.applicant.classModule}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Lecturers</span>
                  <span className="detail-value">{activeRequest.applicant.lecturer}</span>
                </div>
              </div>

              {/* ========================================================
                  SECTION 2: REQUEST DETAILS (ORIGINAL APPLICATION)
                 ======================================================== */}
              <div className="card-header-minimal mt-4">
                <div className="card-title-minimal">
                  <span className="card-step-badge">02</span>
                  <span>Request Details (Original Application)</span>
                </div>
              </div>

              <div className="detail-card-grid">
                <div className="detail-item">
                  <span className="detail-label">Facility / Room</span>
                  <span className="detail-value font-bold">Room {activeRequest.requestDetails.facilityRoom}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Date & Time Usage</span>
                  <span className="detail-value">
                    {formatDate(activeRequest.requestDetails.date)} ({activeRequest.requestDetails.startTime} - {activeRequest.requestDetails.endTime})
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Machine Types & Code</span>
                  <div className="flex gap-1.5 mt-0.5">
                    {activeRequest.requestDetails.machineIds.map(mId => (
                      <span key={mId} className="mono text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                        #{mId}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Verified by Lecturer</span>
                  <span className="detail-value">{activeRequest.applicant.lecturer}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Student's Agreement</span>
                  <span className="detail-value font-bold text-slate-900">✓ Confirmed & Signed</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Lecturer Approval</span>
                  <span className="detail-value font-bold text-slate-900">✓ Approved for Studio Use</span>
                </div>
              </div>

              {/* ========================================================
                  SECTION 3: RETURN DETAILS & CONDITION VERIFICATION
                 ======================================================== */}
              <div className="card-header-minimal mt-4">
                <div className="card-title-minimal">
                  <span className="card-step-badge">03</span>
                  <span>Return Details & Condition Verification</span>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-field">
                  <label className="field-label">
                    Return Date & Time <span className="required-dot">*</span>
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
                    Verified by (Same Lecturer) <span className="required-dot">*</span>
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

              {/* Condition Rating (Strict Black & White) */}
              <div className="form-field">
                <label className="field-label">Condition Rating</label>
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
                      style={{ border: returnCondition === cond.id ? '1px solid var(--text-primary)' : '1px solid var(--border-medium)', color: returnCondition === cond.id ? '#ffffff' : 'var(--text-primary)', background: returnCondition === cond.id ? 'var(--text-primary)' : '#ffffff', padding: '0.35rem 0.85rem', fontSize: '0.82rem', fontWeight: 700 }}
                    >
                      {cond.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5-Point Condition Checklist */}
              <div className="form-field">
                <label className="field-label">5-Point Condition Checklist</label>
                <div className="condition-checklist-grid">
                  <label className="condition-check-box">
                    <input
                      type="checkbox"
                      checked={checklist.needleIntact}
                      onChange={() => handleChecklistToggle('needleIntact')}
                      className="checkbox-minimal"
                    />
                    <span>Needle intact & presser foot secured</span>
                  </label>

                  <label className="condition-check-box">
                    <input
                      type="checkbox"
                      checked={checklist.bobbinCaseClean}
                      onChange={() => handleChecklistToggle('bobbinCaseClean')}
                      className="checkbox-minimal"
                    />
                    <span>Bobbin case and feed dog clean</span>
                  </label>

                  <label className="condition-check-box">
                    <input
                      type="checkbox"
                      checked={checklist.tensionCalibrated}
                      onChange={() => handleChecklistToggle('tensionCalibrated')}
                      className="checkbox-minimal"
                    />
                    <span>Thread tension dials calibrated</span>
                  </label>

                  <label className="condition-check-box">
                    <input
                      type="checkbox"
                      checked={checklist.accessoriesReturned}
                      onChange={() => handleChecklistToggle('accessoriesReturned')}
                      className="checkbox-minimal"
                    />
                    <span>All accessories & pedal returned</span>
                  </label>

                  <label className="condition-check-box" style={{ gridColumn: 'span 2' }}>
                    <input
                      type="checkbox"
                      checked={checklist.workspaceCleaned}
                      onChange={() => handleChecklistToggle('workspaceCleaned')}
                      className="checkbox-minimal"
                    />
                    <span>Station table and floor cleaned</span>
                  </label>
                </div>
              </div>

              {/* Condition Notes */}
              <div className="form-field">
                <label className="field-label">Condition Notes & Feedback</label>
                <textarea
                  value={conditionNotes}
                  onChange={e => setConditionNotes(e.target.value)}
                  rows={2}
                  className="form-textarea"
                  placeholder="Enter condition notes..."
                />
              </div>

              {/* Lecturer Signature */}
              <div className="signature-wrapper">
                <SignaturePad
                  label="Lecturer's Approval & Return Sign-Off Signature"
                  required
                  onSave={sig => setLecturerSignature(sig)}
                />
              </div>

              {/* Submit Return (Solid Black with White Text) */}
              <button type="submit" className="btn-submit-primary">
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
