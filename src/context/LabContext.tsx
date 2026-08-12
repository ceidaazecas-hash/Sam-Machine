import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  Machine, 
  BookingRequest, 
  Lecturer, 
  MaintenanceLog, 
  RoomId, 
  UserRole, 
  MachineStatus, 
  ReturnInspection 
} from '../types/lab';
import { 
  INITIAL_MACHINES, 
  INITIAL_REQUESTS, 
  INITIAL_LECTURERS, 
  INITIAL_MAINTENANCE_LOGS 
} from '../data/initialData';
import { generateBookingId } from '../utils/helpers';
import { playSuccessChime, playApproveChime, playRejectTone } from '../utils/audio';
import confetti from 'canvas-confetti';

interface ToastInfo {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface LabContextType {
  machines: Machine[];
  requests: BookingRequest[];
  lecturers: Lecturer[];
  maintenanceLogs: MaintenanceLog[];
  currentRole: UserRole;
  selectedRoom: RoomId;
  activeTab: string;
  theme: 'dark' | 'light';
  soundEnabled: boolean;
  activePassRequest: BookingRequest | null;
  toasts: ToastInfo[];
  
  // Actions
  setRole: (role: UserRole) => void;
  setSelectedRoom: (room: RoomId) => void;
  setActiveTab: (tab: string) => void;
  toggleTheme: () => void;
  toggleSound: () => void;
  setActivePassRequest: (req: BookingRequest | null) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  
  // Business logic
  submitNewRequest: (req: Omit<BookingRequest, 'id' | 'approval'>) => BookingRequest;
  approveRequest: (requestId: string, lecturerFeedback?: string, lecturerSignature?: string) => void;
  rejectRequest: (requestId: string, reason: string) => void;
  submitReturnInspection: (requestId: string, inspection: ReturnInspection) => void;
  updateMachineStatus: (machineId: string, status: MachineStatus, notes?: string) => void;
  addMaintenanceLog: (log: Omit<MaintenanceLog, 'id' | 'reportedAt'>) => void;
  resolveMaintenanceLog: (logId: string, resolutionNotes: string) => void;
  resetDemoData: () => void;
}

const LabContext = createContext<LabContextType | undefined>(undefined);

const STORAGE_KEYS = {
  MACHINES: 'studio_lab_machines_v1',
  REQUESTS: 'studio_lab_requests_v1',
  LOGS: 'studio_lab_logs_v1',
  THEME: 'studio_lab_theme_v1',
  SOUND: 'studio_lab_sound_v1'
};

export const LabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return saved === 'light' ? 'light' : 'dark';
  });

  // Sound state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SOUND);
    return saved !== 'false';
  });

  // Role and Navigation
  const [currentRole, setCurrentRole] = useState<UserRole>('STUDENT');
  const [selectedRoom, setSelectedRoom] = useState<RoomId>('719');
  const [activeTab, setActiveTab] = useState<string>('REQUEST');
  const [activePassRequest, setActivePassRequest] = useState<BookingRequest | null>(null);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  // Core Data
  const [machines, setMachines] = useState<Machine[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MACHINES);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_MACHINES;
  });

  const [requests, setRequests] = useState<BookingRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_REQUESTS;
  });

  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_MAINTENANCE_LOGS;
  });

  const lecturers = INITIAL_LECTURERS;

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MACHINES, JSON.stringify(machines));
  }, [machines]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(maintenanceLogs));
  }, [maintenanceLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SOUND, soundEnabled ? 'true' : 'false');
  }, [soundEnabled]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  // Submit a new booking request from student
  const submitNewRequest = (reqData: Omit<BookingRequest, 'id' | 'approval'>): BookingRequest => {
    const newId = generateBookingId();
    const newRequest: BookingRequest = {
      ...reqData,
      id: newId,
      approval: {
        status: 'PENDING',
        verifiedByLecturer: reqData.applicant.lecturer
      }
    };

    // Update machines to RESERVED
    setMachines(prev =>
      prev.map(m => {
        if (reqData.requestDetails.machineIds.includes(m.id)) {
          return { ...m, status: 'RESERVED', currentBookingId: newId };
        }
        return m;
      })
    );

    setRequests(prev => [newRequest, ...prev]);

    if (soundEnabled) playSuccessChime();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    showToast(`Request ${newId} submitted successfully to ${reqData.applicant.lecturer}!`, 'success');
    return newRequest;
  };

  // Lecturer approves request
  const approveRequest = (requestId: string, lecturerFeedback?: string, lecturerSignature?: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          return {
            ...r,
            approval: {
              ...r.approval,
              status: 'IN_USE',
              decisionTimestamp: new Date().toISOString(),
              lecturerFeedback: lecturerFeedback || 'Approved for studio usage.',
              lecturerSignature: lecturerSignature || r.approval.lecturerSignature
            }
          };
        }
        return r;
      })
    );

    // Update machines to IN_USE
    setMachines(prev =>
      prev.map(m => {
        if (req.requestDetails.machineIds.includes(m.id)) {
          return { ...m, status: 'IN_USE', currentBookingId: requestId };
        }
        return m;
      })
    );

    if (soundEnabled) playApproveChime();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });

    showToast(`Booking ${requestId} approved & activated in Studio ${req.requestDetails.facilityRoom}!`, 'success');
  };

  // Lecturer rejects request
  const rejectRequest = (requestId: string, reason: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          return {
            ...r,
            approval: {
              ...r.approval,
              status: 'REJECTED',
              decisionTimestamp: new Date().toISOString(),
              rejectionReason: reason
            }
          };
        }
        return r;
      })
    );

    // Free up machines
    setMachines(prev =>
      prev.map(m => {
        if (req.requestDetails.machineIds.includes(m.id) && m.currentBookingId === requestId) {
          return { ...m, status: 'AVAILABLE', currentBookingId: undefined };
        }
        return m;
      })
    );

    if (soundEnabled) playRejectTone();
    showToast(`Booking ${requestId} rejected: ${reason}`, 'error');
  };

  // Return inspection and sign-off
  const submitReturnInspection = (requestId: string, inspection: ReturnInspection) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    const isAllClean = Object.values(inspection.checklist).every(Boolean);

    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          return {
            ...r,
            approval: {
              ...r.approval,
              status: 'RETURNED'
            },
            returnInfo: inspection
          };
        }
        return r;
      })
    );

    // Free up machines & add usage hours
    setMachines(prev =>
      prev.map(m => {
        if (req.requestDetails.machineIds.includes(m.id)) {
          const addedHours = req.requestDetails.durationHours || 3;
          const newStatus: MachineStatus = inspection.returnCondition === 'DAMAGED' ? 'MAINTENANCE' : 'AVAILABLE';
          return {
            ...m,
            status: newStatus,
            currentBookingId: undefined,
            totalUsageHours: m.totalUsageHours + addedHours,
            healthScore: inspection.returnCondition === 'DAMAGED' ? Math.max(40, m.healthScore - 25) : m.healthScore,
            notes: inspection.returnCondition === 'DAMAGED' 
              ? `Damage reported on return (${new Date().toISOString().slice(0, 10)}): ${inspection.lecturerNotes}`
              : m.notes
          };
        }
        return m;
      })
    );

    // If damaged, auto-log maintenance ticket
    if (inspection.returnCondition === 'DAMAGED' || !isAllClean) {
      req.requestDetails.machineIds.forEach(mId => {
        const m = machines.find(item => item.id === mId);
        if (m) {
          addMaintenanceLog({
            machineId: m.id,
            machineCode: m.code,
            machineType: m.type,
            room: m.room,
            reportedBy: inspection.verifiedByLecturer || 'Lecturer on Return',
            issueDescription: `Flagged on return of ${requestId}: ${inspection.lecturerNotes || 'Inspection checks failed.'}`,
            severity: inspection.returnCondition === 'DAMAGED' ? 'HIGH' : 'LOW',
            status: 'OPEN'
          });
        }
      });
    }

    if (soundEnabled) playSuccessChime();
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });

    showToast(`Return verified & signed by ${inspection.verifiedByLecturer}! Machine is now marked as available.`, 'success');
  };

  // Machine status manual update (by Lab Tech or Lecturer)
  const updateMachineStatus = (machineId: string, status: MachineStatus, notes?: string) => {
    setMachines(prev =>
      prev.map(m => {
        if (m.id === machineId) {
          return {
            ...m,
            status,
            notes: notes !== undefined ? notes : m.notes,
            lastMaintained: status === 'AVAILABLE' && m.status === 'MAINTENANCE' ? new Date().toISOString().slice(0, 10) : m.lastMaintained,
            healthScore: status === 'AVAILABLE' && m.status === 'MAINTENANCE' ? 98 : m.healthScore
          };
        }
        return m;
      })
    );
    showToast(`Machine #${machineId} status updated to ${status}.`, 'info');
  };

  // Add maintenance log
  const addMaintenanceLog = (logData: Omit<MaintenanceLog, 'id' | 'reportedAt'>) => {
    const newLog: MaintenanceLog = {
      ...logData,
      id: `MNT-${Math.floor(100 + Math.random() * 900)}`,
      reportedAt: new Date().toISOString()
    };
    setMaintenanceLogs(prev => [newLog, ...prev]);
    showToast(`Maintenance issue logged for Machine ${logData.machineCode}!`, 'info');
  };

  // Resolve maintenance log
  const resolveMaintenanceLog = (logId: string, resolutionNotes: string) => {
    const target = maintenanceLogs.find(l => l.id === logId);
    if (!target) return;

    setMaintenanceLogs(prev =>
      prev.map(l => {
        if (l.id === logId) {
          return {
            ...l,
            status: 'RESOLVED',
            resolutionNotes
          };
        }
        return l;
      })
    );

    // Auto set machine to AVAILABLE
    updateMachineStatus(target.machineId, 'AVAILABLE', `Resolved (${logId}): ${resolutionNotes}`);
    showToast(`Maintenance #${logId} resolved. Machine #${target.machineCode} returned to service.`, 'success');
  };

  // Reset demo data
  const resetDemoData = () => {
    setMachines(INITIAL_MACHINES);
    setRequests(INITIAL_REQUESTS);
    setMaintenanceLogs(INITIAL_MAINTENANCE_LOGS);
    localStorage.removeItem(STORAGE_KEYS.MACHINES);
    localStorage.removeItem(STORAGE_KEYS.REQUESTS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    showToast('Demo data restored to initial pristine state.', 'info');
  };

  return (
    <LabContext.Provider
      value={{
        machines,
        requests,
        lecturers,
        maintenanceLogs,
        currentRole,
        selectedRoom,
        activeTab,
        theme,
        soundEnabled,
        activePassRequest,
        toasts,
        setRole: setCurrentRole,
        setSelectedRoom,
        setActiveTab,
        toggleTheme,
        toggleSound,
        setActivePassRequest,
        showToast,
        submitNewRequest,
        approveRequest,
        rejectRequest,
        submitReturnInspection,
        updateMachineStatus,
        addMaintenanceLog,
        resolveMaintenanceLog,
        resetDemoData
      }}
    >
      {children}
    </LabContext.Provider>
  );
};

export const useLab = () => {
  const context = useContext(LabContext);
  if (!context) {
    throw new Error('useLab must be used within a LabProvider');
  }
  return context;
};
