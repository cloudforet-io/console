/* eslint-disable camelcase */
import {
    ListType, TimeStamp,
} from '@/lib/fluent-api/type';
import { ListAction, Resource, ResourceActions } from '@/lib/fluent-api/toolset';

export enum REPOSITORY_TYPE {
    remote = 'remote',
    local = 'local'
}
export interface RepositoryListParameter {
    repository_id?: string;
    name?: string;
    repository_type?: REPOSITORY_TYPE;
}

export interface RepositoryModel {
    repository_id: string;
    name: string;
    repository_type: REPOSITORY_TYPE;
    endpoint: string;
    version: string;
    secret_id: string;
    created_at: TimeStamp;
}

export type RepositoryListResp = ListType<RepositoryModel>

class RepositoryList extends ListAction<RepositoryListParameter, RepositoryListResp> {}

export default class Repository extends Resource implements ResourceActions<'list'> {
    protected name = 'repository';

    list(): RepositoryList { return new RepositoryList(this.api, this.baseUrl); }
}
