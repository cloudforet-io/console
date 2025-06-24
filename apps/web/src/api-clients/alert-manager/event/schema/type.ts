import type { EVENT_SEVERITY, EVENT_TYPE } from '@/api-clients/alert-manager/event/schema/constants';

export type EventSeverityType = typeof EVENT_SEVERITY[keyof typeof EVENT_SEVERITY];
export type EventType = typeof EVENT_TYPE[keyof typeof EVENT_TYPE];
