export type ProjectAlertConfigNotiUrgency = 'ALL'|'HIGH_ONLY';
export type ProjectAlertConfigRecoveryMode = 'AUTO'|'MANUAL';
export interface ProjectAlertConfigOptions {
    notification_urgency: ProjectAlertConfigNotiUrgency;
    recovery_mode: ProjectAlertConfigRecoveryMode;
}
