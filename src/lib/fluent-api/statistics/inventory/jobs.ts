/* eslint-disable camelcase */
import {
    Resource, ResourceActions, TrendsAction,
} from '@/lib/fluent-api/toolset';
import { ListType } from '@/lib/fluent-api/type';

export interface JobsTrendsModel {
    date: string;
    success: number;
    failure: number;
}
class Trends extends TrendsAction<undefined, ListType<JobsTrendsModel>> {}

export default class Jobs extends Resource implements ResourceActions<'trends'> {
    protected name = 'jobs'

    trends(): Trends { return new Trends(this.baseUrl); }
}
