import type { FeatureConfigurator } from '@/lib/config/global-config/types/type';

import AlertManagerConfigurator from '@/services/alert-manager/configurator';
import AssetInventoryConfigurator from '@/services/asset-inventory/configurator';
import CostExplorerConfigurator from '@/services/cost-explorer/configurator';
import DashboardConfigurator from '@/services/dashboards/configurator';
import IamConfigurator from '@/services/iam/configurator';
import OpsFlowConfigurator from '@/services/ops-flow/configurator';
import ProjectConfigurator from '@/services/project/configurator';
import ServiceAccountConfigurator from '@/services/service-account/configurator';

const configurators = {
    DASHBOARDS: DashboardConfigurator,
    PROJECT: ProjectConfigurator,
    SERVICE_ACCOUNT: ServiceAccountConfigurator,
    ASSET_INVENTORY: AssetInventoryConfigurator,
    COST_ANALYSIS: CostExplorerConfigurator,
    ALERT_MANAGER: AlertManagerConfigurator,
    OPS_FLOW: OpsFlowConfigurator,
    IAM: IamConfigurator,
} as const;

export const getFeatureConfigurator = (featureName: string): FeatureConfigurator | null => configurators[featureName] || null;
