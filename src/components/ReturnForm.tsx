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
  const { requests, lecturers, submitReturnInspection, setActiveTab, showToast } = useLab();

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
    <div className="simple-section-container">
      {/* Header Banner */}
      <div className="section-title-card">
        <div>
          <div className="section-badge">RETURN</div>
          <h1 className="section-heading">Equipment Return & Condition Verification</h1>
          <p className="section-subheading">Review original booking details and complete lecturer return inspection</p>
        </div>

        <div className="workflow-toggle-box">
          <span className="text-xs text-muted font-bold mr-1">Switch:</span>
          <button
            type="button"
            onClick={() => setActiveTab('REQUEST')}
            className="toggle-chip"
          >
            Request
          </button>
          <button
            type="button"
            className="toggle-chip active"
          >
            Return
          </button>
        </div>
      </div>

      <div className="return-layout-grid">
        {/* Left Column: Select Active Request */}
        <div className="clean-sidebar-card">
          <div className="sidebar-header">
            <h3 className="sidebar-title">Select Active Session</h3>
            <span className="sidebar-count">{activeBookings.length} Active</span>
          </div>

          <div className="clean-search-box">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by student, room, or machine..."
              className="clean-search-input"
            />
          </div>

          <div className="active-requests-list">
            {filteredBookings.length === 0 ? (
              <div className="empty-state-mini">
                <FileCheck size={24} className="text-muted" />
                <p className="text-xs text-muted mt-2">No active sessions matching search.</p>
              </div>
            ) : (
              filteredBookings.map(b => {
                const isSelected = b.id === selectedRequestId;
                return (
                  <div
                    key={b.id}
                    onClick={() => handleSelectBooking(b)}
                    className={`request-select-card ${isSelected ? 'active' : ''}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm">{b.applicant.studentName}</span>
                      <span className="text-xs mono font-bold">Room {b.requestDetails.facilityRoom}</span>
                    </div>

                    <div className="text-xs text-muted mt-1">
                      {b.applicant.semester} • {b.applicant.classModule}
                    </div>

                    <div className="text-xs text-muted mt-1 flex justify-between">
                      <span>Machines: <strong>{b.requestDetails.machineIds.join(', ')}</strong></span>
                      <span>Slot: {b.requestDetails.startTime} - {b.requestDetails.endTime}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Return Form with Display and Condition Verification */}
        <div className="clean-form-card">
          {!activeRequest ? (
            <div className="empty-selection-placeholder">
              <RotateCcw size={40} className="text-muted opacity-40" />
              <h3 className="font-bold text-base mt-2">Select a Session to Process Return</h3>
              <p className="text-xs text-muted">Choose an active student booking from the left list.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitReturn}>
              {/* ========================================================
                  1. APPLICANT'S INFORMATION DISPLAY
                 ======================================================== */}
              <div className="form-block">
                <h2 className="block-title">Applicant's Information</h2>
                <div className="info-display-grid">
                  <div className="info-box">
                    <span className="info-label">Student's Name</span>
                    <span className="info-value font-bold">{activeRequest.applicant.studentName}</span>
                  </div>

                  <div className="info-box">
                    <span className="info-label">Semester</span>
                    <span className="info-value">{activeRequest.applicant.semester}</span>
                  </div>

                  <div className="info-box">
                    <span className="info-label">Class / Module</span>
                    <span className="info-value">{activeRequest.applicant.classModule}</span>
                  </div>

                  <div className="info-box">
                    <span className="info-label">Lecturers</span>
                    <span className="info-value font-semibold">{activeRequest.applicant.lecturer}</span>
                  </div>
                </div>
              </div>

              {/* ========================================================
                  2. REQUEST DETAILS DISPLAY
                 ======================================================== */}
              <div className="form-block">
                <h2 className="block-title">Request (Original Application Display)</h2>

                <div className="display-box-card">
                  <div className="display-row">
                    <span className="display-row-label">• Facility / Room:</span>
                    <span className="display-row-val font-bold">Room {activeRequest.requestDetails.facilityRoom}</span>
                  </div>

                  <div className="display-row">
                    <span className="display-row-label">• Date & Time Usage:</span>
                    <span className="display-row-val">
                      {formatDate(activeRequest.requestDetails.date)} ({activeRequest.requestDetails.startTime} – {activeRequest.requestDetails.endTime})
                    </span>
                  </div>

                  <div className="display-row">
                    <span className="display-row-label">• Machine Types & Code:</span>
                    <span className="display-row-val">
                      {activeRequest.requestDetails.machineIds.map(mId => (
                        <span key={mId} className="machine-pill-tag mr-1">
                          #{mId}
                        </span>
                      ))}
                    </span>
                  </div>

                  <div className="display-row">
                    <span className="display-row-label">• Verified by:</span>
                    <span className="display-row-val font-semibold">{activeRequest.applicant.lecturer}</span>
                  </div>

                  <div className="display-row">
                    <span className="display-row-label">• Student's Agreement:</span>
                    <span className="display-row-val text-emerald-600 font-semibold flex items-center gap-1">
                      <Check size={14} /> Confirmed & Signed
                    </span>
                  </div>

                  <div className="display-row">
                    <span className="display-row-label">• Lecturer Approval:</span>
                    <span className="display-row-val text-emerald-600 font-semibold flex items-center gap-1">
                      <ShieldCheck size={14} /> Approved for Studio Usage
                    </span>
                  </div>
                </div>
              </div>

              {/* ========================================================
                  3. RETURN VERIFICATION & LECTURER APPROVAL
                 ======================================================== */}
              <div className="form-block">
                <h2 className="block-title">Return Details & Lecturer Verification</h2>

                {/* Return Date & Time */}
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="field-label">Return Date & Time <span className="req-star">*</span></label>
                    <input
                      type="datetime-local"
                      value={returnDateTime}
                      onChange={e => setReturnDateTime(e.target.value)}
                      className="clean-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="field-label">Verified by (Same Lecturer) <span className="req-star">*</span></label>
                    <select
                      value={verifiedLecturer}
                      onChange={e => setVerifiedLecturer(e.target.value)}
                      className="clean-select font-semibold"
                      required
                    >
                      {lecturers.map(l => (
                        <option key={l.id} value={l.name}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Condition Selection */}
                <div className="form-group mt-2">
                  <label className="field-label">Condition Assessment</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'EXCELLENT', label: 'Excellent Condition' },
                      { id: 'GOOD', label: 'Good Working Condition' },
                      { id: 'MINOR_ISSUES', label: 'Minor Issues / Lint' },
                      { id: 'DAMAGED', label: 'Damaged / Needs Service' }
                    ].map(cond => (
                      <button
                        key={cond.id}
                        type="button"
                        onClick={() => setReturnCondition(cond.id as any)}
                        className={`duration-chip ${returnCondition === cond.id ? 'active' : ''}`}
                      >
                        {cond.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Condition & Verification Checklist */}
                <div className="form-group mt-3">
                  <label className="field-label">Condition & Verification Checklist</label>
                  <div className="checklist-container">
                    <label className="checklist-item">
                      <input
                        type="checkbox"
                        checked={checklist.needleIntact}
                        onChange={() => handleChecklistToggle('needleIntact')}
                        className="clean-checkbox"
                      />
                      <span>Needle intact & presser foot secured</span>
                    </label>

                    <label className="checklist-item">
                      <input
                        type="checkbox"
                        checked={checklist.bobbinCaseClean}
                        onChange={() => handleChecklistToggle('bobbinCaseClean')}
                        className="clean-checkbox"
                      />
                      <span>Bobbin case and feed dog cleaned of lint</span>
                    </label>

                    <label className="checklist-item">
                      <input
                        type="checkbox"
                        checked={checklist.tensionCalibrated}
                        onChange={() => handleChecklistToggle('tensionCalibrated')}
                        className="clean-checkbox"
                      />
                      <span>Thread tension calibrated to standard dial</span>
                    </label>

                    <label className="checklist-item">
                      <input
                        type="checkbox"
                        checked={checklist.accessoriesReturned}
                        onChange={() => handleChecklistToggle('accessoriesReturned')}
                        className="clean-checkbox"
                      />
                      <span>All accessories, foot pedal, and cords returned</span>
                    </label>

                    <label className="checklist-item col-span-2">
                      <input
                        type="checkbox"
                        checked={checklist.workspaceCleaned}
                        onChange={() => handleChecklistToggle('workspaceCleaned')}
                        className="clean-checkbox"
                      />
                      <span>Workstation table and floor swept</span>
                    </label>
                  </div>
                </div>

                {/* Condition Notes */}
                <div className="form-group">
                  <label className="field-label">Condition & Verification Notes</label>
                  <textarea
                    value={conditionNotes}
                    onChange={e => setConditionNotes(e.target.value)}
                    rows={2}
                    placeholder="Enter condition notes (e.g. Clean, undamaged, ready for next student)..."
                    className="clean-textarea"
                  />
                </div>

                {/* Lecturer Signature */}
                <div className="mt-3">
                  <SignaturePad
                    label="Lecturer's Approval & Return Sign-Off Signature"
                    required
                    onSave={sig => setLecturerSignature(sig)}
                  />
                </div>
              </div>

              {/* Submit Return */}
              <div className="form-submit-block">
                <button type="submit" className="btn-submit-main">
                  <CheckCircle2 size={18} />
                  <span>LECTURER'S APPROVAL / ACCEPT RETURN</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
