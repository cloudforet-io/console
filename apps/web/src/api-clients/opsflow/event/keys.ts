import type { EventListParameters } from '@/api-clients/opsflow/event/schema/api-verbs/list';

export const eventKeys = {
    all: ['event'],
    list: (params: EventListParameters) => [...eventKeys.all, 'list', params],
};

