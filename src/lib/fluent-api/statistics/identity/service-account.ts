/* eslint-disable camelcase */
import {
    CountAction, Resource, ResourceActions,
} from '@/lib/fluent-api/toolset';

export interface ServiceAccountCountModel {
    [provider: string]: number;
}
class Count extends CountAction<undefined, ServiceAccountCountModel> {}
export default class ServiceAccount extends Resource implements ResourceActions<'count'> {
    protected name = 'service-account'

    count(): Count { return new Count(this.api, this.baseUrl); }
}
