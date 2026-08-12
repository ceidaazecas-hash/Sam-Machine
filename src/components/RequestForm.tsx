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
    <div className="main-content-area">
      {/* Intro Header */}
      <div className="page-intro">
        <span className="page-intro-badge">REQUEST</span>
        <h1 className="page-intro-title">Equipment & Facility Requisition</h1>
        <p className="page-intro-desc">Fill out your studio booking details below for lecturer verification</p>
      </div>

      <form onSubmit={handleSubmit} className="form-card-container">
        {/* ========================================================
            SECTION 1: APPLICANT'S INFORMATION
           ======================================================== */}
        <div className="form-section-block">
          <div className="form-section-header">
            <div className="form-section-num">1</div>
            <h2 className="form-section-title">Applicant's Information</h2>
          </div>

          <div className="grid-2">
            <div className="form-field">
              <label className="field-label">
                <span className="field-label-text">Student's Name <span className="required-dot">*</span></span>
              </label>
              <div className="input-container">
                <User size={15} className="input-icon" />
                <input
                  type="text"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  placeholder="Enter full name"
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label className="field-label">
                <span className="field-label-text">Semester <span className="required-dot">*</span></span>
              </label>
              <div className="input-container">
                <GraduationCap size={15} className="input-icon" />
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
                <span className="field-label-text">Class / Module <span className="required-dot">*</span></span>
              </label>
              <div className="input-container">
                <BookOpen size={15} className="input-icon" />
                <select
                  value={classModule}
                  onChange={e => setClassModule(e.target.value)}
                  className="form-select"
                  required
                >
                  {INITIAL_MODULES.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-field">
              <label className="field-label">
                <span className="field-label-text">Lecturers (In Charge) <span className="required-dot">*</span></span>
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

        {/* ========================================================
            SECTION 2: REQUEST DETAILS
           ======================================================== */}
        <div className="form-section-block">
          <div className="form-section-header">
            <div className="form-section-num">2</div>
            <h2 className="form-section-title">Request Details</h2>
          </div>

          {/* Facility / Room: 719, 721, 724 */}
          <div className="form-field">
            <label className="field-label">
              <span className="field-label-text">Facility / Room <span className="required-dot">*</span></span>
            </label>
            <div className="room-cards-grid">
              {(['719', '721', '724'] as RoomId[]).map(room => (
                <button
                  key={room}
                  type="button"
                  onClick={() => {
                    setSelectedRoom(room);
                    setSelectedMachineIds([]);
                  }}
                  className={`room-card-btn ${selectedRoom === room ? 'active' : ''}`}
                >
                  <MapPin size={18} />
                  <div>
                    <div className="room-card-title">Studio {room}</div>
                    <div className="room-card-sub">
                      {room === '719' ? 'Sewing & Overlocking' : room === '721' ? 'Apparel Workshop' : 'Creative Studio'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time Usage */}
          <div className="grid-3">
            <div className="form-field">
              <label className="field-label">
                <span className="field-label-text">Usage Date <span className="required-dot">*</span></span>
              </label>
              <div className="input-container">
                <Calendar size={15} className="input-icon" />
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
                <span className="field-label-text">Start Time <span className="required-dot">*</span></span>
              </label>
              <div className="input-container">
                <Clock size={15} className="input-icon" />
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
                <span className="field-label-text">End Time <span className="required-dot">*</span></span>
              </label>
              <div className="input-container">
                <Clock size={15} className="input-icon" />
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

          {/* Duration Chips */}
          <div className="form-field">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted">Preset Duration:</span>
              {[2, 3, 4, 6].map(hours => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => handleDurationPreset(hours)}
                  className={`room-chip ${durationHours === hours ? 'active' : ''}`}
                  style={{ border: '1px solid #e2e8f0', color: durationHours === hours ? '#ffffff' : '#334155', background: durationHours === hours ? '#09090b' : '#f8fafc' }}
                >
                  {hours} hrs
                </button>
              ))}
            </div>
          </div>

          {/* Machine types & Code: Sewing (2401-2416) & Overlocking (2101-2102) */}
          <div className="form-field mt-2">
            <label className="field-label">
              <span className="field-label-text">Machine Types & Code (Studio {selectedRoom}) <span className="required-dot">*</span></span>
            </label>

            <div className="machine-selector-box">
              {/* Sewing Machine Group */}
              <div className="mb-3">
                <div className="machine-group-heading">
                  <span>🧵 Sewing Machine (Codes 2401 – 2416)</span>
                  <span className="text-xs text-muted font-normal">{sewingMachines.length} stations in Room {selectedRoom}</span>
                </div>
                <div className="machine-grid-chips">
                  {sewingMachines.map(m => {
                    const isSelected = selectedMachineIds.includes(m.id);
                    const isAvail = m.status === 'AVAILABLE';
                    return (
                      <button
                        key={m.id}
                        type="button"
                        disabled={!isAvail && !isSelected}
                        onClick={() => handleMachineToggle(m.id)}
                        className={`machine-chip-btn ${isSelected ? 'selected' : ''} ${!isAvail && !isSelected ? 'disabled' : ''}`}
                      >
                        <span className="chip-code">#{m.code}</span>
                        <span className="chip-status">
                          {isSelected ? 'Selected' : isAvail ? 'Available' : m.status}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Overlocking Machine Group */}
              {overlockingMachines.length > 0 && (
                <div className="pt-3 border-t border-slate-200">
                  <div className="machine-group-heading">
                    <span>⚙️ Overlocking Machine (Codes 2101 – 2102)</span>
                    <span className="text-xs text-muted font-normal">{overlockingMachines.length} stations in Room {selectedRoom}</span>
                  </div>
                  <div className="machine-grid-chips">
                    {overlockingMachines.map(m => {
                      const isSelected = selectedMachineIds.includes(m.id);
                      const isAvail = m.status === 'AVAILABLE';
                      return (
                        <button
                          key={m.id}
                          type="button"
                          disabled={!isAvail && !isSelected}
                          onClick={() => handleMachineToggle(m.id)}
                          className={`machine-chip-btn ${isSelected ? 'selected' : ''} ${!isAvail && !isSelected ? 'disabled' : ''}`}
                        >
                          <span className="chip-code">#{m.code}</span>
                          <span className="chip-status">
                            {isSelected ? 'Selected' : isAvail ? 'Available' : m.status}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Verified by: Lecturer's name */}
          <div className="form-field mt-3">
            <label className="field-label">
              <span className="field-label-text">Verified by Lecturer</span>
            </label>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800 text-sm">{lecturer}</span>
              <span className="text-muted">Designated faculty reviewer</span>
            </div>
          </div>
        </div>

        {/* ========================================================
            SECTION 3: STUDENT'S AGREEMENT & LECTURER APPROVAL
           ======================================================== */}
        <div className="form-section-block">
          <div className="form-section-header">
            <div className="form-section-num">3</div>
            <h2 className="form-section-title">Student's Agreement & Lecturer Approval</h2>
          </div>

          <div className="agreement-container">
            <label className="agreement-label">
              <input
                type="checkbox"
                checked={agreedToSafety}
                onChange={e => setAgreedToSafety(e.target.checked)}
                className="checkbox-clean"
                required
              />
              <span className="agreement-statement">
                <strong>Student's Agreement:</strong> I confirm that I will abide by all studio laboratory safety protocols, handle the allocated machine with care, maintain needle & thread cleanliness, and return the equipment on schedule for condition verification.
              </span>
            </label>
          </div>

          <div className="signature-card">
            <SignaturePad
              label="Student's Digital Signature"
              required
              onSave={sig => setSignatureData(sig)}
            />
          </div>

          {/* Lecturer Approval Status */}
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-amber-900 block">Lecturer Approval Status</span>
              <span className="text-amber-800">Pending review by <strong>{lecturer}</strong></span>
            </div>
            <span className="status-badge-chip badge-amber">PENDING APPROVAL</span>
          </div>
        </div>

        {/* Error Banner */}
        {formErrors.length > 0 && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-md flex items-start gap-2 text-xs">
            <AlertCircle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
            <div>{formErrors[0]}</div>
          </div>
        )}

        {/* Submit Button */}
        <button type="submit" className="btn-primary-action">
          <Send size={16} />
          <span>SUBMIT REQUEST</span>
        </button>
      </form>
    </div>
  );
};
