import React, { useState } from 'react';
import { useLab } from '../context/LabContext';
import type { BookingRequest, ConditionChecklist, ReturnInspection } from '../types/lab';
import { SignaturePad } from './SignaturePad';
import { 
  Undo2, 
  CheckCircle2, 
  Search, 
  Clock, 
  ShieldCheck, 
  FileCheck, 
  ClipboardCheck
} from 'lucide-react';
import { formatDate, getStatusBadge } from '../utils/helpers';

export const ReturnForm: React.FC = () => {
  const { requests, lecturers, submitReturnInspection, showToast } = useLab();

  // Find requests that are either IN_USE or APPROVED (eligible for return)
  const activeBookings = requests.filter(
    r => r.approval.status === 'IN_USE' || r.approval.status === 'APPROVED'
  );

  const [selectedRequestId, setSelectedRequestId] = useState<string>(
    activeBookings[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Selected request object
  const activeRequest = requests.find(r => r.id === selectedRequestId);

  // Return Form State
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

  const [studentReturnNotes, setStudentReturnNotes] = useState('');
  const [lecturerNotes, setLecturerNotes] = useState('All machines and accessories inspected and verified in operational order.');
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
      showToast('Please select a booking to return.', 'error');
      return;
    }

    if (!lecturerSignature) {
      showToast('Lecturer digital verification signature is required.', 'error');
      return;
    }

    const inspection: ReturnInspection = {
      returnedAt: returnDateTime,
      returnCondition,
      checklist,
      verifiedByLecturer: verifiedLecturer,
      lecturerNotes,
      studentReturnNotes,
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
      b.applicant.studentId.toLowerCase().includes(q) ||
      b.requestDetails.facilityRoom.includes(q)
    );
  });

  return (
    <div className="return-flow-container">
      {/* Header Banner */}
      <div className="page-header-card">
        <div className="page-header-content">
          <div className="header-badge badge-cyan">
            <Undo2 size={14} />
            <span>Equipment Return & Verification</span>
          </div>
          <h1 className="page-title">Machine Return & Physical Inspection</h1>
          <p className="page-description">
            Complete the 5-point equipment condition audit, record maintenance notes, and capture lecturer return sign-off.
          </p>
        </div>
      </div>

      <div className="return-grid">
        {/* Left Column: Active Bookings Queue */}
        <div className="return-queue-card">
          <div className="queue-header">
            <h3 className="queue-title">Active Studio Sessions</h3>
            <span className="queue-count">{activeBookings.length} Active</span>
          </div>

          <div className="search-box">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search student, ID, or room..."
              className="search-input"
            />
          </div>

          <div className="queue-list">
            {filteredBookings.length === 0 ? (
              <div className="empty-queue">
                <FileCheck size={28} className="text-muted" />
                <p className="text-sm text-muted mt-2">No active sessions matching criteria.</p>
              </div>
            ) : (
              filteredBookings.map(b => {
                const isSelected = b.id === selectedRequestId;
                const statusBadge = getStatusBadge(b.approval.status);

                return (
                  <div
                    key={b.id}
                    onClick={() => handleSelectBooking(b)}
                    className={`queue-item ${isSelected ? 'active' : ''}`}
                  >
                    <div className="queue-item-top">
                      <span className="queue-item-id">{b.id}</span>
                      <span className={`status-pill ${statusBadge.bgClass} ${statusBadge.colorClass}`}>
                        {statusBadge.label}
                      </span>
                    </div>

                    <div className="queue-item-name">{b.applicant.studentName}</div>

                    <div className="queue-item-meta">
                      <span>Room {b.requestDetails.facilityRoom}</span>
                      <span>•</span>
                      <span>Machines: {b.requestDetails.machineIds.join(', ')}</span>
                    </div>

                    <div className="queue-item-time">
                      <Clock size={12} />
                      <span>{b.requestDetails.startTime} - {b.requestDetails.endTime}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Return Details & Verification Form */}
        <div className="return-form-card">
          {!activeRequest ? (
            <div className="return-empty-selection">
              <ClipboardCheck size={48} className="text-muted opacity-50" />
              <h3>Select an Active Booking to Inspect & Return</h3>
              <p className="text-sm text-muted">
                Choose a student session from the left queue to review original application details and record lecturer verification.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitReturn} className="return-form-content">
              {/* DISPLAY SECTION: Original Request Information */}
              <div className="display-summary-card">
                <div className="display-summary-header">
                  <div className="flex items-center gap-2">
                    <span className="summary-tag">Original Request Details</span>
                    <span className="summary-id mono">{activeRequest.id}</span>
                  </div>
                  <span className="text-xs text-muted">Verified by: {activeRequest.applicant.lecturer}</span>
                </div>

                <div className="display-summary-grid">
                  <div className="display-item">
                    <span className="display-label">Student Name</span>
                    <span className="display-value font-semibold">{activeRequest.applicant.studentName}</span>
                  </div>

                  <div className="display-item">
                    <span className="display-label">Semester & Class</span>
                    <span className="display-value">{activeRequest.applicant.semester} • {activeRequest.applicant.classModule}</span>
                  </div>

                  <div className="display-item">
                    <span className="display-label">Facility / Room</span>
                    <span className="display-value text-primary font-semibold">Studio Room {activeRequest.requestDetails.facilityRoom}</span>
                  </div>

                  <div className="display-item">
                    <span className="display-label">Usage Date & Time</span>
                    <span className="display-value">
                      {formatDate(activeRequest.requestDetails.date)} ({activeRequest.requestDetails.startTime} - {activeRequest.requestDetails.endTime})
                    </span>
                  </div>

                  <div className="display-item col-span-2">
                    <span className="display-label">Allocated Equipment Codes</span>
                    <div className="flex gap-2 mt-1">
                      {activeRequest.requestDetails.machineIds.map(mId => (
                        <span key={mId} className="machine-tag-pill">
                          Machine #{mId}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="display-item col-span-2">
                    <span className="display-label">Student Agreement & Approval</span>
                    <div className="flex items-center gap-4 text-xs mt-1">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 size={13} />
                        <span>Safety Agreement Confirmed</span>
                      </span>
                      <span className="flex items-center gap-1 text-primary">
                        <ShieldCheck size={13} />
                        <span>Lecturer Approved ({activeRequest.approval.verifiedByLecturer})</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* INSPECTION SECTION */}
              <div className="inspection-section">
                <div className="section-title-row">
                  <div className="section-step-num">1</div>
                  <div>
                    <h3 className="section-title">5-Point Physical Inspection Checklist</h3>
                    <p className="section-desc">Verify machine condition before releasing workstation</p>
                  </div>
                </div>

                <div className="checklist-grid">
                  <label className="check-item-box">
                    <input
                      type="checkbox"
                      checked={checklist.needleIntact}
                      onChange={() => handleChecklistToggle('needleIntact')}
                      className="form-checkbox"
                    />
                    <div className="check-item-info">
                      <span className="check-title">Needle & Presser Foot Intact</span>
                      <span className="check-sub">No bent tips, needle secure in bar, correct presser foot mounted</span>
                    </div>
                  </label>

                  <label className="check-item-box">
                    <input
                      type="checkbox"
                      checked={checklist.bobbinCaseClean}
                      onChange={() => handleChecklistToggle('bobbinCaseClean')}
                      className="form-checkbox"
                    />
                    <div className="check-item-info">
                      <span className="check-title">Bobbin Case & Rotary Hook Clean</span>
                      <span className="check-sub">Dust and thread remnants cleared using lint brush</span>
                    </div>
                  </label>

                  <label className="check-item-box">
                    <input
                      type="checkbox"
                      checked={checklist.tensionCalibrated}
                      onChange={() => handleChecklistToggle('tensionCalibrated')}
                      className="form-checkbox"
                    />
                    <div className="check-item-info">
                      <span className="check-title">Thread Tension Calibrated</span>
                      <span className="check-sub">Upper and lower tension dials returned to standard calibration</span>
                    </div>
                  </label>

                  <label className="check-item-box">
                    <input
                      type="checkbox"
                      checked={checklist.accessoriesReturned}
                      onChange={() => handleChecklistToggle('accessoriesReturned')}
                      className="form-checkbox"
                    />
                    <div className="check-item-info">
                      <span className="check-title">Accessories & Foot Pedal Returned</span>
                      <span className="check-sub">Tweezers, hex keys, power cable, and foot pedal verified</span>
                    </div>
                  </label>

                  <label className="check-item-box col-span-2">
                    <input
                      type="checkbox"
                      checked={checklist.workspaceCleaned}
                      onChange={() => handleChecklistToggle('workspaceCleaned')}
                      className="form-checkbox"
                    />
                    <div className="check-item-info">
                      <span className="check-title">Studio Table & Floor Swept</span>
                      <span className="check-sub">Fabric trimmings, pins, and thread scraps deposited in scrap bin</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* CONDITION GRADING */}
              <div className="condition-grade-section">
                <label className="form-label">Overall Return Condition Assessment</label>
                <div className="grade-buttons-row">
                  {[
                    { id: 'EXCELLENT', label: '✨ Excellent', desc: 'Pristine, oiled & clean' },
                    { id: 'GOOD', label: '✅ Good', desc: 'Normal wear, ready for next use' },
                    { id: 'MINOR_ISSUES', label: '⚠️ Minor Issues', desc: 'Needle dull or lint buildup' },
                    { id: 'DAMAGED', label: '❌ Damaged / Flagged', desc: 'Requires technician service' }
                  ].map(g => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setReturnCondition(g.id as any)}
                      className={`grade-btn ${returnCondition === g.id ? 'active' : ''}`}
                    >
                      <span className="grade-title">{g.label}</span>
                      <span className="grade-desc">{g.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* RETURN NOTES & LECTURER VERIFICATION */}
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Student Return Feedback / Fabric Notes</label>
                  <textarea
                    value={studentReturnNotes}
                    onChange={e => setStudentReturnNotes(e.target.value)}
                    rows={2}
                    placeholder="e.g. Worked with 10oz denim; needle replaced with size 16..."
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Lecturer Return Verification Notes</label>
                  <textarea
                    value={lecturerNotes}
                    onChange={e => setLecturerNotes(e.target.value)}
                    rows={2}
                    placeholder="Record notes on machine return condition..."
                    className="form-textarea"
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Return Date & Time</label>
                  <input
                    type="datetime-local"
                    value={returnDateTime}
                    onChange={e => setReturnDateTime(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Verifying Lecturer (Same as Applicant / Lab Supervisor)</label>
                  <select
                    value={verifiedLecturer}
                    onChange={e => setVerifiedLecturer(e.target.value)}
                    className="form-select font-medium"
                  >
                    {lecturers.map(l => (
                      <option key={l.id} value={l.name}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* LECTURER SIGNATURE */}
              <div className="mt-3">
                <SignaturePad
                  label="Lecturer Return Sign-Off & Verification Signature"
                  required
                  onSave={dataUrl => setLecturerSignature(dataUrl)}
                />
              </div>

              {/* ACTION BUTTON */}
              <div className="return-submit-row">
                <button type="submit" className="btn-primary-large">
                  <CheckCircle2 size={18} />
                  <span>Accept Equipment Return & Restore Station Status</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
