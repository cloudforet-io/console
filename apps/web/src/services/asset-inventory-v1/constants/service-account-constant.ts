import { ACCOUNT_TYPE } from '@/api-clients/identity/service-account/schema/constant';

import * as styles from '@/styles/colors';

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
