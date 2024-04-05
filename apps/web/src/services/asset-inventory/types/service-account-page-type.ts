import type { SchemaModel } from '@/schema/identity/schema/model';

import type { Tag } from '@/common/components/forms/tags-input-group/type';


// Service Account Forms
export type PageMode = 'CREATE' | 'UPDATE' | 'READ';
export interface BaseInformationForm {
    accountName: string;
    customSchemaForm: { [key: string]: any; };
    tags: Tag;
    projectForm: ProjectForm;
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
