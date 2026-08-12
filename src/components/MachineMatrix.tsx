import React, { useState } from 'react';
import { useLab } from '../context/LabContext';
import type { Machine, RoomId, MachineType } from '../types/lab';
import { 
  Cpu, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  Filter, 
  X 
} from 'lucide-react';

export const MachineMatrix: React.FC = () => {
  const { 
    machines, 
    maintenanceLogs, 
    updateMachineStatus, 
    addMaintenanceLog, 
    resolveMaintenanceLog, 
    currentRole, 
    showToast 
  } = useLab();

  const [filterRoom, setFilterRoom] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Maintenance modal
  const [issueModalMachine, setIssueModalMachine] = useState<Machine | null>(null);
  const [issueDesc, setIssueDesc] = useState('');
  const [issueSeverity, setIssueSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');

  // Resolve modal
  const [resolveLogId, setResolveLogId] = useState<string | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');

  const filteredMachines = machines.filter(m => {
    if (filterRoom !== 'ALL' && m.room !== filterRoom) return false;
    if (filterType !== 'ALL' && m.type !== filterType) return false;
    if (filterStatus !== 'ALL' && m.status !== filterStatus) return false;
    return true;
  });

  const handleOpenIssueModal = (m: Machine) => {
    setIssueModalMachine(m);
    setIssueDesc('');
    setIssueSeverity('MEDIUM');
  };

  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueModalMachine) return;
    if (!issueDesc.trim()) {
      showToast('Please describe the machine issue.', 'error');
      return;
    }

    addMaintenanceLog({
      machineId: issueModalMachine.id,
      machineCode: issueModalMachine.code,
      machineType: issueModalMachine.type as MachineType,
      room: issueModalMachine.room as RoomId,
      reportedBy: currentRole === 'LAB_TECH' ? 'Lab Technician' : 'Faculty Instructor',
      issueDescription: issueDesc,
      severity: issueSeverity,
      status: 'OPEN'
    });

    updateMachineStatus(issueModalMachine.id, 'MAINTENANCE', `Maintenance logged: ${issueDesc}`);
    setIssueModalMachine(null);
  };

  const handleConfirmResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveLogId) return;
    if (!resolveNotes.trim()) {
      showToast('Please provide resolution notes.', 'error');
      return;
    }

    resolveMaintenanceLog(resolveLogId, resolveNotes);
    setResolveLogId(null);
    setResolveNotes('');
  };

  return (
    <div className="machine-matrix-container">
      {/* Top Banner */}
      <div className="page-header-card">
        <div className="page-header-content">
          <div className="header-badge badge-emerald">
            <Cpu size={14} />
            <span>Equipment Health & Hardware Fleet</span>
          </div>
          <h1 className="page-title">Machine Hardware Fleet & Maintenance Hub</h1>
          <p className="page-description">
            Complete inventory tracking for Sewing Machines (2401–2416) and Overlockers (2101–2102) across all studios.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="filters-card">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Filter size={16} className="text-primary" />
          <span>Filters:</span>
        </div>

        <div className="filter-selects-row">
          <select
            value={filterRoom}
            onChange={e => setFilterRoom(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Rooms (719, 721, 724)</option>
            <option value="719">Studio Room 719</option>
            <option value="721">Studio Room 721</option>
            <option value="724">Studio Room 724</option>
          </select>

          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Machine Types</option>
            <option value="SEWING">Sewing Lockstitch (2401-2416)</option>
            <option value="OVERLOCKING">Overlockers (2101-2102)</option>
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="IN_USE">In Use</option>
            <option value="RESERVED">Reserved</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Machine Grid */}
      <div className="machine-cards-grid">
        {filteredMachines.map(m => {
          return (
            <div key={m.id} className="machine-grid-card">
              <div className="machine-card-header">
                <div className="flex items-center gap-2">
                  <span className="machine-code-badge">
                    #{m.code}
                  </span>
                  <div>
                    <h4 className="machine-card-name">{m.name}</h4>
                    <span className="text-xs text-muted">Studio Room {m.room}</span>
                  </div>
                </div>

                <span className={`status-pill ${m.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : m.status === 'IN_USE' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : m.status === 'RESERVED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
                  {m.status}
                </span>
              </div>

              <div className="machine-card-body">
                <div className="text-xs font-medium text-secondary">{m.model}</div>

                <div className="health-row mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted">Health Index</span>
                    <span className="font-semibold">{m.healthScore}%</span>
                  </div>
                  <div className="health-bar-bg">
                    <div
                      className="health-bar-fill"
                      style={{
                        width: `${m.healthScore}%`,
                        backgroundColor: m.healthScore > 85 ? '#10b981' : m.healthScore > 70 ? '#f59e0b' : '#ef4444'
                      }}
                    />
                  </div>
                </div>

                <div className="meta-stats-grid mt-3">
                  <div className="meta-stat">
                    <span className="meta-stat-label">Running Hours</span>
                    <span className="meta-stat-val">{m.totalUsageHours}h</span>
                  </div>
                  <div className="meta-stat">
                    <span className="meta-stat-label">Last Serviced</span>
                    <span className="meta-stat-val">{m.lastMaintained || '2026-08-01'}</span>
                  </div>
                </div>

                {m.notes && (
                  <p className="machine-notes-preview">
                    "{m.notes}"
                  </p>
                )}
              </div>

              {/* Card Actions (For Tech / Faculty) */}
              <div className="machine-card-footer">
                <button
                  type="button"
                  onClick={() => handleOpenIssueModal(m)}
                  className="btn-card-action"
                  title="Report Issue / Request Service"
                >
                  <Wrench size={13} />
                  <span>Report Issue</span>
                </button>

                {m.status === 'MAINTENANCE' ? (
                  <button
                    type="button"
                    onClick={() => updateMachineStatus(m.id, 'AVAILABLE', 'Service completed and machine restored.')}
                    className="btn-card-action text-emerald-400"
                    title="Mark Ready for Students"
                  >
                    <CheckCircle2 size={13} />
                    <span>Set Ready</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => updateMachineStatus(m.id, 'MAINTENANCE', 'Manual maintenance hold placed.')}
                    className="btn-card-action text-rose-400"
                    title="Place Under Maintenance"
                  >
                    <AlertTriangle size={13} />
                    <span>Hold Service</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Maintenance Logs Section */}
      <div className="maintenance-section-card mt-6">
        <div className="section-title-row">
          <div className="section-step-num bg-rose-500/20 text-rose-400">
            <Wrench size={16} />
          </div>
          <div>
            <h3 className="section-title">Active Maintenance & Repair Tickets</h3>
            <p className="section-desc">Track mechanical issues, blade sharpening, and electrical repairs</p>
          </div>
        </div>

        <div className="table-responsive mt-3">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Machine</th>
                <th>Room</th>
                <th>Reported By</th>
                <th>Issue Description</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceLogs.map(l => (
                <tr key={l.id}>
                  <td className="mono font-semibold">{l.id}</td>
                  <td>#{l.machineCode} ({l.machineType})</td>
                  <td className="text-primary font-medium">Room {l.room}</td>
                  <td className="text-xs">{l.reportedBy}</td>
                  <td className="text-xs max-w-sm">{l.issueDescription}</td>
                  <td>
                    <span className={`status-pill ${l.severity === 'CRITICAL' || l.severity === 'HIGH' ? 'bg-rose-500/15 text-rose-400' : 'bg-amber-500/15 text-amber-400'}`}>
                      {l.severity}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${l.status === 'RESOLVED' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                      {l.status}
                    </span>
                  </td>
                  <td>
                    {l.status !== 'RESOLVED' && (
                      <button
                        type="button"
                        onClick={() => {
                          setResolveLogId(l.id);
                          setResolveNotes('Cleaned, calibrated, and tension tested with 100% test stitch.');
                        }}
                        className="btn-success-sm text-xs py-1 px-2"
                      >
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REPORT ISSUE MODAL */}
      {issueModalMachine && (
        <div className="modal-backdrop" onClick={() => setIssueModalMachine(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Log Maintenance Issue for #{issueModalMachine.code}</h3>
              <button type="button" onClick={() => setIssueModalMachine(null)} className="btn-icon-close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateIssue} className="modal-body">
              <div className="form-group">
                <label className="form-label">Issue Severity</label>
                <select
                  value={issueSeverity}
                  onChange={e => setIssueSeverity(e.target.value as any)}
                  className="form-select"
                >
                  <option value="LOW">Low (Cosmetic / Minor Lint)</option>
                  <option value="MEDIUM">Medium (Needle timing / Dull blade)</option>
                  <option value="HIGH">High (Motor defect / Jammed hook)</option>
                  <option value="CRITICAL">Critical (Electrical hazard)</option>
                </select>
              </div>

              <div className="form-group mt-3">
                <label className="form-label">Issue Description</label>
                <textarea
                  value={issueDesc}
                  onChange={e => setIssueDesc(e.target.value)}
                  rows={3}
                  placeholder="Explain symptoms (e.g. skipped stitches, thread shredding, foot pedal sticking)..."
                  className="form-textarea"
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIssueModalMachine(null)} className="btn-secondary-sm">
                  Cancel
                </button>
                <button type="submit" className="btn-danger-sm">
                  Submit Maintenance Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOLVE ISSUE MODAL */}
      {resolveLogId && (
        <div className="modal-backdrop" onClick={() => setResolveLogId(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Resolve Ticket {resolveLogId}</h3>
              <button type="button" onClick={() => setResolveLogId(null)} className="btn-icon-close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmResolve} className="modal-body">
              <div className="form-group">
                <label className="form-label">Resolution Work Details</label>
                <textarea
                  value={resolveNotes}
                  onChange={e => setResolveNotes(e.target.value)}
                  rows={3}
                  placeholder="Describe repair work, parts replaced, and final test pass results..."
                  className="form-textarea"
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setResolveLogId(null)} className="btn-secondary-sm">
                  Cancel
                </button>
                <button type="submit" className="btn-success-sm">
                  Confirm Resolution & Reopen Station
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
