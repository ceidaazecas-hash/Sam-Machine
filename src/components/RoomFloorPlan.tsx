import React from 'react';
import { useLab } from '../context/LabContext';
import type { Machine, RoomId } from '../types/lab';
import { CheckCircle2 } from 'lucide-react';

interface RoomFloorPlanProps {
  selectedMachineIds?: string[];
  onSelectMachine?: (machineId: string) => void;
  interactiveSelect?: boolean;
}

export const RoomFloorPlan: React.FC<RoomFloorPlanProps> = ({
  selectedMachineIds = [],
  onSelectMachine,
  interactiveSelect = true
}) => {
  const { machines, selectedRoom, setSelectedRoom } = useLab();

  const roomMachines = machines.filter(m => m.room === selectedRoom);

  const getStatusColor = (status: Machine['status']) => {
    switch (status) {
      case 'AVAILABLE': return { bg: 'bg-emerald-500/15', border: 'border-emerald-500/40', text: 'text-emerald-400', glow: 'shadow-emerald-500/20' };
      case 'IN_USE': return { bg: 'bg-cyan-500/15', border: 'border-cyan-500/40', text: 'text-cyan-400', glow: 'shadow-cyan-500/20' };
      case 'RESERVED': return { bg: 'bg-amber-500/15', border: 'border-amber-500/40', text: 'text-amber-400', glow: 'shadow-amber-500/20' };
      case 'MAINTENANCE': return { bg: 'bg-rose-500/15', border: 'border-rose-500/40', text: 'text-rose-400', glow: 'shadow-rose-500/20' };
    }
  };

  return (
    <div className="floorplan-card">
      <div className="floorplan-header">
        <div className="floorplan-title-block">
          <div className="flex items-center gap-2">
            <span className="live-indicator-dot" />
            <h3 className="floorplan-title">Studio Room {selectedRoom} Floor Layout</h3>
          </div>
          <p className="floorplan-subtitle">
            Live interactive floor status. Click an available machine pod to attach it to your booking.
          </p>
        </div>

        {/* Room Tab Selector */}
        <div className="room-subtabs">
          {(['719', '721', '724'] as RoomId[]).map(r => (
            <button
              key={r}
              type="button"
              className={`room-subtab ${selectedRoom === r ? 'active' : ''}`}
              onClick={() => setSelectedRoom(r)}
            >
              Studio {r}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="floorplan-legend">
        <div className="legend-item">
          <span className="legend-dot bg-emerald-500" />
          <span>Available</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot bg-cyan-500" />
          <span>In Studio Use</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot bg-amber-500" />
          <span>Reserved / Pending</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot bg-rose-500" />
          <span>Maintenance</span>
        </div>
      </div>

      {/* Visual Floor Layout Studio Container */}
      <div className="studio-floor-map">
        {/* Room Perimeter Elements */}
        <div className="studio-zone-decor teacher-desk">
          <div className="zone-label">👨‍🏫 Instructor Tech Station & Tools Rack</div>
        </div>

        <div className="studio-pods-grid">
          {roomMachines.map(m => {
            const isSelected = selectedMachineIds.includes(m.id);
            const statusStyle = getStatusColor(m.status);
            const isClickable = interactiveSelect && (m.status === 'AVAILABLE' || isSelected);

            return (
              <div
                key={m.id}
                onClick={() => {
                  if (isClickable && onSelectMachine) {
                    onSelectMachine(m.id);
                  }
                }}
                className={`machine-pod ${isSelected ? 'selected-pod' : ''} ${!isClickable ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                style={{
                  borderColor: isSelected ? 'var(--primary)' : undefined
                }}
              >
                <div className="pod-header">
                  <div className="pod-code-tag">
                    <span className="pod-code-prefix">#{m.type === 'SEWING' ? 'SEW' : 'OVK'}</span>
                    <span className="pod-code-num">{m.code}</span>
                  </div>

                  <span className={`pod-status-pill ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                    {m.status === 'AVAILABLE' && 'Ready'}
                    {m.status === 'IN_USE' && 'In Use'}
                    {m.status === 'RESERVED' && 'Reserved'}
                    {m.status === 'MAINTENANCE' && 'Service'}
                  </span>
                </div>

                <div className="pod-body">
                  <div className="pod-name">{m.name}</div>
                  <div className="pod-model">{m.model}</div>
                </div>

                <div className="pod-footer">
                  <div className="pod-health">
                    <span className="text-xs text-muted">Health:</span>
                    <div className="health-mini-bar">
                      <div 
                        className="health-mini-fill" 
                        style={{ 
                          width: `${m.healthScore}%`,
                          backgroundColor: m.healthScore > 85 ? '#10b981' : m.healthScore > 70 ? '#f59e0b' : '#ef4444' 
                        }} 
                      />
                    </div>
                    <span className="health-score-val">{m.healthScore}%</span>
                  </div>

                  {isSelected && (
                    <div className="pod-selected-badge">
                      <CheckCircle2 size={14} className="text-primary" />
                      <span>Selected</span>
                    </div>
                  )}
                </div>

                {/* Desk Illustration Detail */}
                <div className="pod-desk-wireframe">
                  <div className="thread-spool-marker" />
                  <div className="needle-marker" />
                  <div className="pedal-wire" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Room Auxiliaries */}
        <div className="studio-aux-row">
          <div className="studio-zone-decor cutting-table">
            <div className="zone-label">✂️ Central Cutting & Pattern Drafting Table</div>
          </div>
          <div className="studio-zone-decor pressing-zone">
            <div className="zone-label">💨 Vacuum Steam Pressing Station</div>
          </div>
        </div>
      </div>
    </div>
  );
};
