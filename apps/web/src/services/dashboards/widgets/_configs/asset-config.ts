import { green, red } from '@/styles/colors';

export const SEVERITY_STATUS_MAP = {
    CRITICAL: {
        name: 'CRITICAL', label: 'Critical', color: red[400], priority: 1,
    },
    HIGH: {
        name: 'HIGH', label: 'High', color: red[300], priority: 2,
    },
    MEDIUM: {
        name: 'MEDIUM', label: 'Medium', color: red[200], priority: 3,
    },
    LOW: {
        name: 'LOW', label: 'Low', color: red[100], priority: 4,
    },
    PASS: {
        name: 'PASS', label: 'Pass', color: green[500], priority: 5,
    },
} as const;
export type Severity = keyof typeof SEVERITY_STATUS_MAP;

export const COMPLIANCE_STATUS_MAP = {
    PASS: { name: 'PASS', label: 'Pass', color: green[500] },
    FAIL: { name: 'FAIL', label: 'Fail', color: red[400] },
} as const;
export type ComplianceStatus = keyof typeof COMPLIANCE_STATUS_MAP;

type CloudServiceStatsKey = 'compliance_count'|
    'pass_check_count'|'fail_check_count'|
    'pass_finding_count'|'fail_finding_count'|
    'pass_score'|'fail_score';

export interface CloudServiceStatsModel {
    date: string;
    key: CloudServiceStatsKey;
    unit: string; // ex. Count
}
