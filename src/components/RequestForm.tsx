import React, { useState } from 'react';
import { useLab } from '../context/LabContext';
import type { RoomId } from '../types/lab';
import { INITIAL_SEMESTERS } from '../data/initialData';
import { SignaturePad } from './SignaturePad';
import { 
  Send, 
  Calendar, 
  Clock, 
  User, 
  BookOpen, 
  GraduationCap, 
  AlertCircle
} from 'lucide-react';

export const RequestForm: React.FC = () => {
  const { 
    selectedRoom, 
    setSelectedRoom, 
    lecturers, 
    modules, 
    machines, 
    submitNewRequest, 
    setActivePassRequest,
    showToast 
  } = useLab();

  // Applicant's Information
  const [studentName, setStudentName] = useState('Elena Gilbert');
  const [studentId] = useState('STU-2025-9014');
  const [semester, setSemester] = useState('Semester 3');
  const [classModule, setClassModule] = useState(modules[0] || 'FD204 - Advanced Pattern Drafting');
  const [lecturer, setLecturer] = useState(lecturers[0]?.name || 'Prof. Clara Moreau');

  // Request Details & Dates
  const [date, setDate] = useState('2026-08-13');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('14:00');
  const [durationHours, setDurationHours] = useState(4);
  const [selectedMachineIds, setSelectedMachineIds] = useState<string[]>([]);
  const [purposeNotes, setPurposeNotes] = useState('Pattern drafting and garment sample testing.');

  // Agreement & Signature
  const [agreedToSafety, setAgreedToSafety] = useState(false);
  const [signatureData, setSignatureData] = useState('');
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Separate machines by category
  const roomMachines = machines.filter(m => m.room === selectedRoom);
  const sewingMachines = roomMachines.filter(m => m.type === 'SEWING');
  const overlockingMachines = roomMachines.filter(m => m.type === 'OVERLOCKING');
  const customMachines = roomMachines.filter(m => m.type !== 'SEWING' && m.type !== 'OVERLOCKING');

  const handleMachineToggle = (id: string) => {
    setSelectedMachineIds(prev =>
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    );
  };

  const handleDurationPreset = (hours: number) => {
    setDurationHours(hours);
    const [h, m] = startTime.split(':').map(Number);
    const endH = Math.min(20, h + hours);
    setEndTime(`${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    if (!studentName.trim()) errors.push("Student's name is required.");
    if (!semester) errors.push('Semester is required.');
    if (!classModule) errors.push('Class/Module is required.');
    if (!lecturer) errors.push('Lecturer is required.');
    if (!date) errors.push('Date & Time usage is required.');
    if (selectedMachineIds.length === 0) errors.push('Please select at least one Machine (Sewing or Overlocking).');
    if (!agreedToSafety) errors.push("Student's agreement confirmation is required.");
    if (!signatureData) errors.push("Student's digital signature is required.");

    if (errors.length > 0) {
      setFormErrors(errors);
      showToast(errors[0], 'error');
      return;
    }

    setFormErrors([]);

    const newReq = submitNewRequest({
      applicant: {
        studentName,
        studentId: studentId || 'STU-2026-AUTO',
        semester,
        classModule,
        lecturer
      },
      requestDetails: {
        facilityRoom: selectedRoom,
        date,
        startTime,
        endTime,
        durationHours,
        machineIds: selectedMachineIds,
        purposeNotes,
        studentAgreement: agreedToSafety,
        studentSignature: signatureData,
        submittedAt: new Date().toISOString()
      }
    });

    setActivePassRequest(newReq);
  };

  return (
    <div className="fluid-page-wrapper">
      {/* Intro Header */}
      <div className="page-intro">
        <div>
          <h1 className="page-intro-title">Equipment & Facility Requisition</h1>
          <p className="page-intro-desc">Submit your laboratory and workstation booking for lecturer verification</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="request-dashboard-layout">
        {/* ========================================================
            COLUMN 1: APPLICANT'S INFO & REQUEST DETAILS
           ======================================================== */}
        <div className="dashboard-col">
          {/* Card 1: Applicant's Information */}
          <div className="form-card-container">
            <div className="card-header-minimal">
              <div className="card-title-minimal">
                <span className="card-step-badge">01</span>
                <span>Applicant's Information</span>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-field">
                <label className="field-label">
                  Student's Name <span className="required-dot">*</span>
                </label>
                <div className="input-container">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    value={studentName}
                    onChange={e => setStudentName(e.target.value)}
                    placeholder="Enter student's full name"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">
                  Semester <span className="required-dot">*</span>
                </label>
                <div className="input-container">
                  <GraduationCap size={16} className="input-icon" />
                  <select
                    value={semester}
                    onChange={e => setSemester(e.target.value)}
                    className="form-select"
                    required
                  >
                    {INITIAL_SEMESTERS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">
                  Class / Module <span className="required-dot">*</span>
                </label>
                <div className="input-container">
                  <BookOpen size={16} className="input-icon" />
                  <select
                    value={classModule}
                    onChange={e => setClassModule(e.target.value)}
                    className="form-select"
                    required
                  >
                    {modules.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">
                  Lecturers (In Charge) <span className="required-dot">*</span>
                </label>
                <select
                  value={lecturer}
                  onChange={e => setLecturer(e.target.value)}
                  className="form-select font-semibold"
                  required
                >
                  {lecturers.map(l => (
                    <option key={l.id} value={l.name}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Request Details & Schedule */}
          <div className="form-card-container">
            <div className="card-header-minimal">
              <div className="card-title-minimal">
                <span className="card-step-badge">02</span>
                <span>Request Details & Schedule</span>
              </div>
            </div>

            {/* Facility / Room: 719, 721, 724 */}
            <div className="form-field">
              <label className="field-label">
                Facility / Room <span className="required-dot">*</span>
              </label>
              <div className="room-selection-row">
                {(['719', '721', '724'] as RoomId[]).map(room => (
                  <button
                    key={room}
                    type="button"
                    onClick={() => {
                      setSelectedRoom(room);
                      setSelectedMachineIds([]);
                    }}
                    className={`room-select-btn ${selectedRoom === room ? 'active' : ''}`}
                  >
                    <span className="room-select-name">Studio {room}</span>
                    <span className="room-select-desc">
                      {room === '719' ? 'Sewing & Overlocking' : room === '721' ? 'Apparel Workshop' : 'Creative Studio'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Date Presets */}
            <div className="form-field">
              <label className="field-label">Select Booking Date <span className="required-dot">*</span></label>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
                {[
                  { label: 'Today (Aug 12)', val: '2026-08-12' },
                  { label: 'Tomorrow (Aug 13)', val: '2026-08-13' },
                  { label: 'Friday (Aug 14)', val: '2026-08-14' },
                  { label: 'Next Mon (Aug 17)', val: '2026-08-17' },
                  { label: 'Next Tue (Aug 18)', val: '2026-08-18' }
                ].map(d => (
                  <button
                    key={d.val}
                    type="button"
                    onClick={() => setDate(d.val)}
                    className={`room-chip ${date === d.val ? 'active' : ''}`}
                    style={{ border: date === d.val ? '1px solid var(--text-primary)' : '1px solid var(--border-medium)', color: date === d.val ? '#ffffff' : 'var(--text-primary)', background: date === d.val ? 'var(--text-primary)' : '#ffffff', padding: '0.35rem 0.75rem', fontSize: '0.8rem', fontWeight: 700 }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time Usage */}
            <div className="grid-3">
              <div className="form-field">
                <label className="field-label">
                  Custom Date <span className="required-dot">*</span>
                </label>
                <div className="input-container">
                  <Calendar size={16} className="input-icon" />
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">
                  Start Time <span className="required-dot">*</span>
                </label>
                <div className="input-container">
                  <Clock size={16} className="input-icon" />
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">
                  End Time <span className="required-dot">*</span>
                </label>
                <div className="input-container">
                  <Clock size={16} className="input-icon" />
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Duration Shortcut Chips */}
            <div className="form-field">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-muted">Preset Duration:</span>
                {[2, 3, 4, 6].map(hours => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => handleDurationPreset(hours)}
                    className={`room-chip ${durationHours === hours ? 'active' : ''}`}
                    style={{ border: durationHours === hours ? '1px solid var(--text-primary)' : '1px solid var(--border-medium)', color: durationHours === hours ? '#ffffff' : 'var(--text-primary)', background: durationHours === hours ? 'var(--text-primary)' : '#ffffff', padding: '0.35rem 0.85rem', fontSize: '0.82rem', fontWeight: 700 }}
                  >
                    {hours} Hours
                  </button>
                ))}
              </div>
            </div>

            {/* Purpose Notes */}
            <div className="form-field">
              <label className="field-label">Purpose of Studio Booking</label>
              <textarea
                value={purposeNotes}
                onChange={e => setPurposeNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Assembling collar and sleeves for studio project."
                className="form-textarea"
              />
            </div>
          </div>
        </div>

        {/* ========================================================
            COLUMN 2: MACHINES MATRIX & AGREEMENT SIGNATURE
           ======================================================== */}
        <div className="dashboard-col">
          {/* Card 3: Machine Types & Code */}
          <div className="form-card-container">
            <div className="card-header-minimal">
              <div className="card-title-minimal">
                <span className="card-step-badge">03</span>
                <span>Machine Types & Code (Studio {selectedRoom})</span>
              </div>
            </div>

            {/* Sewing Machine Group */}
            {sewingMachines.length > 0 && (
              <div className="machine-group-container">
                <div className="machine-group-header">
                  <span>🧵 Sewing Machines ({sewingMachines.map(m => m.code).join(', ')})</span>
                  <span className="text-sm text-muted font-normal">{sewingMachines.length} stations in Room {selectedRoom}</span>
                </div>
                <div className="machine-chips-grid">
                  {sewingMachines.map(m => {
                    const isSelected = selectedMachineIds.includes(m.id);
                    const isAvail = m.status === 'AVAILABLE';
                    return (
                      <button
                        key={m.id}
                        type="button"
                        disabled={!isAvail && !isSelected}
                        onClick={() => handleMachineToggle(m.id)}
                        className={`machine-chip-card ${isSelected ? 'selected' : ''} ${!isAvail && !isSelected ? 'disabled' : ''}`}
                      >
                        <span className="chip-code">#{m.code}</span>
                        <span className="chip-status-text">
                          {isSelected ? 'Selected' : isAvail ? 'Available' : m.status}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Overlocking Machine Group */}
            {overlockingMachines.length > 0 && (
              <div className="machine-group-container">
                <div className="machine-group-header">
                  <span>⚙️ Overlocking Machines ({overlockingMachines.map(m => m.code).join(', ')})</span>
                  <span className="text-sm text-muted font-normal">{overlockingMachines.length} stations in Room {selectedRoom}</span>
                </div>
                <div className="machine-chips-grid">
                  {overlockingMachines.map(m => {
                    const isSelected = selectedMachineIds.includes(m.id);
                    const isAvail = m.status === 'AVAILABLE';
                    return (
                      <button
                        key={m.id}
                        type="button"
                        disabled={!isAvail && !isSelected}
                        onClick={() => handleMachineToggle(m.id)}
                        className={`machine-chip-card ${isSelected ? 'selected' : ''} ${!isAvail && !isSelected ? 'disabled' : ''}`}
                      >
                        <span className="chip-code">#{m.code}</span>
                        <span className="chip-status-text">
                          {isSelected ? 'Selected' : isAvail ? 'Available' : m.status}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom / Additional Equipment */}
            {customMachines.length > 0 && (
              <div className="machine-group-container">
                <div className="machine-group-header">
                  <span>✨ Additional Studio Equipment</span>
                  <span className="text-sm text-muted font-normal">{customMachines.length} stations in Room {selectedRoom}</span>
                </div>
                <div className="machine-chips-grid">
                  {customMachines.map(m => {
                    const isSelected = selectedMachineIds.includes(m.id);
                    const isAvail = m.status === 'AVAILABLE';
                    return (
                      <button
                        key={m.id}
                        type="button"
                        disabled={!isAvail && !isSelected}
                        onClick={() => handleMachineToggle(m.id)}
                        className={`machine-chip-card ${isSelected ? 'selected' : ''} ${!isAvail && !isSelected ? 'disabled' : ''}`}
                      >
                        <span className="chip-code">#{m.code}</span>
                        <span className="chip-status-text">
                          {isSelected ? 'Selected' : isAvail ? 'Available' : m.status}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Card 4: Agreement, Signature & Submit */}
          <div className="form-card-container">
            <div className="card-header-minimal">
              <div className="card-title-minimal">
                <span className="card-step-badge">04</span>
                <span>Student's Agreement & Sign-Off</span>
              </div>
            </div>

            <div className="agreement-card">
              <label className="agreement-label">
                <input
                  type="checkbox"
                  checked={agreedToSafety}
                  onChange={e => setAgreedToSafety(e.target.checked)}
                  className="checkbox-minimal"
                  required
                />
                <span className="agreement-text">
                  <strong>Student's Agreement:</strong> I confirm that I will follow all laboratory safety rules, operate the allocated machine carefully, clean the station after usage, and return the equipment on time for verification.
                </span>
              </label>
            </div>

            <div className="signature-wrapper">
              <SignaturePad
                label="Student's Digital Signature"
                required
                onSave={sig => setSignatureData(sig)}
              />
            </div>

            {/* Lecturer Approval Status */}
            <div className="status-banner-subtle">
              <div>
                <span className="font-bold text-slate-800" style={{ display: 'block', marginBottom: '0.2rem' }}>
                  Lecturer Approval Workflow
                </span>
                <span className="text-slate-600">
                  Pending verification by <strong>{lecturer}</strong>
                </span>
              </div>
              <span className="status-tag-amber">PENDING APPROVAL</span>
            </div>

            {/* Error Banner */}
            {formErrors.length > 0 && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded flex items-center gap-2 text-sm">
                <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />
                <span>{formErrors[0]}</span>
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" className="btn-submit-primary">
              <Send size={16} />
              <span>SUBMIT REQUEST</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
