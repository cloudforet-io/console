/* eslint-disable camelcase */
import { QueryFilters } from '@/lib/type';
import { Filter } from '@/lib/space-connector/type';
import { gray, safe, coral } from '@/styles/colors';

export const modes = ['READ', 'CREATE'];
export type ViewMode = typeof modes[number];

export const DESIRED_STATES = {
    ON: {
        label: 'ON',
        iconColor: safe,
        textColor: safe,
        icon: 'ic_power-off',
    },
    OFF: {
        label: 'OFF',
        iconColor: coral[600],
        textColor: gray[400],
        icon: 'ic_power-on',
    },
};

export const BOOTING_STATES = {
    BOOTING: {
        label: 'BOOTING',
        iconColor: safe,
        textColor: safe,
        icon: 'ic_power-on',
    },
    STOPPING: {
        label: 'STOPPING',
        iconColor: safe,
        textColor: safe,
        icon: 'ic_power-on',
    },
    NONE: {
        label: 'NONE',
        iconColor: coral[600],
        textColor: gray[400],
        icon: 'ic_power-on',
    },
};

export interface Schedule {
    // eslint-disable-next-line camelcase
    schedule_id: string;
    name: string;
    desired_state?: keyof typeof DESIRED_STATES;
    job_status?: keyof typeof BOOTING_STATES;
}

export const defaultSchedule: Schedule = { name: '', schedule_id: '' };

export interface Resource {
    resource_type: string;
    filter: Filter[];
    keyword: string;
}

export interface ResourceGroup {
    resource_group_id?: string;
    name: string;
    resources: Resource[];
    options: {
        raw_filter: QueryFilters;
    };
    // tags?: object;
}

export interface KanbanItem {
    resource_group?: ResourceGroup;
    name?: string;
    count?: number;
    icon?: string;
    recommended?: boolean;
}

export type ResourceGroupItem = Pick<Required<KanbanItem>, 'resource_group'|'count'|'name'|'recommended'>
