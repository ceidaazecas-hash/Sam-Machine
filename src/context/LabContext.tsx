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
  INITIAL_MODULES,
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
  modules: string[];
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

  // Dynamic Additions by Lecturer
  addMachine: (machine: Omit<Machine, 'id' | 'totalUsageHours' | 'healthScore'>) => Machine;
  addLecturer: (lecturer: Omit<Lecturer, 'id'>) => Lecturer;
  addClassModule: (moduleName: string) => void;

  // Excel / CSV Export functions
  exportRequestsToCSV: () => void;
  exportMachinesToCSV: () => void;
  exportStudentSummaryToCSV: () => void;
}

const LabContext = createContext<LabContextType | undefined>(undefined);

const STORAGE_KEYS = {
  MACHINES: 'studio_lab_machines_v2',
  REQUESTS: 'studio_lab_requests_v2',
  LECTURERS: 'studio_lab_lecturers_v2',
  MODULES: 'studio_lab_modules_v2',
  LOGS: 'studio_lab_logs_v2',
  THEME: 'studio_lab_theme_v2',
  SOUND: 'studio_lab_sound_v2'
};

export const LabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

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

  const [lecturers, setLecturers] = useState<Lecturer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LECTURERS);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_LECTURERS;
  });

  const [modules, setModules] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MODULES);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_MODULES;
  });

  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_MAINTENANCE_LOGS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MACHINES, JSON.stringify(machines));
  }, [machines]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LECTURERS, JSON.stringify(lecturers));
  }, [lecturers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MODULES, JSON.stringify(modules));
  }, [modules]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(maintenanceLogs));
  }, [maintenanceLogs]);

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

    showToast(`Return verified & signed by ${inspection.verifiedByLecturer}! Machine is now available.`, 'success');
  };

  // Machine status manual update
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

  // =========================================================================
  // DYNAMIC ADDITIONS (ADD MACHINE, LECTURER, CLASS/MODULE)
  // =========================================================================

  const addMachine = (m: Omit<Machine, 'id' | 'totalUsageHours' | 'healthScore'>): Machine => {
    const id = m.code.trim();
    const newMachine: Machine = {
      ...m,
      id,
      code: id,
      totalUsageHours: 0,
      healthScore: 100,
      lastMaintained: new Date().toISOString().slice(0, 10)
    };

    setMachines(prev => [...prev, newMachine]);
    showToast(`Machine #${id} successfully added to Room ${m.room}!`, 'success');
    return newMachine;
  };

  const addLecturer = (l: Omit<Lecturer, 'id'>): Lecturer => {
    const id = `LEC-${String(lecturers.length + 1).padStart(2, '0')}`;
    const newLecturer: Lecturer = {
      ...l,
      id
    };

    setLecturers(prev => [...prev, newLecturer]);
    showToast(`Faculty member "${l.name}" added successfully!`, 'success');
    return newLecturer;
  };

  const addClassModule = (moduleName: string) => {
    const trimmed = moduleName.trim();
    if (!trimmed) return;
    if (modules.includes(trimmed)) {
      showToast('This module is already in the course directory.', 'error');
      return;
    }

    setModules(prev => [...prev, trimmed]);
    showToast(`Module "${trimmed}" added to active curriculum!`, 'success');
  };

  // =========================================================================
  // EXCEL / CSV EXPORT UTILITIES (UTF-8 BOM COMPATIBLE WITH EXCEL)
  // =========================================================================

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${filename} successfully.`, 'success');
  };

  const escapeCSV = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const exportRequestsToCSV = () => {
    const headers = [
      'Request ID',
      'Student Name',
      'Student ID',
      'Semester',
      'Class / Module',
      'Lecturer In Charge',
      'Studio Room',
      'Machines Allocated',
      'Usage Date',
      'Start Time',
      'End Time',
      'Duration (Hours)',
      'Agreement Signed',
      'Approval Status',
      'Decision Timestamp',
      'Lecturer Feedback',
      'Return Timestamp',
      'Return Condition',
      'Return Inspection Notes',
      'Verified By Lecturer'
    ];

    const rows = requests.map(r => [
      escapeCSV(r.id),
      escapeCSV(r.applicant.studentName),
      escapeCSV(r.applicant.studentId),
      escapeCSV(r.applicant.semester),
      escapeCSV(r.applicant.classModule),
      escapeCSV(r.applicant.lecturer),
      escapeCSV(`Studio ${r.requestDetails.facilityRoom}`),
      escapeCSV(r.requestDetails.machineIds.join('; ')),
      escapeCSV(r.requestDetails.date),
      escapeCSV(r.requestDetails.startTime),
      escapeCSV(r.requestDetails.endTime),
      escapeCSV(r.requestDetails.durationHours),
      escapeCSV(r.requestDetails.studentAgreement ? 'Yes' : 'No'),
      escapeCSV(r.approval.status),
      escapeCSV(r.approval.decisionTimestamp || '-'),
      escapeCSV(r.approval.lecturerFeedback || '-'),
      escapeCSV(r.returnInfo?.returnedAt || '-'),
      escapeCSV(r.returnInfo?.returnCondition || '-'),
      escapeCSV(r.returnInfo?.lecturerNotes || '-'),
      escapeCSV(r.returnInfo?.verifiedByLecturer || r.approval.verifiedByLecturer || '-')
    ]);

    const csvString = [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadCSV(csvString, `Equipment_Requests_Audit_${dateStr}.csv`);
  };

  const exportMachinesToCSV = () => {
    const headers = [
      'Machine ID',
      'Machine Code',
      'Machine Type',
      'Studio Room',
      'Status',
      'Model Description',
      'Total Usage (Hours)',
      'Health Score (%)',
      'Last Maintained Date',
      'Current Booking ID',
      'Maintenance Notes'
    ];

    const rows = machines.map(m => [
      escapeCSV(m.id),
      escapeCSV(m.code),
      escapeCSV(m.type),
      escapeCSV(`Studio ${m.room}`),
      escapeCSV(m.status),
      escapeCSV(m.model),
      escapeCSV(m.totalUsageHours),
      escapeCSV(m.healthScore),
      escapeCSV(m.lastMaintained || '-'),
      escapeCSV(m.currentBookingId || '-'),
      escapeCSV(m.notes || '-')
    ]);

    const csvString = [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadCSV(csvString, `Equipment_Machines_Inventory_${dateStr}.csv`);
  };

  const exportStudentSummaryToCSV = () => {
    const studentMap = new Map<string, {
      name: string;
      studentId: string;
      semester: string;
      classModule: string;
      totalBookings: number;
      completedReturns: number;
      pendingBookings: number;
    }>();

    requests.forEach(r => {
      const sId = r.applicant.studentId;
      if (!studentMap.has(sId)) {
        studentMap.set(sId, {
          name: r.applicant.studentName,
          studentId: sId,
          semester: r.applicant.semester,
          classModule: r.applicant.classModule,
          totalBookings: 0,
          completedReturns: 0,
          pendingBookings: 0
        });
      }
      const st = studentMap.get(sId)!;
      st.totalBookings += 1;
      if (r.approval.status === 'RETURNED') st.completedReturns += 1;
      if (r.approval.status === 'PENDING') st.pendingBookings += 1;
    });

    const headers = [
      'Student Name',
      'Student ID',
      'Semester',
      'Class / Module',
      'Total Bookings',
      'Completed Returns',
      'Pending Requests',
      'Compliance Standing'
    ];

    const rows = Array.from(studentMap.values()).map(st => [
      escapeCSV(st.name),
      escapeCSV(st.studentId),
      escapeCSV(st.semester),
      escapeCSV(st.classModule),
      escapeCSV(st.totalBookings),
      escapeCSV(st.completedReturns),
      escapeCSV(st.pendingBookings),
      escapeCSV('Verified Student')
    ]);

    const csvString = [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadCSV(csvString, `Student_Compliance_Summary_${dateStr}.csv`);
  };

  // Reset demo data
  const resetDemoData = () => {
    setMachines(INITIAL_MACHINES);
    setRequests(INITIAL_REQUESTS);
    setLecturers(INITIAL_LECTURERS);
    setModules(INITIAL_MODULES);
    setMaintenanceLogs(INITIAL_MAINTENANCE_LOGS);
    localStorage.removeItem(STORAGE_KEYS.MACHINES);
    localStorage.removeItem(STORAGE_KEYS.REQUESTS);
    localStorage.removeItem(STORAGE_KEYS.LECTURERS);
    localStorage.removeItem(STORAGE_KEYS.MODULES);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    showToast('All inventory and records restored to initial state.', 'info');
  };

  return (
    <LabContext.Provider
      value={{
        machines,
        requests,
        lecturers,
        modules,
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
        resetDemoData,
        addMachine,
        addLecturer,
        addClassModule,
        exportRequestsToCSV,
        exportMachinesToCSV,
        exportStudentSummaryToCSV
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
