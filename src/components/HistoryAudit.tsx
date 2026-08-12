import React, { useState } from 'react';
import { useLab } from '../context/LabContext';
import { 
  FileText, 
  Download, 
  Search, 
  Eye
} from 'lucide-react';
import { formatDate, formatDateTime, getStatusBadge, exportRequestsToCSV } from '../utils/helpers';

export const HistoryAudit: React.FC = () => {
  const { requests, lecturers, setActivePassRequest, showToast } = useLab();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roomFilter, setRoomFilter] = useState('ALL');
  const [lecturerFilter, setLecturerFilter] = useState('ALL');

  const filteredRequests = requests.filter(r => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      r.id.toLowerCase().includes(q) ||
      r.applicant.studentName.toLowerCase().includes(q) ||
      r.applicant.studentId.toLowerCase().includes(q) ||
      r.applicant.classModule.toLowerCase().includes(q) ||
      r.requestDetails.machineIds.some(m => m.includes(q));

    if (!matchesSearch) return false;
    if (statusFilter !== 'ALL' && r.approval.status !== statusFilter) return false;
    if (roomFilter !== 'ALL' && r.requestDetails.facilityRoom !== roomFilter) return false;
    if (lecturerFilter !== 'ALL' && r.applicant.lecturer !== lecturerFilter) return false;

    return true;
  });

  const handleExportCSV = () => {
    if (filteredRequests.length === 0) {
      showToast('No records to export.', 'info');
      return;
    }
    exportRequestsToCSV(filteredRequests);
    showToast('Audit report exported to CSV.', 'success');
  };

  return (
    <div className="history-audit-container">
      {/* Header Banner */}
      <div className="page-header-card">
        <div className="page-header-content">
          <div className="header-badge badge-cyan">
            <FileText size={14} />
            <span>Audit Trail & Records</span>
          </div>
          <h1 className="page-title">Laboratory Equipment Audit & History</h1>
          <p className="page-description">
            Complete verifiable archive of all student requisitions, instructor sign-offs, and return inspection logs.
          </p>
        </div>

        <div className="header-quick-actions">
          <button type="button" onClick={handleExportCSV} className="btn-primary-sm">
            <Download size={15} />
            <span>Export CSV Audit Log</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filters-card">
        <div className="search-box flex-1">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by student, ID, module, or machine..."
            className="search-input"
          />
        </div>

        <div className="filter-selects-row">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="IN_USE">In Studio Use</option>
            <option value="RETURNED">Completed & Returned</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={roomFilter}
            onChange={e => setRoomFilter(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Rooms</option>
            <option value="719">Studio 719</option>
            <option value="721">Studio 721</option>
            <option value="724">Studio 724</option>
          </select>

          <select
            value={lecturerFilter}
            onChange={e => setLecturerFilter(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Lecturers</option>
            {lecturers.map(l => (
              <option key={l.id} value={l.name}>{l.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Table */}
      <div className="table-card mt-4">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Student Applicant</th>
                <th>Semester & Module</th>
                <th>Room</th>
                <th>Machines</th>
                <th>Usage Slot</th>
                <th>Status</th>
                <th>Lecturer Sign-Off</th>
                <th>Return Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-muted">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map(r => {
                  const badge = getStatusBadge(r.approval.status);

                  return (
                    <tr key={r.id}>
                      <td className="mono font-semibold text-primary">{r.id}</td>
                      <td>
                        <div className="font-medium">{r.applicant.studentName}</div>
                        <div className="text-xs text-muted mono">{r.applicant.studentId}</div>
                      </td>
                      <td>
                        <div className="text-xs">{r.applicant.classModule}</div>
                        <div className="text-[11px] text-muted">{r.applicant.semester}</div>
                      </td>
                      <td className="text-secondary font-medium">Room {r.requestDetails.facilityRoom}</td>
                      <td>
                        <div className="flex gap-1 flex-wrap">
                          {r.requestDetails.machineIds.map(m => (
                            <span key={m} className="machine-tag-pill text-[11px] py-0.5 px-1.5">
                              #{m}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="text-xs">
                        <div>{formatDate(r.requestDetails.date)}</div>
                        <div className="text-muted">{r.requestDetails.startTime} - {r.requestDetails.endTime}</div>
                      </td>
                      <td>
                        <span className={`status-pill ${badge.bgClass} ${badge.colorClass}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="text-xs">
                        <div>{r.approval.verifiedByLecturer}</div>
                        {r.approval.decisionTimestamp && (
                          <div className="text-muted text-[11px]">
                            {formatDateTime(r.approval.decisionTimestamp)}
                          </div>
                        )}
                      </td>
                      <td className="text-xs">
                        {r.returnInfo ? (
                          <div>
                            <span className="text-emerald-400 font-semibold">{r.returnInfo.returnCondition}</span>
                            <div className="text-muted text-[11px]">{formatDateTime(r.returnInfo.returnedAt)}</div>
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => setActivePassRequest(r)}
                          className="btn-card-action text-primary text-xs"
                          title="View Printable Pass"
                        >
                          <Eye size={13} />
                          <span>Pass</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
