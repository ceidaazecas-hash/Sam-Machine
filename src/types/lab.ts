export type RoomId = '719' | '721' | '724';

export type MachineType = 'SEWING' | 'OVERLOCKING';

export type MachineStatus = 'AVAILABLE' | 'RESERVED' | 'IN_USE' | 'MAINTENANCE';

export interface Machine {
  id: string; // e.g. "2401"
  code: string; // "2401" - "2416" or "2101" - "2102"
  type: MachineType;
  name: string;
  room: RoomId;
  status: MachineStatus;
  model: string;
  totalUsageHours: number;
  lastMaintained?: string;
  currentBookingId?: string;
  healthScore: number; // 0 - 100
  notes?: string;
}

export type RequestStatus = 
  | 'PENDING' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'IN_USE' 
  | 'RETURNED' 
  | 'OVERDUE';

export interface ConditionChecklist {
  needleIntact: boolean;
  bobbinCaseClean: boolean;
  tensionCalibrated: boolean;
  accessoriesReturned: boolean;
  workspaceCleaned: boolean;
}

export interface ReturnInspection {
  returnedAt: string;
  returnCondition: 'EXCELLENT' | 'GOOD' | 'MINOR_ISSUES' | 'DAMAGED';
  checklist: ConditionChecklist;
  verifiedByLecturer: string;
  lecturerNotes: string;
  studentReturnNotes?: string;
  lecturerSignature?: string;
  isAccepted: boolean;
}

export interface BookingRequest {
  id: string; // e.g. "REQ-2026-0042"
  applicant: {
    studentName: string;
    studentId: string;
    semester: string; // e.g. "Semester 3"
    classModule: string; // e.g. "FD204 - Advanced Pattern Making"
    lecturer: string; // Lecturer in charge
    email?: string;
    contactNumber?: string;
  };
  requestDetails: {
    facilityRoom: RoomId;
    date: string;
    startTime: string;
    endTime: string;
    durationHours: number;
    machineIds: string[]; // e.g. ["2401", "2101"]
    purposeNotes?: string;
    studentAgreement: boolean;
    studentSignature: string; // base64 canvas data
    submittedAt: string;
  };
  approval: {
    status: RequestStatus;
    verifiedByLecturer: string;
    decisionTimestamp?: string;
    rejectionReason?: string;
    lecturerFeedback?: string;
    lecturerSignature?: string;
  };
  returnInfo?: ReturnInspection;
}

export interface Lecturer {
  id: string;
  name: string;
  email: string;
  department: string;
  modules: string[];
  avatar: string;
}

export interface MaintenanceLog {
  id: string;
  machineId: string;
  machineCode: string;
  machineType: MachineType;
  room: RoomId;
  reportedBy: string;
  reportedAt: string;
  issueDescription: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  resolutionNotes?: string;
}

export type UserRole = 'STUDENT' | 'LECTURER' | 'LAB_TECH';
