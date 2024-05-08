import type { SEVERITY_STATUS_MAP, COMPLIANCE_STATUS_MAP } from '@/common/modules/widgets/_constants/compliance-constant';

export type Severity = keyof typeof SEVERITY_STATUS_MAP;
export type ComplianceStatus = keyof typeof COMPLIANCE_STATUS_MAP;
