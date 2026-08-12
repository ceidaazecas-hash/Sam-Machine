import React from 'react';
import type { BookingRequest } from '../types/lab';
import { 
  X, 
  Printer, 
  Calendar, 
  MapPin, 
  Layers, 
  ShieldCheck,
  Scissors
} from 'lucide-react';
import { formatDate } from '../utils/helpers';

interface BookingPassModalProps {
  request: BookingRequest;
  onClose: () => void;
}

export const BookingPassModal: React.FC<BookingPassModalProps> = ({ request, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog booking-pass-dialog" onClick={e => e.stopPropagation()}>
        {/* Pass Header */}
        <div className="modal-header-actions">
          <button type="button" onClick={handlePrint} className="btn-secondary-sm print-btn">
            <Printer size={15} />
            <span>Print Pass / PDF</span>
          </button>
          <button type="button" onClick={onClose} className="btn-icon-close">
            <X size={18} />
          </button>
        </div>

        {/* Boarding Pass Ticket Container */}
        <div className="pass-ticket printable-area">
          <div className="pass-ticket-top">
            <div className="pass-brand">
              <div className="pass-icon">
                <Scissors size={20} />
              </div>
              <div>
                <h2 className="pass-title">EQUIPMENT ACCESS PASS</h2>
                <p className="pass-subtitle">Textile & Fashion Laboratory Studio</p>
              </div>
            </div>

            <div className="pass-badge-box">
              <span className="pass-id-label">BOOKING REF</span>
              <span className="pass-id-val">{request.id}</span>
            </div>
          </div>

          <div className="pass-ticket-divider">
            <div className="notch notch-left" />
            <div className="dashed-line" />
            <div className="notch notch-right" />
          </div>

          <div className="pass-ticket-body">
            {/* Student Info Block */}
            <div className="pass-section-grid">
              <div className="pass-field">
                <span className="pass-field-label">Student Name</span>
                <span className="pass-field-value font-semibold">{request.applicant.studentName}</span>
              </div>
              <div className="pass-field">
                <span className="pass-field-label">Student ID</span>
                <span className="pass-field-value mono">{request.applicant.studentId}</span>
              </div>
              <div className="pass-field">
                <span className="pass-field-label">Semester / Term</span>
                <span className="pass-field-value">{request.applicant.semester}</span>
              </div>
              <div className="pass-field">
                <span className="pass-field-label">Class / Module</span>
                <span className="pass-field-value">{request.applicant.classModule}</span>
              </div>
            </div>

            {/* Equipment & Room Block */}
            <div className="pass-highlight-box">
              <div className="pass-highlight-item">
                <div className="flex items-center gap-1 text-xs text-muted uppercase">
                  <MapPin size={13} />
                  <span>Facility Room</span>
                </div>
                <div className="pass-highlight-value text-primary">
                  Studio {request.requestDetails.facilityRoom}
                </div>
              </div>

              <div className="pass-highlight-item">
                <div className="flex items-center gap-1 text-xs text-muted uppercase">
                  <Calendar size={13} />
                  <span>Date & Slot</span>
                </div>
                <div className="pass-highlight-value">
                  {formatDate(request.requestDetails.date)}
                  <span className="text-xs block text-muted">
                    {request.requestDetails.startTime} - {request.requestDetails.endTime} ({request.requestDetails.durationHours}h)
                  </span>
                </div>
              </div>

              <div className="pass-highlight-item">
                <div className="flex items-center gap-1 text-xs text-muted uppercase">
                  <Layers size={13} />
                  <span>Assigned Machines</span>
                </div>
                <div className="pass-machine-tags">
                  {request.requestDetails.machineIds.map(mId => (
                    <span key={mId} className="pass-machine-tag">
                      #{mId}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Verification & Signatures */}
            <div className="pass-signatures-row">
              <div className="pass-sig-box">
                <span className="text-xs text-muted">Verified By (Lecturer)</span>
                <div className="font-medium text-sm mt-0.5">{request.applicant.lecturer}</div>
                {request.approval.lecturerSignature && (
                  <img src={request.approval.lecturerSignature} alt="Lecturer Sig" className="pass-sig-img" />
                )}
                <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                  <ShieldCheck size={12} />
                  <span>{request.approval.status === 'IN_USE' || request.approval.status === 'APPROVED' ? 'Approved & Verified' : 'Pending Verification'}</span>
                </div>
              </div>

              <div className="pass-sig-box">
                <span className="text-xs text-muted">Student Agreement Signature</span>
                <div className="font-medium text-sm mt-0.5">{request.applicant.studentName}</div>
                {request.requestDetails.studentSignature && (
                  <img src={request.requestDetails.studentSignature} alt="Student Sig" className="pass-sig-img" />
                )}
                <div className="text-xs text-muted mt-1">Agreement Signed</div>
              </div>

              {/* QR Code Container */}
              <div className="pass-qr-box">
                <div className="simulated-qr">
                  {/* SVG QR Code Pattern */}
                  <svg viewBox="0 0 100 100" width="70" height="70">
                    <rect width="100" height="100" fill="white" />
                    {/* Corners */}
                    <rect x="5" y="5" width="25" height="25" fill="black" />
                    <rect x="8" y="8" width="19" height="19" fill="white" />
                    <rect x="12" y="12" width="11" height="11" fill="black" />

                    <rect x="70" y="5" width="25" height="25" fill="black" />
                    <rect x="73" y="8" width="19" height="19" fill="white" />
                    <rect x="77" y="12" width="11" height="11" fill="black" />

                    <rect x="5" y="70" width="25" height="25" fill="black" />
                    <rect x="8" y="73" width="19" height="19" fill="white" />
                    <rect x="12" y="77" width="11" height="11" fill="black" />

                    {/* Matrix Dots */}
                    <rect x="40" y="10" width="6" height="6" fill="black" />
                    <rect x="55" y="15" width="6" height="6" fill="black" />
                    <rect x="40" y="30" width="6" height="6" fill="black" />
                    <rect x="50" y="45" width="6" height="6" fill="black" />
                    <rect x="35" y="60" width="6" height="6" fill="black" />
                    <rect x="65" y="65" width="6" height="6" fill="black" />
                    <rect x="75" y="40" width="6" height="6" fill="black" />
                    <rect x="85" y="55" width="6" height="6" fill="black" />
                    <rect x="45" y="75" width="6" height="6" fill="black" />
                    <rect x="60" y="85" width="6" height="6" fill="black" />
                  </svg>
                </div>
                <span className="text-[10px] text-muted mono mt-1">SCAN AT DESK</span>
              </div>
            </div>

            {/* Terms Summary */}
            <div className="pass-terms-footer">
              <span className="text-[11px] text-muted">
                ⚠️ Present this pass to lab technician on entry. Clear bobbin case & oil basin before check-out. Report broken needles immediately.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
