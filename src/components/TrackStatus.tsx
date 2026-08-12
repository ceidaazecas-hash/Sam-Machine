import React, { useState } from 'react';
import { useLab } from '../context/LabContext';
import type { BookingRequest, RequestStatus } from '../types/lab';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  Ticket, 
  FileCheck,
  Filter
} from 'lucide-react';
import { formatDate } from '../utils/helpers';

export const TrackStatus: React.FC = () => {
  const { requests, setActivePassRequest } = useLab();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | RequestStatus>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'UPCOMING' | 'PAST'>('ALL');
  const [selectedReqId, setSelectedReqId] = useState<string>(requests[0]?.id || '');

  // Filter requests
  const filteredRequests = requests.filter(r => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = 
      !q ||
      r.id.toLowerCase().includes(q) ||
      r.applicant.studentName.toLowerCase().includes(q) ||
      r.applicant.studentId.toLowerCase().includes(q) ||
      r.applicant.classModule.toLowerCase().includes(q) ||
      r.applicant.lecturer.toLowerCase().includes(q) ||
      r.requestDetails.facilityRoom.includes(q) ||
      r.requestDetails.machineIds.some(m => m.includes(q));

    const matchesStatus = statusFilter === 'ALL' || r.approval.status === statusFilter;

    const reqDate = r.requestDetails.date;
    const todayStr = '2026-08-12'; // benchmark demo date
    let matchesDate = true;
    if (dateFilter === 'TODAY') {
      matchesDate = reqDate === todayStr;
    } else if (dateFilter === 'UPCOMING') {
      matchesDate = reqDate > todayStr;
    } else if (dateFilter === 'PAST') {
      matchesDate = reqDate < todayStr || r.approval.status === 'RETURNED';
    }

    return matchesQuery && matchesStatus && matchesDate;
  });

  const selectedRequest: BookingRequest | undefined = 
    requests.find(r => r.id === selectedReqId) || filteredRequests[0];

  // Helper for Stepper stages
  const getStepState = (req: BookingRequest, step: 1 | 2 | 3 | 4) => {
    const status = req.approval.status;
    if (step === 1) return 'completed';
    if (step === 2) {
      if (status === 'REJECTED') return 'rejected';
      if (status === 'PENDING') return 'current';
      return 'completed';
    }
    if (step === 3) {
      if (status === 'PENDING' || status === 'REJECTED') return 'upcoming';
      if (status === 'IN_USE' || status === 'APPROVED') return 'current';
      return 'completed';
    }
    if (step === 4) {
      if (status === 'RETURNED') return 'completed';
      return 'upcoming';
    }
    return 'upcoming';
  };

  return (
    <div className="fluid-page-wrapper">
      {/* Page Intro */}
      <div className="page-intro">
        <div>
          <h1 className="page-intro-title">Live Equipment & Request Tracker</h1>
          <p className="page-intro-desc">Track student booking progress, lecturer approvals, and return inspection records</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="form-card-container" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div className="input-container" style={{ maxWidth: '380px', flex: 1 }}>
            <Search size={16} className="input-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Student, ID (REQ-2026-...), or Room..."
              className="form-input"
              style={{ minHeight: '40px', paddingLeft: '2.4rem' }}
            />
          </div>

          {/* Quick Status Filter Pills */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <Filter size={12} /> Status:
            </span>

            {[
              { id: 'ALL', label: 'All Requests' },
              { id: 'IN_USE', label: 'In Studio Usage' },
              { id: 'PENDING', label: 'Pending' },
              { id: 'APPROVED', label: 'Approved' },
              { id: 'RETURNED', label: 'Returned' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as any)}
                className={`room-chip ${statusFilter === tab.id ? 'active' : ''}`}
                style={{ border: statusFilter === tab.id ? '1px solid var(--text-primary)' : '1px solid var(--border-medium)', color: statusFilter === tab.id ? '#ffffff' : 'var(--text-primary)', background: statusFilter === tab.id ? 'var(--text-primary)' : '#ffffff', padding: '0.25rem 0.65rem', fontSize: '0.78rem', fontWeight: 700 }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Date Filter Dropdown */}
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Date:</span>
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value as any)}
              className="form-select"
              style={{ minHeight: '34px', padding: '0.2rem 0.65rem', fontSize: '0.78rem', width: 'auto' }}
            >
              <option value="ALL">All Available Dates</option>
              <option value="TODAY">Today (Aug 12)</option>
              <option value="UPCOMING">Upcoming Dates (Aug 13 - 18)</option>
              <option value="PAST">Past & Completed Sessions</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Tracker 2-Column Layout */}
      <div className="return-layout-container">
        {/* Left Column: Request List */}
        <div className="sidebar-sessions-box">
          <div className="card-header-minimal" style={{ marginBottom: '0.75rem' }}>
            <span className="card-title-minimal" style={{ fontSize: '0.88rem' }}>Requisition Records</span>
            <span className="tab-badge">{filteredRequests.length} Listed</span>
          </div>

          <div className="sidebar-sessions-list">
            {filteredRequests.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted">
                <FileCheck size={28} className="mx-auto mb-1 opacity-40" />
                <span>No matching requests found</span>
              </div>
            ) : (
              filteredRequests.map(r => {
                const isSelected = selectedRequest?.id === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedReqId(r.id)}
                    className={`session-select-item ${isSelected ? 'active' : ''}`}
                  >
                    <div className="session-item-row">
                      <span className="session-item-title">{r.applicant.studentName}</span>
                      <span className="mono font-bold text-xs">#{r.id}</span>
                    </div>

                    <div className="session-item-sub">
                      Studio {r.requestDetails.facilityRoom} • {formatDate(r.requestDetails.date)}
                    </div>

                    <div className="session-item-row mt-1 text-xs">
                      <span>Machines: <strong>{r.requestDetails.machineIds.join(', ')}</strong></span>
                      <span className="font-bold">{r.approval.status}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Live Tracking Stepper & Detailed Audit */}
        <div className="form-card-container">
          {!selectedRequest ? (
            <div className="p-12 text-center text-muted">
              <Search size={36} className="mx-auto mb-2 opacity-30 text-slate-900" />
              <h3 className="font-bold text-sm text-slate-800">Select a Request to Track</h3>
              <p className="text-xs text-muted mt-1">Pick a student application on the left to see live status & return inspection.</p>
            </div>
          ) : (
            <div>
              {/* Header Title with 1-Click Equipment Pass */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '0.75rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span className="mono font-bold" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {selectedRequest.id}
                    </span>
                    <span className="status-pill-subtle pill-green font-bold">
                      {selectedRequest.approval.status}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                    {selectedRequest.applicant.studentName}
                  </h2>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {selectedRequest.applicant.semester} • {selectedRequest.applicant.classModule}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActivePassRequest(selectedRequest)}
                  className="room-chip"
                  style={{ border: '1px solid var(--text-primary)', background: 'var(--text-primary)', color: '#ffffff', padding: '0.45rem 0.95rem', fontSize: '0.82rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Ticket size={14} />
                  <span>View Equipment Pass</span>
                </button>
              </div>

              {/* Visual 4-Step Progress Stepper (Black & White) */}
              <div style={{ marginBottom: '1.5rem' }}>
                <span className="detail-label" style={{ marginBottom: '0.65rem' }}>Requisition Progress</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {[
                    { step: 1, label: '1. Submitted', sub: formatDate(selectedRequest.requestDetails.date) },
                    { step: 2, label: '2. Lecturer Verified', sub: selectedRequest.applicant.lecturer },
                    { step: 3, label: '3. In Studio Usage', sub: `Studio ${selectedRequest.requestDetails.facilityRoom}` },
                    { step: 4, label: '4. Returned & Checked', sub: selectedRequest.returnInfo ? selectedRequest.returnInfo.returnCondition : 'Pending Return' }
                  ].map(s => {
                    const state = getStepState(selectedRequest, s.step as any);
                    const isDone = state === 'completed';
                    const isCurr = state === 'current';
                    return (
                      <div
                        key={s.step}
                        style={{
                          background: isDone || isCurr ? 'var(--text-primary)' : 'var(--bg-card-subtle)',
                          color: isDone || isCurr ? '#ffffff' : 'var(--text-muted)',
                          borderRadius: '8px',
                          padding: '0.75rem 0.65rem',
                          border: '1px solid var(--border-light)',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {isDone ? <CheckCircle2 size={12} /> : isCurr ? <Clock size={12} /> : null}
                          <span>{s.label}</span>
                        </div>
                        <div style={{ fontSize: '0.68rem', opacity: 0.8, marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {s.sub}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="card-header-minimal">
                <span className="card-title-minimal" style={{ fontSize: '0.85rem' }}>Requisition & Equipment Parameters</span>
              </div>

              <div className="detail-card-grid">
                <div className="detail-item">
                  <span className="detail-label">Facility / Room</span>
                  <span className="detail-value">Studio {selectedRequest.requestDetails.facilityRoom}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Allocated Machines</span>
                  <div className="flex gap-1.5 mt-0.5">
                    {selectedRequest.requestDetails.machineIds.map(mId => (
                      <span key={mId} className="mono text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                        #{mId}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Usage Date & Time Slot</span>
                  <span className="detail-value">
                    {formatDate(selectedRequest.requestDetails.date)} ({selectedRequest.requestDetails.startTime} - {selectedRequest.requestDetails.endTime})
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Allocated Duration</span>
                  <span className="detail-value">{selectedRequest.requestDetails.durationHours} Hours</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Designated Faculty</span>
                  <span className="detail-value">{selectedRequest.applicant.lecturer}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Student Agreement</span>
                  <span className="detail-value font-bold text-slate-900">✓ Confirmed & Digitally Signed</span>
                </div>
              </div>

              {/* Purpose & Notes */}
              {selectedRequest.requestDetails.purposeNotes && (
                <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', background: 'var(--bg-card-subtle)', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}>
                  <span className="detail-label" style={{ marginBottom: '0.2rem' }}>Project Purpose & Notes</span>
                  <p style={{ color: 'var(--text-secondary)' }}>"{selectedRequest.requestDetails.purposeNotes}"</p>
                </div>
              )}

              {/* Lecturer Verification Details */}
              <div className="card-header-minimal mt-4">
                <span className="card-title-minimal" style={{ fontSize: '0.85rem' }}>Lecturer Approval & Return Sign-Off</span>
              </div>

              <div className="detail-card-grid">
                <div className="detail-item">
                  <span className="detail-label">Approval Status</span>
                  <span className="detail-value font-bold">{selectedRequest.approval.status}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Reviewing Faculty</span>
                  <span className="detail-value">{selectedRequest.approval.verifiedByLecturer || selectedRequest.applicant.lecturer}</span>
                </div>

                <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                  <span className="detail-label">Lecturer Instructions & Feedback</span>
                  <span className="detail-value text-slate-700">
                    "{selectedRequest.approval.lecturerFeedback || 'Application verified. Approved for studio workstation use.'}"
                  </span>
                </div>
              </div>

              {/* Return Inspection Record (if returned) */}
              {selectedRequest.returnInfo && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-card-subtle)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      ✓ Return Inspection Completed ({selectedRequest.returnInfo.returnCondition})
                    </span>
                    <span className="mono text-xs font-bold text-muted">
                      {selectedRequest.returnInfo.returnedAt ? formatDate(selectedRequest.returnInfo.returnedAt) : '-'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    <strong>Inspector Notes:</strong> "{selectedRequest.returnInfo.lecturerNotes}"
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>• Needle intact</span>
                    <span>• Bobbin case clean</span>
                    <span>• Tension calibrated</span>
                    <span>• Workspace cleaned</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
