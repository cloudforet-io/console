import { ACCOUNT_TYPE } from '@/schema/identity/service-account/constant';

// TRUSTED-MANAGED is not added as a constant because it is used only as a style option.
export const ACCOUNT_TYPE_BADGE_OPTION = {
    [ACCOUNT_TYPE.GENERAL]: { label: 'General Account', styleType: 'gray200' },
    [ACCOUNT_TYPE.TRUSTED]: { label: 'Trusted Account', styleType: 'blue200' },
    'TRUSTED-MANAGED': { label: 'Trusted Account - Managed', styleType: 'primary3' },
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
    kube_state_metric: 'kube-state-metric',
    prometheus_node_exporter: 'prometheus-node-exporter',
} as const;
