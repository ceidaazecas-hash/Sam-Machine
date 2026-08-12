import React, { useState } from 'react';
import { useLab } from '../context/LabContext';
import type { RoomId } from '../types/lab';
import { INITIAL_MODULES, INITIAL_SEMESTERS } from '../data/initialData';
import { SignaturePad } from './SignaturePad';
import { RoomFloorPlan } from './RoomFloorPlan';
import { 
  Send, 
  Sparkles, 
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

  // Form State
  const [studentName, setStudentName] = useState('Elena Gilbert');
  const [studentId, setStudentId] = useState('STU-2025-9014');
  const [semester, setSemester] = useState('Semester 3');
  const [classModule, setClassModule] = useState('FD204 - Advanced Pattern Drafting');
  const [lecturer, setLecturer] = useState('Prof. Clara Moreau');
  const [email] = useState('elena.gilbert@student.fashion-institute.edu');
  const [contactNumber] = useState('+1 (555) 345-6789');

  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  });

  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('14:00');
  const [durationHours, setDurationHours] = useState(4);
  const [selectedMachineIds, setSelectedMachineIds] = useState<string[]>(['2404']);
  const [purposeNotes, setPurposeNotes] = useState('Draping and constructing tailored bodice with silk lining.');
  const [agreedToSafety, setAgreedToSafety] = useState(false);
  const [signatureData, setSignatureData] = useState('');
  const [formErrors, setFormErrors] = useState<string[]>([]);

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

  const handleQuickFill = () => {
    setStudentName('Julian Sterling');
    setStudentId('STU-2024-5519');
    setSemester('Semester 4');
    setClassModule('FD302 - Haute Couture Finishing');
    setLecturer('Assoc. Prof. Elena Rostova');
    setPurposeNotes('Assembling complex sleeve cuffs and bias bound neckline.');
    setAgreedToSafety(true);
    showToast('Demo student details populated.', 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    if (!studentName.trim()) errors.push('Student Name is required.');
    if (!studentId.trim()) errors.push('Student ID is required.');
    if (!semester) errors.push('Semester is required.');
    if (!classModule) errors.push('Class/Module is required.');
    if (!lecturer) errors.push('Lecturer in charge is required.');
    if (!date) errors.push('Usage Date is required.');
    if (selectedMachineIds.length === 0) errors.push('Please select at least one machine.');
    if (!agreedToSafety) errors.push('You must agree to the Studio Laboratory Safety Declaration.');
    if (!signatureData) errors.push('Student digital signature is required.');

    if (errors.length > 0) {
      setFormErrors(errors);
      showToast(errors[0], 'error');
      return;
    }

    setFormErrors([]);

    const newReq = submitNewRequest({
      applicant: {
        studentName,
        studentId,
        semester,
        classModule,
        lecturer,
        email,
        contactNumber
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

    // Open booking pass for the student
    setActivePassRequest(newReq);
  };

  return (
    <div className="request-flow-container">
      {/* Top Banner */}
      <div className="page-header-card">
        <div className="page-header-content">
          <div className="header-badge">
            <Sparkles size={14} />
            <span>Equipment Booking Workflow</span>
          </div>
          <h1 className="page-title">Request Studio Equipment & Workspace</h1>
          <p className="page-description">
            Reserve industrial sewing stations (2401–2416) and high-speed overlockers (2101–2102) across Studios 719, 721, and 724.
          </p>
        </div>

        <div className="header-quick-actions">
          <button type="button" onClick={handleQuickFill} className="btn-secondary-sm">
            <Sparkles size={14} />
            <span>Auto-fill Demo Data</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Form + Right Floorplan */}
      <div className="request-grid">
        {/* Left Column: Comprehensive Form */}
        <form onSubmit={handleSubmit} className="form-card">
          {/* Section 1: Applicant Information */}
          <div className="form-section">
            <div className="section-title-row">
              <div className="section-step-num">1</div>
              <div>
                <h3 className="section-title">Applicant Information</h3>
                <p className="section-desc">Personal and academic enrolment details</p>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">
                  Student Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="input-icon-wrapper">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    value={studentName}
                    onChange={e => setStudentName(e.target.value)}
                    placeholder="e.g. Elena Gilbert"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Student Matrix / ID <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  placeholder="e.g. STU-2025-9014"
                  className="form-input mono"
                  required
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">
                  Academic Semester <span className="text-rose-400">*</span>
                </label>
                <div className="input-icon-wrapper">
                  <GraduationCap size={16} className="input-icon" />
                  <select
                    value={semester}
                    onChange={e => setSemester(e.target.value)}
                    className="form-select"
                  >
                    {INITIAL_SEMESTERS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Class / Module <span className="text-rose-400">*</span>
                </label>
                <div className="input-icon-wrapper">
                  <BookOpen size={16} className="input-icon" />
                  <select
                    value={classModule}
                    onChange={e => setClassModule(e.target.value)}
                    className="form-select"
                  >
                    {INITIAL_MODULES.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Lecturer in Charge (Verifier) <span className="text-rose-400">*</span>
              </label>
              <select
                value={lecturer}
                onChange={e => setLecturer(e.target.value)}
                className="form-select font-medium"
              >
                {lecturers.map(l => (
                  <option key={l.id} value={l.name}>
                    {l.name} ({l.department})
                  </option>
                ))}
              </select>
              <span className="form-helper">
                This lecturer will receive and approve your equipment booking request.
              </span>
            </div>
          </div>

          {/* Section 2: Request Facility & Machines */}
          <div className="form-section">
            <div className="section-title-row">
              <div className="section-step-num">2</div>
              <div>
                <h3 className="section-title">Facility & Equipment Details</h3>
                <p className="section-desc">Choose studio room, date slot, and machine codes</p>
              </div>
            </div>

            {/* Room Selector Pills */}
            <div className="form-group">
              <label className="form-label">
                Facility / Studio Room <span className="text-rose-400">*</span>
              </label>
              <div className="room-buttons-row">
                {(['719', '721', '724'] as RoomId[]).map(room => {
                  const count = machines.filter(m => m.room === room && m.status === 'AVAILABLE').length;
                  return (
                    <button
                      key={room}
                      type="button"
                      className={`room-select-card ${selectedRoom === room ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedRoom(room);
                        setSelectedMachineIds([]);
                      }}
                    >
                      <MapPin size={18} className="room-card-icon" />
                      <div className="room-card-info">
                        <div className="room-card-name">Studio {room}</div>
                        <div className="room-card-avail">{count} machines ready</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date & Time Row */}
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Usage Date <span className="text-rose-400">*</span></label>
                <div className="input-icon-wrapper">
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

              <div className="form-group">
                <label className="form-label">Start Time <span className="text-rose-400">*</span></label>
                <div className="input-icon-wrapper">
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

              <div className="form-group">
                <label className="form-label">End Time <span className="text-rose-400">*</span></label>
                <div className="input-icon-wrapper">
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

            {/* Quick Duration Chips */}
            <div className="duration-preset-row">
              <span className="text-xs text-muted">Quick Slot:</span>
              {[2, 3, 4, 6].map(hours => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => handleDurationPreset(hours)}
                  className={`chip-btn ${durationHours === hours ? 'active' : ''}`}
                >
                  {hours} Hours
                </button>
              ))}
            </div>

            {/* Machine Selection Grid / Chips */}
            <div className="form-group mt-3">
              <label className="form-label flex justify-between items-center">
                <span>
                  Select Machines (Room {selectedRoom}) <span className="text-rose-400">*</span>
                </span>
                <span className="text-xs text-muted">
                  {selectedMachineIds.length} machine(s) selected
                </span>
              </label>

              <div className="machine-chips-grid">
                {machines
                  .filter(m => m.room === selectedRoom)
                  .map(m => {
                    const isSelected = selectedMachineIds.includes(m.id);
                    const isAvail = m.status === 'AVAILABLE';
                    return (
                      <button
                        key={m.id}
                        type="button"
                        disabled={!isAvail && !isSelected}
                        onClick={() => handleMachineToggle(m.id)}
                        className={`machine-select-chip ${isSelected ? 'selected' : ''} ${!isAvail && !isSelected ? 'disabled' : ''}`}
                      >
                        <div className="chip-code">
                          <span className="chip-type-tag">
                            {m.type === 'SEWING' ? 'SEW' : 'OVK'}
                          </span>
                          <span>#{m.code}</span>
                        </div>
                        <span className="chip-model-name">{m.model.split(' ')[0]}</span>
                        {!isAvail && !isSelected && (
                          <span className="chip-status-unavail">{m.status}</span>
                        )}
                      </button>
                    );
                  })}
              </div>
              <span className="form-helper">
                Tip: Sewing machines (2401–2416) & Overlockers (2101–2102). You can also click directly on the interactive floor map on the right.
              </span>
            </div>

            {/* Purpose Notes */}
            <div className="form-group">
              <label className="form-label">Project / Usage Objective</label>
              <textarea
                value={purposeNotes}
                onChange={e => setPurposeNotes(e.target.value)}
                rows={2}
                placeholder="Briefly describe fabric type and garment pieces you are assembling..."
                className="form-textarea"
              />
            </div>
          </div>

          {/* Section 3: Student Agreement & Digital Signature */}
          <div className="form-section">
            <div className="section-title-row">
              <div className="section-step-num">3</div>
              <div>
                <h3 className="section-title">Student Agreement & Signature</h3>
                <p className="section-desc">Safety declaration and equipment responsibility sign-off</p>
              </div>
            </div>

            <div className="agreement-box">
              <label className="agreement-checkbox-label">
                <input
                  type="checkbox"
                  checked={agreedToSafety}
                  onChange={e => setAgreedToSafety(e.target.checked)}
                  className="form-checkbox"
                />
                <span className="agreement-text">
                  I agree to operate all textile equipment safely, wear required eye protection when sewing heavy materials, promptly report any needle breakage or thread tension defects, clean the station upon return, and return all accessories to the lab technician on time.
                </span>
              </label>
            </div>

            <div className="mt-3">
              <SignaturePad
                label="Applicant Student Digital Signature"
                required
                onSave={dataUrl => setSignatureData(dataUrl)}
              />
            </div>
          </div>

          {/* Error Summary */}
          {formErrors.length > 0 && (
            <div className="form-error-banner">
              <AlertCircle size={18} />
              <div className="error-list">
                {formErrors.map((err, i) => (
                  <div key={i}>{err}</div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="form-submit-row">
            <button type="submit" className="btn-primary-large">
              <Send size={18} />
              <span>Submit Application for Lecturer Verification</span>
            </button>
          </div>
        </form>

        {/* Right Column: Studio 2D Floor Plan Visualizer */}
        <div className="floorplan-sidebar">
          <RoomFloorPlan
            selectedMachineIds={selectedMachineIds}
            onSelectMachine={handleMachineToggle}
            interactiveSelect={true}
          />
        </div>
      </div>
    </div>
  );
};
