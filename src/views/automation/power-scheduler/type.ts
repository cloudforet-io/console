/* eslint-disable camelcase */
import { Filter } from '@/lib/space-connector/type';
import {
    gray, safe,
} from '@/styles/colors';
import { RawQuery } from '@/lib/query/type';

export const modes = ['READ', 'CREATE'];
export type ViewMode = typeof modes[number];

export const SCHEDULE_STATUS = {
    ON: {
        text: 'ON',
        textColor: safe,
        icon: 'ic_power-on',
    },
    OFF: {
        text: 'OFF',
        textColor: gray[400],
        icon: 'ic_power-off',
    },
    BOOTING: {
        text: 'BOOTING',
        textColor: safe,
        icon: 'ic_booting',
    },
    STOPPING: {
        text: 'STOPPING',
        textColor: gray[400],
        icon: 'ic_stopping',
    },
};

export interface Schedule {
    schedule_id: string;
    name: string;
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
