/* eslint-disable camelcase */
import {
    ListAction, Resource,
    ResourceActions,
} from '@/lib/fluent-api/toolset';
import {
    ListType, LogListType,
} from '@/lib/fluent-api/type';

const idField = 'project_id';
interface IdParameter {
    [idField]: string;
}

export interface AwsHealthModel extends IdParameter {
    eventTypeCode: string;
    eventTypeCategory: string;
    region: string;
    reference: {
        resource_id: string;
        external_link: string;
    };
    count: number;
}

export type AwsHealthListResp = LogListType<AwsHealthModel>

class List extends ListAction<any, AwsHealthListResp> {
    setId(id: string): this {
        this.apiState.extraParameter.project_id = id;
        return this.clone();
    }

    setDateSubtractor(date: number): this {
        this.apiState.extraParameter.date_subtractor = date;
        return this.clone();
    }
}

export default class AwsHealth extends Resource implements ResourceActions<'list'> {
    protected name = 'aws-health';

    list() { return new List(this.api, this.baseUrl); }
}
