import type { SchemaModel } from '@/api-clients/identity/schema/schema/model';

import type { Tag } from '@/common/modules/tags/type';


// Service Account Forms
export type PageMode = 'CREATE' | 'UPDATE' | 'READ';
export interface BaseInformationForm {
    accountName: string;
    customSchemaForm: { [key: string]: any; };
    serviceAccountManagerId?: string;
    tags: Tag;
    projectForm?: ProjectForm;
}
export type ActiveDataType = 'input' | 'json';

export interface CredentialForm {
    hasCredentialKey: boolean;
    selectedSecretSchema: SchemaModel;
    attachedTrustedAccountId?: string;
    credentialJson: string;
    customSchemaForm: { [key: string]: any; };
    activeDataType: ActiveDataType;
}

export interface ProjectForm {
    selectedProjectId: string;
}
