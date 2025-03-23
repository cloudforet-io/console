import type { EventListParameters } from '@/api-clients/opsflow/event/schema/api-verbs/list';

export const eventKeys = {
    list: (params: EventListParameters) => ['event', 'list', params] as const,
};
