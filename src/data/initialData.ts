import type { Machine, Lecturer, BookingRequest, MaintenanceLog } from '../types/lab';

export const INITIAL_LECTURERS: Lecturer[] = [
  {
    id: 'LEC-01',
    name: 'Prof. Clara Moreau',
    email: 'c.moreau@fashion-institute.edu',
    department: 'Textile & Apparel Design',
    modules: ['FD101 - Intro to Garment Construction', 'FD401 - Final Major Project Studio'],
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'LEC-02',
    name: 'Dr. Marcus Vance',
    email: 'm.vance@fashion-institute.edu',
    department: 'Garment Technology & Engineering',
    modules: ['FD204 - Advanced Pattern Drafting', 'TX105 - Textile Structure & Weaving'],
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'LEC-03',
    name: 'Assoc. Prof. Elena Rostova',
    email: 'e.rostova@fashion-institute.edu',
    department: 'Haute Couture & Tailoring',
    modules: ['FD302 - Haute Couture Finishing', 'FD308 - Draping & Tailoring'],
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'LEC-04',
    name: 'Mr. David Tan',
    email: 'd.tan@fashion-institute.edu',
    department: 'Fashion Craft & Industrial Methods',
    modules: ['FD101 - Intro to Garment Construction', 'FD205 - Industrial Production Lab'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  }
];

export const INITIAL_MODULES = [
  'FD101 - Intro to Garment Construction',
  'FD204 - Advanced Pattern Drafting',
  'FD205 - Industrial Production Lab',
  'FD302 - Haute Couture Finishing',
  'FD308 - Draping & Tailoring',
  'TX105 - Textile Structure & Weaving',
  'FD401 - Final Major Project Studio'
];

export const INITIAL_SEMESTERS = [
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8'
];

// Sewing Machines: 2401 - 2416
// Overlocking Machines: 2101 - 2102
export const INITIAL_MACHINES: Machine[] = [
  // Room 719
  {
    id: '2401',
    code: '2401',
    type: 'SEWING',
    name: 'Industrial Lockstitch Station #01',
    room: '719',
    status: 'AVAILABLE',
    model: 'Juki DDL-8700 Industrial',
    totalUsageHours: 142,
    healthScore: 98,
    lastMaintained: '2026-08-01',
    notes: 'Direct-drive high speed lockstitch. Smooth clutch.'
  },
  {
    id: '2402',
    code: '2402',
    type: 'SEWING',
    name: 'Industrial Lockstitch Station #02',
    room: '719',
    status: 'IN_USE',
    model: 'Juki DDL-8700 Industrial',
    totalUsageHours: 210,
    healthScore: 92,
    currentBookingId: 'REQ-2026-0089',
    lastMaintained: '2026-08-05',
    notes: 'Equipped with Teflon foot for leather & vinyl.'
  },
  {
    id: '2403',
    code: '2403',
    type: 'SEWING',
    name: 'Industrial Lockstitch Station #03',
    room: '719',
    status: 'AVAILABLE',
    model: 'Brother S-7200C Nexio',
    totalUsageHours: 95,
    healthScore: 99,
    lastMaintained: '2026-08-02',
    notes: 'Electronic direct drive with automatic thread trimmer.'
  },
  {
    id: '2404',
    code: '2404',
    type: 'SEWING',
    name: 'Industrial Lockstitch Station #04',
    room: '719',
    status: 'AVAILABLE',
    model: 'Brother S-7200C Nexio',
    totalUsageHours: 118,
    healthScore: 95,
    lastMaintained: '2026-08-04',
    notes: 'Calibrated for medium weight cotton and denim.'
  },
  {
    id: '2405',
    code: '2405',
    type: 'SEWING',
    name: 'Heavy Duty Walking Foot Station #05',
    room: '719',
    status: 'AVAILABLE',
    model: 'Consew 206RB-5 Heavy Duty',
    totalUsageHours: 84,
    healthScore: 96,
    lastMaintained: '2026-07-28',
    notes: 'Compound feed walking foot for heavyweight outerwear.'
  },
  {
    id: '2406',
    code: '2406',
    type: 'SEWING',
    name: 'Industrial Lockstitch Station #06',
    room: '719',
    status: 'MAINTENANCE',
    model: 'Juki DDL-8700 Industrial',
    totalUsageHours: 280,
    healthScore: 68,
    lastMaintained: '2026-08-10',
    notes: 'Needle bar alignment & bobbin thread tension tuning required.'
  },
  {
    id: '2101',
    code: '2101',
    type: 'OVERLOCKING',
    name: '4-Thread High-Speed Overlocker Station A',
    room: '719',
    status: 'AVAILABLE',
    model: 'Pegasus M900 Series 4-Thread',
    totalUsageHours: 188,
    healthScore: 94,
    lastMaintained: '2026-08-06',
    notes: 'Precision differential feed for knitwear and stretch jerseys.'
  },

  // Room 721
  {
    id: '2407',
    code: '2407',
    type: 'SEWING',
    name: 'Industrial Lockstitch Station #07',
    room: '721',
    status: 'AVAILABLE',
    model: 'Juki DDL-9000C Digital',
    totalUsageHours: 72,
    healthScore: 100,
    lastMaintained: '2026-08-08',
    notes: 'Full digital control panel, sensor-driven feed.'
  },
  {
    id: '2408',
    code: '2408',
    type: 'SEWING',
    name: 'Industrial Lockstitch Station #08',
    room: '721',
    status: 'AVAILABLE',
    model: 'Juki DDL-9000C Digital',
    totalUsageHours: 65,
    healthScore: 100,
    lastMaintained: '2026-08-08',
    notes: 'Active thread tension management for silk & chiffon.'
  },
  {
    id: '2409',
    code: '2409',
    type: 'SEWING',
    name: 'Industrial Lockstitch Station #09',
    room: '721',
    status: 'IN_USE',
    model: 'Brother S-7300A Nexio',
    totalUsageHours: 154,
    healthScore: 90,
    currentBookingId: 'REQ-2026-0091',
    lastMaintained: '2026-08-03',
    notes: 'DigiFlex feed system with pulse motor.'
  },
  {
    id: '2410',
    code: '2410',
    type: 'SEWING',
    name: 'Industrial Lockstitch Station #10',
    room: '721',
    status: 'AVAILABLE',
    model: 'Brother S-7300A Nexio',
    totalUsageHours: 130,
    healthScore: 93,
    lastMaintained: '2026-08-03',
    notes: 'Fine stitch pitch setting for tailored suits.'
  },
  {
    id: '2411',
    code: '2411',
    type: 'SEWING',
    name: 'Industrial Lockstitch Station #11',
    room: '721',
    status: 'AVAILABLE',
    model: 'Juki DDL-8700 Industrial',
    totalUsageHours: 110,
    healthScore: 97,
    lastMaintained: '2026-08-02',
    notes: 'Standard versatile station.'
  },
  {
    id: '2102',
    code: '2102',
    type: 'OVERLOCKING',
    name: '5-Thread Safety Stitch Overlocker Station B',
    room: '721',
    status: 'AVAILABLE',
    model: 'Yamato AZ8000G High Performance',
    totalUsageHours: 160,
    healthScore: 96,
    lastMaintained: '2026-08-07',
    notes: '5-thread heavy duty edge serger & safety stitch chain.'
  },

  // Room 724
  {
    id: '2412',
    code: '2412',
    type: 'SEWING',
    name: 'Industrial Lockstitch Station #12',
    room: '724',
    status: 'AVAILABLE',
    model: 'Juki DDL-8700 Industrial',
    totalUsageHours: 145,
    healthScore: 95,
    lastMaintained: '2026-08-01',
    notes: 'Silent servo motor workstation.'
  },
  {
    id: '2413',
    code: '2413',
    type: 'SEWING',
    name: 'Industrial Lockstitch Station #13',
    room: '724',
    status: 'AVAILABLE',
    model: 'Juki DDL-8700 Industrial',
    totalUsageHours: 138,
    healthScore: 94,
    lastMaintained: '2026-08-01',
    notes: 'LED task light integrated.'
  },
  {
    id: '2414',
    code: '2414',
    type: 'SEWING',
    name: 'Industrial Lockstitch Station #14',
    room: '724',
    status: 'AVAILABLE',
    model: 'Brother S-7200C Nexio',
    totalUsageHours: 88,
    healthScore: 98,
    lastMaintained: '2026-08-05',
    notes: 'Pre-set for wool blends and outerwear seams.'
  },
  {
    id: '2415',
    code: '2415',
    type: 'SEWING',
    name: 'Industrial Lockstitch Station #15',
    room: '724',
    status: 'AVAILABLE',
    model: 'Singer 191D Commercial',
    totalUsageHours: 175,
    healthScore: 89,
    lastMaintained: '2026-07-25',
    notes: 'Sturdy classic commercial lockstitch.'
  },
  {
    id: '2416',
    code: '2416',
    type: 'SEWING',
    name: 'Industrial Lockstitch Station #16',
    room: '724',
    status: 'AVAILABLE',
    model: 'Singer 191D Commercial',
    totalUsageHours: 162,
    healthScore: 91,
    lastMaintained: '2026-07-25',
    notes: 'Equipped with piping and zipper attachment feet.'
  }
];

export const INITIAL_REQUESTS: BookingRequest[] = [
  {
    id: 'REQ-2026-0089',
    applicant: {
      studentName: 'Sophia Lin',
      studentId: 'STU-2024-8841',
      semester: 'Semester 4',
      classModule: 'FD204 - Advanced Pattern Drafting',
      lecturer: 'Prof. Clara Moreau',
      email: 'sophia.lin@student.fashion-institute.edu',
      contactNumber: '+1 (555) 234-5678'
    },
    requestDetails: {
      facilityRoom: '719',
      date: '2026-08-12',
      startTime: '14:00',
      endTime: '18:00',
      durationHours: 4,
      machineIds: ['2402'],
      purposeNotes: 'Assembling structured blazer collar and sleeve heads using heavyweight wool.',
      studentAgreement: true,
      studentSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50"><path d="M 10 30 Q 50 10 90 35 T 180 20" stroke="%233b82f6" stroke-width="2" fill="none"/></svg>',
      submittedAt: '2026-08-12T10:15:00Z'
    },
    approval: {
      status: 'IN_USE',
      verifiedByLecturer: 'Prof. Clara Moreau',
      decisionTimestamp: '2026-08-12T11:00:00Z',
      lecturerFeedback: 'Approved for blazer studio project. Ensure correct presser foot pressure for wool.',
      lecturerSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50"><path d="M 15 25 Q 60 5 110 30 T 170 15" stroke="%2310b981" stroke-width="2" fill="none"/></svg>'
    }
  },
  {
    id: 'REQ-2026-0091',
    applicant: {
      studentName: 'Alexander Hayes',
      studentId: 'STU-2023-7412',
      semester: 'Semester 6',
      classModule: 'FD302 - Haute Couture Finishing',
      lecturer: 'Assoc. Prof. Elena Rostova',
      email: 'a.hayes@student.fashion-institute.edu',
      contactNumber: '+1 (555) 876-5432'
    },
    requestDetails: {
      facilityRoom: '721',
      date: '2026-08-12',
      startTime: '13:00',
      endTime: '17:00',
      durationHours: 4,
      machineIds: ['2409'],
      purposeNotes: 'Silk georgette French seams and rolled hem finish for evening gown bodice.',
      studentAgreement: true,
      studentSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50"><path d="M 10 20 Q 70 40 120 15 T 185 30" stroke="%233b82f6" stroke-width="2" fill="none"/></svg>',
      submittedAt: '2026-08-12T09:30:00Z'
    },
    approval: {
      status: 'IN_USE',
      verifiedByLecturer: 'Assoc. Prof. Elena Rostova',
      decisionTimestamp: '2026-08-12T10:00:00Z',
      lecturerFeedback: 'Approved. Microtex 60/8 needle provided at technical desk.',
      lecturerSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50"><path d="M 20 30 Q 70 10 130 35 T 180 20" stroke="%2310b981" stroke-width="2" fill="none"/></svg>'
    }
  },
  {
    id: 'REQ-2026-0092',
    applicant: {
      studentName: 'Mia Chen',
      studentId: 'STU-2025-3390',
      semester: 'Semester 2',
      classModule: 'FD101 - Intro to Garment Construction',
      lecturer: 'Prof. Clara Moreau',
      email: 'mia.chen@student.fashion-institute.edu',
      contactNumber: '+1 (555) 443-2211'
    },
    requestDetails: {
      facilityRoom: '719',
      date: '2026-08-13',
      startTime: '09:00',
      endTime: '12:00',
      durationHours: 3,
      machineIds: ['2403', '2101'],
      purposeNotes: 'First trial sewing basic darts and edge serging on calico toile.',
      studentAgreement: true,
      studentSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50"><path d="M 10 35 Q 50 15 100 30 T 175 10" stroke="%233b82f6" stroke-width="2" fill="none"/></svg>',
      submittedAt: '2026-08-12T14:20:00Z'
    },
    approval: {
      status: 'PENDING',
      verifiedByLecturer: 'Prof. Clara Moreau'
    }
  },
  {
    id: 'REQ-2026-0085',
    applicant: {
      studentName: 'Julian Sterling',
      studentId: 'STU-2024-5519',
      semester: 'Semester 5',
      classModule: 'TX105 - Textile Structure & Weaving',
      lecturer: 'Dr. Marcus Vance',
      email: 'j.sterling@student.fashion-institute.edu',
      contactNumber: '+1 (555) 998-1122'
    },
    requestDetails: {
      facilityRoom: '724',
      date: '2026-08-11',
      startTime: '10:00',
      endTime: '13:00',
      durationHours: 3,
      machineIds: ['2414'],
      purposeNotes: 'Testing stitch endurance on custom jacquard weave samples.',
      studentAgreement: true,
      studentSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50"><path d="M 15 20 Q 80 45 130 15 T 190 25" stroke="%233b82f6" stroke-width="2" fill="none"/></svg>',
      submittedAt: '2026-08-11T08:00:00Z'
    },
    approval: {
      status: 'RETURNED',
      verifiedByLecturer: 'Dr. Marcus Vance',
      decisionTimestamp: '2026-08-11T08:45:00Z',
      lecturerFeedback: 'Sample test parameters verified. Good luck with tension evaluation.',
      lecturerSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50"><path d="M 15 25 Q 60 5 110 30 T 170 15" stroke="%2310b981" stroke-width="2" fill="none"/></svg>'
    },
    returnInfo: {
      returnedAt: '2026-08-11T13:05:00Z',
      returnCondition: 'EXCELLENT',
      checklist: {
        needleIntact: true,
        bobbinCaseClean: true,
        tensionCalibrated: true,
        accessoriesReturned: true,
        workspaceCleaned: true
      },
      verifiedByLecturer: 'Dr. Marcus Vance',
      lecturerNotes: 'Returned in pristine condition. Lint removed from hook area. Approved.',
      studentReturnNotes: 'Completed test run on 6 jacquard panels without issue.',
      isAccepted: true
    }
  }
];

export const INITIAL_MAINTENANCE_LOGS: MaintenanceLog[] = [
  {
    id: 'MNT-101',
    machineId: '2406',
    machineCode: '2406',
    machineType: 'SEWING',
    room: '719',
    reportedBy: 'Mr. David Tan',
    reportedAt: '2026-08-10T14:30:00Z',
    issueDescription: 'Needle deflection causing bird-nesting on underside of fabric. Rotary hook timing off by ~2mm.',
    severity: 'MEDIUM',
    status: 'IN_PROGRESS',
    resolutionNotes: 'Parts ordered: fresh rotary hook gasket and timing gauge calibration.'
  },
  {
    id: 'MNT-098',
    machineId: '2101',
    machineCode: '2101',
    machineType: 'OVERLOCKING',
    room: '719',
    reportedBy: 'Prof. Clara Moreau',
    reportedAt: '2026-08-06T11:00:00Z',
    issueDescription: 'Upper knife edge dulled after cutting heavy canvas edge. Replacement blade installed.',
    severity: 'LOW',
    status: 'RESOLVED',
    resolutionNotes: 'Upper and lower carbide blades sharpened and oiled. Test pass completed.'
  }
];
