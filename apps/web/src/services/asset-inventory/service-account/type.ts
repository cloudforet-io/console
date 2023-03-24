import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';

import type { Tags, TimeStamp } from '@/models';

import type { Tag } from '@/common/components/forms/tags-input-group/type';

import type { ACCOUNT_TYPE } from '@/services/asset-inventory/service-account/config';
import type { ProjectItemResp } from '@/services/project/type';

const idField = 'provider';

interface IdParameter {
    [idField]: string;
}

export interface ProviderModel extends Tags, IdParameter {
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
export const EDIT_MODE = ['CREATE', 'UPDATE'];
export type PageMode = 'CREATE' | 'UPDATE' | 'READ';
export interface BaseInformationForm {
    accountName: string;
    customSchemaForm: { [key: string]: any; };
    tags: Tag;
}
export interface ServiceAccountModel {
    name: string;
    provider: string;
    service_account_id: string;
    service_account_type?: AccountType;
    data: {
        [key: string]: string;
    },
    tags: {[key: string]: unknown; };
}
export interface ServiceAccountModelForBinding extends Omit<ServiceAccountModel, 'service_account_type'> {
    service_account_type?: AccountType | 'TRUSTED-MANAGED';
}

export type AccountType = typeof ACCOUNT_TYPE[keyof typeof ACCOUNT_TYPE];

export type ActiveDataType = 'input' | 'json';
export interface CredentialForm {
    hasCredentialKey: boolean;
    selectedSecretType: string;
    customSchemaForm: { [key: string]: any; };
    credentialJson: string;
    activeDataType: ActiveDataType;
    attachedTrustedAccountId?: string;
    attachedTrustedSecretId?: string;
}
export interface CredentialModel {
    secret_id?: string;
    trusted_secret_id?: string;
    service_account_id?: string;
    name?: string;
    schema?: string;
    provider?: string;
    secret_type?: string;
    [key: string]: string | undefined;
}

export interface ProjectForm {
    selectedProjectId: string | null;
}
