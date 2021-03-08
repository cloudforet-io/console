/* eslint-disable camelcase */
import { Tags, TimeStamp } from '@/models';
import { JsonSchema } from '@/lib/type';
import { ItemType, ProjectItemResp } from '@/views/project/project/type';

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
