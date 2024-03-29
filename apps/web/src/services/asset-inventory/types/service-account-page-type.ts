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
export interface CredentialForm {
    hasCredentialKey: boolean;
    selectedSecretSchema: SchemaModel;
    attachedTrustedAccountId?: string;
    credentialJson: string;
}

export interface ProjectForm {
    selectedProjectId: string;
}
