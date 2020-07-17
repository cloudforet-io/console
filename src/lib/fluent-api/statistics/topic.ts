/* eslint-disable camelcase */
import { Resource, ResourceActions } from '@/lib/fluent-api/toolset';
import {
    StatTopicAction,
} from '@/lib/fluent-api/statistics/toolset';

export class CloudServiceType extends StatTopicAction<any, any> {
    path = 'cloud-service-type-page'

    showAll(show: boolean): this {
        this.apiState.extraParameter.show_all = show;
        return this.clone();
    }
}

export default class Topic extends Resource implements ResourceActions<'cloudServiceType'> {
    name = 'topic'

    cloudServiceType() { return new CloudServiceType(this.api, this.baseUrl); }
}
