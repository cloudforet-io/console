/* eslint-disable camelcase */
import { Filter } from '@/lib/space-connector/type';
import {
    gray, safe, coral, peacock,
} from '@/styles/colors';
import { RawQuery } from '@/lib/query/type';

export const modes = ['READ', 'CREATE'];
export type ViewMode = typeof modes[number];

export const DESIRED_STATES = {
    ON: {
        text: 'ON',
        iconColor: safe,
        textColor: safe,
        icon: 'ic_power-on',
    },
    OFF: {
        text: 'OFF',
        iconColor: coral[600],
        textColor: gray[400],
        icon: 'ic_power-off',
    },
};

export const BOOTING_STATES = {
    BOOTING: {
        text: 'BOOTING',
        textColor: peacock[400],
        lottie: 'lottie_booting',
    },
    STOPPING: {
        text: 'STOPPING',
        textColor: coral[400],
        lottie: 'lottie_stopping',
    },
    NONE: {
        text: 'NONE',
        textColor: gray[400],
        disableIcon: true,
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
        raw_filter: RawQuery[];
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


// ScheduleTimeTable
export interface Rule {
    [key: string]: number[];
}

export interface RoutineRule {
    day?: string;
    times: number[];
}

export interface TicketRule {
    date?: string;
    times: number[];
}

export enum RULE_TYPE {
    routine = 'ROUTINE',
    ticket = 'TICKET',
}
export enum RULE_STATE {
    running = 'RUNNING',
    stopped = 'STOPPED',
}
