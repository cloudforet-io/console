/* eslint-disable camelcase */
import {
    CreateAction, GetAction, ListAction, Resource,
    ResourceActions, SingleDeleteAction, UpdateAction,
} from '@/lib/fluent-api/toolset';
import {
    ListType, Tags, TimeStamp,
} from '@/lib/fluent-api/type';
import { COLLECT_MODE, CollectorModel } from '@/lib/fluent-api/inventory/collector.type';

const idField = 'job_id';

interface IdParameter {
    [idField]: string;
}

export enum JOB_STATE {
    created = 'CREATED',
    progress = 'IN_PROGRESS',
    failure = 'FAILURE',
    timeout = 'TIMEOUT',
    canceled = 'CANCELED',
    success = 'SUCCESS'
}


export interface JobParam {
    job_id?: string;
    state?: JOB_STATE;
    collect_mode?: COLLECT_MODE;
    collector_id?: string;
    resource_type?: string;
    resource_id?: string;
}

export interface JobModel {
    job_id: string;
    state: JOB_STATE;
    collect_mode: COLLECT_MODE;
    collector_info: CollectorModel;
    secret_id: string;
    filter: any;
    errors: {
        code: string;
        message: string;
        secret_id?: string;
    }[];
    created_at: TimeStamp;
    finished_at: TimeStamp;
}


export type JobListResp = ListType<JobModel>

class List extends ListAction<JobParam, JobListResp> {
    setId(id: string): this {
        const api = this.clone();
        api.apiState.extraParameter.job_id = id;
        return api;
    }

    setState(state: JOB_STATE): this {
        const api = this.clone();
        api.apiState.extraParameter.state = state;
        return api;
    }

    setCollectMode(collectMode: COLLECT_MODE): this {
        const api = this.clone();
        api.apiState.extraParameter.collect_mode = collectMode;
        return api;
    }

    setCollectorId(collectorId: string): this {
        const api = this.clone();
        api.apiState.extraParameter.collector_id = collectorId;
        return api;
    }

    setResourceType(type: string): this {
        const api = this.clone();
        api.apiState.extraParameter.resource_type = type;
        return api;
    }

    setResourceId(resourceId: string): this {
        const api = this.clone();
        api.apiState.extraParameter.resource_id = resourceId;
        return api;
    }
}

export default class Job extends Resource implements ResourceActions<'list'> {
    protected name = 'job';

    list() { return new List(this.api, this.baseUrl); }
}
