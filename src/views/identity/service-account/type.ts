/* eslint-disable camelcase */
import { Tags, TimeStamp } from '@/models';
import { ProjectItemResp } from '@/views/project/project/type';
import { JsonSchema } from '@spaceone/design-system/dist/src/inputs/forms/json-schema-form/type';

const idField = 'provider';

interface IdParameter {
    [idField]: string;
}

export interface ProviderModel extends Tags, IdParameter{
    name: string;
    template: {
        service_account: {
            schema: JsonSchema<'object'>;
        };
    };
    capability: {
        supported_schema: string[];
    };
    created_at: TimeStamp;
}

export type ProjectGroup = ProjectItemResp
