/* eslint-disable camelcase */
import {
    CountAction, Resource, ResourceActions, TrendsAction,
} from '@/lib/fluent-api/toolset';
import { ListType } from '@/lib/fluent-api/type';

export interface ProjectTrendsModel {
    data: number[];
}

export interface ProjectCountModel {
    project_group: string;
    project: string;
    servers: number;
    cloud_services: number;
}
class Trends extends TrendsAction<undefined, ProjectTrendsModel> {}
class Count extends CountAction<undefined, ListType<ProjectCountModel>> {}
export default class Project extends Resource implements ResourceActions<'trends' | 'count'> {
    protected name = 'project'

    trends(): Trends { return new Trends(this.baseUrl); }

    count(): Count { return new Count(this.baseUrl); }
}
