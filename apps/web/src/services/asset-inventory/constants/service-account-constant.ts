import { ACCOUNT_TYPE } from '@/schema/identity/service-account/constant';

import * as styles from '@/styles/colors';

import type { ProjectGroupMappingOption, WorkspaceMappingOption } from '@/services/asset-inventory/types/service-account-page-type';

// TRUSTED-MANAGED is not added as a constant because it is used only as a style option.
export const ACCOUNT_TYPE_BADGE_OPTION = {
    [ACCOUNT_TYPE.GENERAL]: { label: 'General Account', styleType: 'gray200' },
    [ACCOUNT_TYPE.TRUSTED]: { label: 'Trusted Account', styleType: 'blue200' },
    'TRUSTED-MANAGED': { label: 'Trusted Account - Managed', styleType: 'primary3' },
} as const;

export const ACCOUNT_STATE_COLOR = {
    ACTIVE: {
        iconColor: styles.green[600],
        textColor: styles.gray[900],
    },
    DELETED: {
        iconColor: styles.red[500],
        textColor: styles.gray[900],
    },
    PENDING: {
        iconColor: styles.yellow[500],
        textColor: styles.gray[900],
    },
    INACTIVE: {
        iconColor: styles.gray[400],
        textColor: styles.gray[400],
    },
} as const;

export const PROVIDER_ACCOUNT_NAME = {
    google_cloud: 'Project',
    azure: 'Subscription',
} as const;




/* Agent Account - k8s OpenCost Options
* - cluster_name
* - kube-state-metric
* - prometheus-node-exporter
* */
export const OPEN_COST_OPTIONS = {
    cluster_name: 'cluster_name',
    kube_state_metrics: 'kube-state-metrics',
    prometheus_node_exporter: 'prometheus-node-exporter',
} as const;

// 워크스페이스 매핑 옵션 (모든 CSP 공통)
export const WORKSPACE_MAPPING_OPTIONS: WorkspaceMappingOption[] = [
    {
        name: 'All Groups',
        target: 'Single Workspace',
        value: 'ALL_GROUPS_SINGLE_WORKSPACE',
    },
    {
        name: 'Top-Level Groups',
        target: 'Multiple Workspaces',
        value: 'TOP_LEVEL_GROUPS',
    },
    {
        name: 'Leaf-Level Groups',
        target: 'Multiple Workspaces',
        value: 'LEAF_LEVEL_GROUPS',
    },
    {
        name: 'Custom Depth Groups',
        target: 'Multiple Workspaces',
        value: 'CUSTOM_DEPTH_GROUPS',
    },
];

// 프로젝트 그룹 매핑 옵션 (모든 CSP 공통)
export const PROJECT_GROUP_MAPPING_OPTIONS: ProjectGroupMappingOption[] = [
    {
        name: 'Nested Sub-Groups',
        target: 'Project Groups',
        value: 'NESTED_SUB_GROUPS',
    },
    {
        name: 'Skip Sub-Group Mapping',
        target: '',
        value: 'SKIP',
    },
];

export const CSP_ORGANIZATION_TERMS = {
    aws: {
        name: 'AWS Organization',
        group: 'Organization Unit',
    },
    azure: {
        name: 'Azure Tenant',
        group: 'Management Group',
    },
    google_cloud: {
        name: 'Google Cloud Organization',
        group: 'Folder',
    },
} as const;
