import type { BookingRequest, RequestStatus, MachineStatus } from '../types/lab';

export function generateBookingId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  return `REQ-${year}-${num}`;
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateTimeStr: string): string {
  try {
    const d = new Date(dateTimeStr);
    if (isNaN(d.getTime())) return dateTimeStr;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateTimeStr;
  }
}

export function getStatusBadge(status: RequestStatus): { label: string; colorClass: string; bgClass: string } {
  switch (status) {
    case 'PENDING':
      return { label: 'Pending Verification', colorClass: 'text-amber-500', bgClass: 'bg-amber-500/10 border-amber-500/30' };
    case 'APPROVED':
      return { label: 'Approved', colorClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10 border-emerald-500/30' };
    case 'IN_USE':
      return { label: 'In Studio Usage', colorClass: 'text-cyan-400', bgClass: 'bg-cyan-500/10 border-cyan-500/30' };
    case 'RETURNED':
      return { label: 'Completed & Returned', colorClass: 'text-blue-400', bgClass: 'bg-blue-500/10 border-blue-500/30' };
    case 'REJECTED':
      return { label: 'Request Rejected', colorClass: 'text-rose-400', bgClass: 'bg-rose-500/10 border-rose-500/30' };
    case 'OVERDUE':
      return { label: 'Overdue Return', colorClass: 'text-purple-400', bgClass: 'bg-purple-500/10 border-purple-500/30' };
    default:
      return { label: status, colorClass: 'text-slate-400', bgClass: 'bg-slate-500/10 border-slate-500/30' };
  }
}

export function getMachineStatusBadge(status: MachineStatus): { label: string; dotColor: string } {
  switch (status) {
    case 'AVAILABLE':
      return { label: 'Ready / Available', dotColor: 'bg-emerald-500' };
    case 'IN_USE':
      return { label: 'Active Session', dotColor: 'bg-cyan-500' };
    case 'RESERVED':
      return { label: 'Reserved', dotColor: 'bg-amber-500' };
    case 'MAINTENANCE':
      return { label: 'Under Maintenance', dotColor: 'bg-rose-500' };
  }
}

export function exportRequestsToCSV(requests: BookingRequest[]): void {
  const headers = [
    'Request ID',
    'Student Name',
    'Student ID',
    'Semester',
    'Class Module',
    'Lecturer',
    'Room',
    'Date',
    'Time Slot',
    'Machine IDs',
    'Status',
    'Return Condition',
    'Lecturer Verification Notes'
  ];

  const rows = requests.map(r => [
    r.id,
    `"${r.applicant.studentName.replace(/"/g, '""')}"`,
    r.applicant.studentId,
    r.applicant.semester,
    `"${r.applicant.classModule.replace(/"/g, '""')}"`,
    `"${r.applicant.lecturer.replace(/"/g, '""')}"`,
    r.requestDetails.facilityRoom,
    r.requestDetails.date,
    `${r.requestDetails.startTime} - ${r.requestDetails.endTime}`,
    `"${r.requestDetails.machineIds.join(', ')}"`,
    r.approval.status,
    r.returnInfo ? r.returnInfo.returnCondition : 'N/A',
    `"${(r.returnInfo?.lecturerNotes || r.approval.lecturerFeedback || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Lab_Equipment_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
