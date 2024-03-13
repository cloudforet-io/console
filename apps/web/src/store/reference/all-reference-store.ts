/* eslint-disable import/no-cycle */
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import type { ReferenceLoadOptions } from '@/store/modules/reference/type';
import { useCloudServiceTypeReferenceStore } from '@/store/reference/cloud-service-type-reference-store';
import type { CloudServiceQuerySetReferenceMap } from '@/store/reference/cloue-service-query-set-reference-store';
import {
    useCloudServiceQuerySetReferenceStore,
} from '@/store/reference/cloue-service-query-set-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import {
    useCostDataSourceReferenceStore,
} from '@/store/reference/cost-data-source-reference-store';
import type { ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import { useProjectGroupReferenceStore } from '@/store/reference/project-group-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';
import { useProjectReferenceStore } from '@/store/reference/project-reference-store';
import { usePublicDashboardReferenceStore } from '@/store/reference/public-dashboard-reference-store';
import { useRegionReferenceStore } from '@/store/reference/region-reference-store';
import { useSecretReferenceStore } from '@/store/reference/secret-reference-store';
import { useServiceAccountReferenceStore } from '@/store/reference/service-account-reference-store';
import { useTrustedAccountReferenceStore } from '@/store/reference/trusted-account-reference-store';
import type { UserReferenceMap } from '@/store/reference/user-reference-store';
import { useUserReferenceStore } from '@/store/reference/user-reference-store';
import { useWebhookReferenceStore } from '@/store/reference/webhook-reference-store';
import type { WorkspaceReferenceMap } from '@/store/reference/workspace-reference-store';
import { useWorkspaceReferenceStore } from '@/store/reference/workspace-reference-store';


type PiniaStoreReferenceType =
    'cloud_service_type'
    |'cloud_service_query_set'
    |'collector'
    |'cost_data_source'
    |'plugin'
    |'project_group'
    |'project'
    |'protocol'
    |'provider'
    |'public_dashboard'
    |'region'
    |'secret'
    |'service_account'
    |'trusted_account'
    |'user'
    |'webhook'
    |'workspace';

export const useAllReferenceStore = defineStore('all-reference-store', () => {
    const cloudServiceTypeReferenceStore = useCloudServiceTypeReferenceStore();
    const costDataSourceReferenceStore = useCostDataSourceReferenceStore();
    const cloudServiceQuerySetReferenceStore = useCloudServiceQuerySetReferenceStore();
    const projectReferenceStore = useProjectReferenceStore();
    const projectGroupReferenceStore = useProjectGroupReferenceStore();
    const workspaceReferenceStore = useWorkspaceReferenceStore();
    const userReferenceStore = useUserReferenceStore();
    const publicDashboardReferenceStore = usePublicDashboardReferenceStore();
    const serviceAccountReferenceStore = useServiceAccountReferenceStore();
    const webhookReferenceStore = useWebhookReferenceStore();
    const trustedAccountReferenceStore = useTrustedAccountReferenceStore();
    const secretReferenceStore = useSecretReferenceStore();
    const regionReferenceStore = useRegionReferenceStore();

    const getters = reactive({
        cloudServiceType: computed(() => cloudServiceTypeReferenceStore.getters.cloudServiceTypeItems),
        projectGroup: computed<ProjectGroupReferenceMap>(() => projectGroupReferenceStore.getters.projectGroupItems),
        project: computed<ProjectReferenceMap>(() => projectReferenceStore.getters.projectItems),
        user: computed<UserReferenceMap>(() => userReferenceStore.getters.userItems),
        costDataSource: computed<CostDataSourceReferenceMap>(() => costDataSourceReferenceStore.getters.costDataSourceItems),
        cloudServiceQuerySet: computed<CloudServiceQuerySetReferenceMap>(() => cloudServiceQuerySetReferenceStore.getters.cloudServiceQuerySetItems),
        workspace: computed<WorkspaceReferenceMap>(() => workspaceReferenceStore.getters.workspaceItems),
        publicDashboard: computed(() => publicDashboardReferenceStore.getters.publicDashboardItems),
        serviceAccount: computed(() => serviceAccountReferenceStore.getters.serviceAccountItems),
        webhook: computed(() => webhookReferenceStore.getters.webhookItems),
        trustedAccount: computed(() => trustedAccountReferenceStore.getters.trustedAccountItems),
        secret: computed(() => secretReferenceStore.getters.secretItems),
        region: computed(() => regionReferenceStore.getters.regionItems),
    });

    const actions = {
        async sync(type: PiniaStoreReferenceType, data?: any) {
            switch (type) {
            case 'cloud_service_type':
                await cloudServiceTypeReferenceStore.sync(data); break;
            case 'project':
                await projectReferenceStore.sync(data); break;
            case 'project_group':
                await projectGroupReferenceStore.sync(data); break;
            case 'workspace':
                await workspaceReferenceStore.sync(data); break;
            case 'user':
                await userReferenceStore.sync(data); break;
            case 'public_dashboard':
                await publicDashboardReferenceStore.sync(data); break;
            case 'service_account':
                await serviceAccountReferenceStore.sync(data); break;
            case 'webhook':
                await webhookReferenceStore.sync(data); break;
            case 'trusted_account':
                await trustedAccountReferenceStore.sync(data); break;
            case 'secret':
                await secretReferenceStore.sync(data); break;
            case 'region':
                await regionReferenceStore.sync(data); break;
            default: break;
            }
        },
        async load(type: PiniaStoreReferenceType, options?: ReferenceLoadOptions) {
            switch (type) {
            case 'cloud_service_type':
                await cloudServiceTypeReferenceStore.load(options); break;
            case 'cost_data_source':
                await costDataSourceReferenceStore.load(options); break;
            case 'cloud_service_query_set':
                await cloudServiceQuerySetReferenceStore.load(options); break;
            case 'project':
                await projectReferenceStore.load(options); break;
            case 'project_group':
                await projectGroupReferenceStore.load(options); break;
            case 'workspace':
                await workspaceReferenceStore.load(options); break;
            case 'user':
                await userReferenceStore.load(options); break;
            case 'public_dashboard':
                await publicDashboardReferenceStore.load(options); break;
            case 'service_account':
                await serviceAccountReferenceStore.load(options); break;
            case 'webhook':
                await webhookReferenceStore.load(options); break;
            case 'trusted_account':
                await trustedAccountReferenceStore.load(options); break;
            case 'secret':
                await secretReferenceStore.load(options); break;
            case 'region':
                await regionReferenceStore.load(options); break;
            default: break;
            }
        },
        flush() {
            cloudServiceTypeReferenceStore.flush();
            costDataSourceReferenceStore.flush();
            cloudServiceQuerySetReferenceStore.flush();
            projectReferenceStore.flush();
            projectGroupReferenceStore.flush();
            workspaceReferenceStore.flush();
            userReferenceStore.flush();
            publicDashboardReferenceStore.flush();
            serviceAccountReferenceStore.flush();
            webhookReferenceStore.flush();
            trustedAccountReferenceStore.flush();
            secretReferenceStore.flush();
            regionReferenceStore.flush();
        },
    };

    return {
        getters,
        ...actions,
    };
});
