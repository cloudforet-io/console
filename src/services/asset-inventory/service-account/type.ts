import type { JsonSchema } from '@spaceone/design-system/dist/src/inputs/forms/json-schema-form/type';

import type { Tags, TimeStamp } from '@/models';

import type { Tag } from '@/common/components/forms/tags-input-group/type';

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

export type ProjectGroup = ProjectItemResp;


// Service Account Forms
export type PageMode = 'CREATE' | 'UPDATE' | 'READ';
export interface BaseInformationForm {
    accountName: string;
    customSchemaForm: { [key: string]: any; };
    tags: Tag;
}

export type ActiveDataType = 'input' | 'json';
export interface CredentialForm {
    hasCredentialKey: boolean;
    selectedSecretType: string;
    customSchemaForm: { [key: string]: any; };
    credentialJson: string;
    activeDataType: ActiveDataType;
}

export interface ProjectForm {
    selectedProject: ProjectGroup | null;
}
