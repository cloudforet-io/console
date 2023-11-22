import type { SEVERITY_STATUS_MAP, COMPLIANCE_STATUS_MAP } from '@/services/dashboards/widgets/_constants/compliance-constants';

export type Severity = keyof typeof SEVERITY_STATUS_MAP;
export type ComplianceStatus = keyof typeof COMPLIANCE_STATUS_MAP;
