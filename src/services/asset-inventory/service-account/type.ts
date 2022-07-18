/* eslint-disable camelcase */
import type { JsonSchema } from '@spaceone/design-system/dist/src/inputs/forms/json-schema-form/type';

import type { Tags, TimeStamp } from '@/models';

import type { ProjectItemResp } from '@/services/project/type';

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
