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

// 워크스페이스 매핑 타입
export type WorkspaceMappingType =
    | 'ALL_GROUPS_SINGLE_WORKSPACE'
    | 'TOP_LEVEL_GROUPS'
    | 'LEAF_LEVEL_GROUPS'
    | 'CUSTOM_DEPTH_GROUPS';

// 프로젝트 그룹 매핑 타입
export type ProjectGroupMappingType =
    | 'NESTED_SUB_GROUPS'
    | 'SKIP';

// 워크스페이스 매핑 옵션
export interface WorkspaceMappingOption {
    name: string;
    target: string;
    value: WorkspaceMappingType;
    description?: string;
}

// 프로젝트 그룹 매핑 옵션
export interface ProjectGroupMappingOption {
    name: string;
    target: string;
    value: ProjectGroupMappingType;
    description?: string;
}

// Auto Sync 폼 데이터 확장
export interface AutoSyncForm {
    workspaceMappingType: WorkspaceMappingType;
    projectGroupMappingType: ProjectGroupMappingType;
    customDepth?: number; // 커스텀 뎁스 선택시 사용
    selectedSingleWorkspace?: string; // ALL_GROUPS_SINGLE_WORKSPACE 선택시 사용
}
