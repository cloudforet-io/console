/* eslint-disable camelcase */
export enum ResourceUpdateType {
    add = 'ADD',
    delete = 'DELETE',
}

export interface ResourceDiffModel {
    provider: string;
    group: string;
    name: string | undefined;
    tags: {
        icon?: string | undefined;
    };
    update_type: ResourceUpdateType;
    count: number;
}

export interface JobsTrendsModel {
    date: string;
    success: number;
    failure: number;
}
