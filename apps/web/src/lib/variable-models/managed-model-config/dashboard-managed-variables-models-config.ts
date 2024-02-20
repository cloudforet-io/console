import type { VariableModelAdditionalConfig } from '@/lib/variable-models';
import type {
    IBaseVariableModel,
    IEnumVariableModel,
    IResourceVariableModel,
} from '@/lib/variable-models/_base/types';
import MANAGED_VARIABLE_MODELS from '@/lib/variable-models/managed-model-configs/base-managed-model-config';


interface ManagedVariableModel {
    model: new () => IEnumVariableModel | IResourceVariableModel | IBaseVariableModel;
    config?: {
        name?: string;
        key?: string;
        referenceKey?: string;
        prefetch?: boolean;
        labelsSchema?: IBaseVariableModel['labelsSchema'];
    };
    additionalConfig?: VariableModelAdditionalConfig;
}

const DASHBOARD_LABELS_SCHEMA = {
    provider: {
        key: 'provider',
        name: 'Provider',
        type: 'FILTER',
    },
};

const DASHBOARD_MANAGED_VARIABLE_MODELS: Record<string, ManagedVariableModel> = {
    // [MANAGED_VARIABLE_MODELS]
    // enum variable model
    // granularity: {
    //     model: GranularityVariableModel,
    // },
    // cost_default_field: CostDefaultFieldVariableModel,
    // cost_default_data_type: CostDefaultDataTypeVariableModel,
    // asset_default_field: AssetDefaultFieldVariableModel,
    // // resource name variable model
    // cost_data_source: CostDataSourceVariableModel,
    // provider: ProviderVariableModel,
    // cloud_service_query_set: CloudServiceQuerySetVariableModel,
    // cloud_service_type: CloudServiceTypeVariableModel,
    // collector: CollectorVariableModel,
    // project_group: ProjectGroupVariableModel,
    // project: ProjectVariableModel,
    // region: RegionVariableModel,
    // secret: SecretVariableModel,
    // service_account: ServiceAccountVariableModel,
    // user: UserVariableModel,
    // webhook: WebhookVariableModel,
    // workspace: WorkspaceVariableModel,
    // resource value variable model
    // asset_account: AssetAccountVariableModel,
    // cost_product: CostProductVariableModel,
    cost_product: {
        model: MANAGED_VARIABLE_MODELS.cost,
        config: {
            key: 'cost_product',
            name: 'Product (Cost)',
            referenceKey: 'product',
            labelsSchema: DASHBOARD_LABELS_SCHEMA,
        },
    },
    // cost_usage_type: CostUsageTypeVariableModel,
    // custom resource variable model
    // cost_additional_info_key: CostAdditionalInfoKeyVariableModel,
    // cost_tag_key: CostTagKeyVariableModel,
    // cost_data_key: CostDataKeyVariableModel,
    // asset_data_key: AssetDataKeyVariableModel,
    // asset_additional_info_key: AssetAdditionalInfoKeyVariableModel,
};

export type DashboardManagedVariableModelKey = keyof typeof DASHBOARD_MANAGED_VARIABLE_MODELS;
interface ModelConfig {
    key: DashboardManagedVariableModelKey;
    name: string;
    referenceKey?: string;
    labelsSchema?: IBaseVariableModel['labelsSchema'];
}
export const DASHBOARD_MANAGED_VARIABLE_MODEL_CONFIGS: Record<DashboardManagedVariableModelKey, ModelConfig> = {} as any;
Object.entries(DASHBOARD_MANAGED_VARIABLE_MODELS).forEach(([key, val]) => {
    // eslint-disable-next-line new-cap
    const model = new val.model();
    const config = val.config ?? {};

    Object.defineProperty(DASHBOARD_MANAGED_VARIABLE_MODEL_CONFIGS, key, {
        configurable: false,
        writable: false,
        value: {
            key,
            name: config.name ?? model.name,
            referenceKey: config?.referenceKey,
            labelsSchema: config?.labelsSchema,
        },
    });
});
