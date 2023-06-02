import { green, red } from '@/styles/colors';

export const SEVERITY_STATUS_MAP = {
    CRITICAL: { name: 'CRITICAL', label: 'Critical', color: red[400] },
    HIGH: { name: 'HIGH', label: 'High', color: red[300] },
    MEDIUM: { name: 'MEDIUM', label: 'Medium', color: red[200] },
    LOW: { name: 'LOW', label: 'Low', color: red[100] },
    PASS: { name: 'PASS', label: 'Pass', color: green[500] },
} as const;

export const COMPLIANCE_STATUS_MAP = {
    PASS: { name: 'PASS', label: 'Pass', color: green[500] },
    FAIL: { name: 'FAIL', label: 'Fail', color: red[400] },
} as const;
