import React, { useState } from 'react';
import { useLab } from '../context/LabContext';
import type { RoomId } from '../types/lab';
import { INITIAL_MODULES, INITIAL_SEMESTERS } from '../data/initialData';
import { SignaturePad } from './SignaturePad';
import { 
  Send, 
  Calendar, 
  Clock, 
  MapPin, 
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
    machines, 
    submitNewRequest, 
    setActivePassRequest,
    setActiveTab,
    showToast 
  } = useLab();

  // Applicant's Information
  const [studentName, setStudentName] = useState('Elena Gilbert');
  const [studentId] = useState('STU-2025-9014');
  const [semester, setSemester] = useState('Semester 3');
  const [classModule, setClassModule] = useState('FD204 - Advanced Pattern Drafting');
  const [lecturer, setLecturer] = useState('Prof. Clara Moreau');

  // Request Details
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('14:00');
  const [durationHours, setDurationHours] = useState(4);
  const [selectedMachineIds, setSelectedMachineIds] = useState<string[]>(['2404']);

  // Agreement & Signature
  const [agreedToSafety, setAgreedToSafety] = useState(false);
  const [signatureData, setSignatureData] = useState('');
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Sewing Machines (2401 - 2416) & Overlocking Machines (2101 - 2102)
  const roomMachines = machines.filter(m => m.room === selectedRoom);
  const sewingMachines = roomMachines.filter(m => m.type === 'SEWING');
  const overlockingMachines = roomMachines.filter(m => m.type === 'OVERLOCKING');

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
        studentAgreement: agreedToSafety,
        studentSignature: signatureData,
        submittedAt: new Date().toISOString()
      }
    });

    setActivePassRequest(newReq);
  };

  return (
    <div className="simple-section-container">
      {/* Header Banner */}
      <div className="section-title-card">
        <div>
          <div className="section-badge">REQUEST</div>
          <h1 className="section-heading">Equipment & Facility Request Form</h1>
          <p className="section-subheading">Submit your equipment booking for instructor verification</p>
        </div>

        {/* Quick Mode Switcher */}
        <div className="workflow-toggle-box">
          <span className="text-xs text-muted font-bold mr-1">Switch:</span>
          <button
            type="button"
            className="toggle-chip active"
          >
            Request
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('RETURN')}
            className="toggle-chip"
          >
            Return
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="clean-form-card">
        {/* ========================================================
            1. APPLICANT'S INFORMATION
           ======================================================== */}
        <div className="form-block">
          <h2 className="block-title">Applicant's Information</h2>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="field-label">
                Student's Name <span className="req-star">*</span>
              </label>
              <div className="input-with-icon">
                <User size={16} className="field-icon" />
                <input
                  type="text"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  placeholder="Enter student's full name"
                  className="clean-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="field-label">
                Semester <span className="req-star">*</span>
              </label>
              <div className="input-with-icon">
                <GraduationCap size={16} className="field-icon" />
                <select
                  value={semester}
                  onChange={e => setSemester(e.target.value)}
                  className="clean-select"
                  required
                >
                  {INITIAL_SEMESTERS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="field-label">
                Class / Module <span className="req-star">*</span>
              </label>
              <div className="input-with-icon">
                <BookOpen size={16} className="field-icon" />
                <select
                  value={classModule}
                  onChange={e => setClassModule(e.target.value)}
                  className="clean-select"
                  required
                >
                  {INITIAL_MODULES.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="field-label">
                Lecturers (In Charge) <span className="req-star">*</span>
              </label>
              <select
                value={lecturer}
                onChange={e => setLecturer(e.target.value)}
                className="clean-select font-semibold"
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

        {/* ========================================================
            2. REQUEST DETAILS
           ======================================================== */}
        <div className="form-block">
          <h2 className="block-title">Request Details</h2>

          {/* Facility / Room: 719, 721, 724 */}
          <div className="form-group">
            <label className="field-label">
              Facility / Room <span className="req-star">*</span>
            </label>
            <div className="room-pills-row">
              {(['719', '721', '724'] as RoomId[]).map(room => (
                <button
                  key={room}
                  type="button"
                  onClick={() => {
                    setSelectedRoom(room);
                    setSelectedMachineIds([]);
                  }}
                  className={`room-pill-btn ${selectedRoom === room ? 'active' : ''}`}
                >
                  <MapPin size={16} />
                  <span>Room {room}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time Usage */}
          <div className="form-grid-3">
            <div className="form-group">
              <label className="field-label">
                Usage Date <span className="req-star">*</span>
              </label>
              <div className="input-with-icon">
                <Calendar size={16} className="field-icon" />
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="clean-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="field-label">
                Start Time <span className="req-star">*</span>
              </label>
              <div className="input-with-icon">
                <Clock size={16} className="field-icon" />
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="clean-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="field-label">
                End Time <span className="req-star">*</span>
              </label>
              <div className="input-with-icon">
                <Clock size={16} className="field-icon" />
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="clean-input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Duration Shortcut Chips */}
          <div className="duration-row">
            <span className="text-xs text-muted font-semibold">Duration:</span>
            {[2, 3, 4, 6].map(hours => (
              <button
                key={hours}
                type="button"
                onClick={() => handleDurationPreset(hours)}
                className={`duration-chip ${durationHours === hours ? 'active' : ''}`}
              >
                {hours} Hours
              </button>
            ))}
          </div>

          {/* Machine types & Code: Sewing (2401-2416) & Overlocking (2101-2102) */}
          <div className="form-group mt-4">
            <label className="field-label">
              Machine Types & Code (Room {selectedRoom}) <span className="req-star">*</span>
            </label>

            {/* Sewing Machines */}
            <div className="machine-group-box">
              <div className="machine-group-header">
                <span className="machine-group-title">🧵 Sewing Machine (Codes 2401 – 2416)</span>
                <span className="text-xs text-muted">{sewingMachines.length} stations in Room {selectedRoom}</span>
              </div>
              <div className="machines-grid">
                {sewingMachines.map(m => {
                  const isSelected = selectedMachineIds.includes(m.id);
                  const isAvail = m.status === 'AVAILABLE';
                  return (
                    <button
                      key={m.id}
                      type="button"
                      disabled={!isAvail && !isSelected}
                      onClick={() => handleMachineToggle(m.id)}
                      className={`machine-code-btn ${isSelected ? 'selected' : ''} ${!isAvail && !isSelected ? 'disabled' : ''}`}
                    >
                      <span className="machine-code-num">#{m.code}</span>
                      <span className="machine-status-tag">
                        {isSelected ? 'Selected' : isAvail ? 'Available' : m.status}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Overlocking Machines */}
            {overlockingMachines.length > 0 && (
              <div className="machine-group-box mt-3">
                <div className="machine-group-header">
                  <span className="machine-group-title">⚙️ Overlocking Machine (Codes 2101 – 2102)</span>
                  <span className="text-xs text-muted">{overlockingMachines.length} stations in Room {selectedRoom}</span>
                </div>
                <div className="machines-grid">
                  {overlockingMachines.map(m => {
                    const isSelected = selectedMachineIds.includes(m.id);
                    const isAvail = m.status === 'AVAILABLE';
                    return (
                      <button
                        key={m.id}
                        type="button"
                        disabled={!isAvail && !isSelected}
                        onClick={() => handleMachineToggle(m.id)}
                        className={`machine-code-btn ${isSelected ? 'selected' : ''} ${!isAvail && !isSelected ? 'disabled' : ''}`}
                      >
                        <span className="machine-code-num">#{m.code}</span>
                        <span className="machine-status-tag">
                          {isSelected ? 'Selected' : isAvail ? 'Available' : m.status}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Verified by: Lecturer's name */}
          <div className="form-group mt-3">
            <label className="field-label">Verified by Lecturer</label>
            <div className="verified-by-display">
              <span className="font-semibold">{lecturer}</span>
              <span className="text-xs text-muted">Designated faculty reviewer</span>
            </div>
          </div>
        </div>

        {/* ========================================================
            3. STUDENT'S AGREEMENT & LECTURER APPROVAL
           ======================================================== */}
        <div className="form-block">
          <h2 className="block-title">Student's Agreement & Lecturer Approval</h2>

          <div className="agreement-clean-box">
            <label className="agreement-label">
              <input
                type="checkbox"
                checked={agreedToSafety}
                onChange={e => setAgreedToSafety(e.target.checked)}
                className="clean-checkbox"
                required
              />
              <span className="agreement-text">
                <strong>Student's agreement:</strong> I confirm that I will follow all laboratory safety rules, operate the allocated machine carefully, clean the station after usage, and return the equipment on time for verification.
              </span>
            </label>
          </div>

          <div className="mt-3">
            <SignaturePad
              label="Student's Digital Signature"
              required
              onSave={sig => setSignatureData(sig)}
            />
          </div>

          {/* Lecturer Approval Info Box */}
          <div className="lecturer-approval-status-box mt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Lecturer Approval Workflow</span>
              <span className="status-pill-amber">Pending Lecturer Verification</span>
            </div>
            <p className="text-xs text-muted mt-1">
              Upon submission, your application will be routed to <strong>{lecturer}</strong> for review and approval.
            </p>
          </div>
        </div>

        {/* Error List */}
        {formErrors.length > 0 && (
          <div className="error-banner">
            <AlertCircle size={18} />
            <div>
              {formErrors.map((err, i) => (
                <div key={i}>{err}</div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Action */}
        <div className="form-submit-block">
          <button type="submit" className="btn-submit-main">
            <Send size={18} />
            <span>SUBMIT REQUEST</span>
          </button>
        </div>
      </form>
    </div>
  );
};
