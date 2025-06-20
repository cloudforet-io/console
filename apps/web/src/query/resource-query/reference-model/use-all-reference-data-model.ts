import { useAppReferenceDataModel } from '@/query/resource-query/reference-model/use-app-reference-data-model';
import { useCloudServiceTypeReferenceDataModel } from '@/query/resource-query/reference-model/use-cloud-service-type-reference-data-model';
import { useCollectorReferenceDataModel } from '@/query/resource-query/reference-model/use-collector-reference-data-model';
import { useCostDataSourceReferenceModel } from '@/query/resource-query/reference-model/use-cost-data-source-reference-data-model';
import { useMetricReferenceDataModel } from '@/query/resource-query/reference-model/use-metric-reference-data-model';
import { useNamespaceReferenceDataModel } from '@/query/resource-query/reference-model/use-namespace-reference-data-model';
import { useProjectGroupReferenceDataModel } from '@/query/resource-query/reference-model/use-project-group-reference-data-model';
import { useProjectReferenceDataModel } from '@/query/resource-query/reference-model/use-project-reference-data-model';
import { useProtocolReferenceDataModel } from '@/query/resource-query/reference-model/use-protocol-reference-data-model';
import { useProvodierReferenceDataModel } from '@/query/resource-query/reference-model/use-provider-reference-data-model';
import { useRegionReferenceDataModel } from '@/query/resource-query/reference-model/use-region-reference-data-model';
import { useRoleReferenceDataModel } from '@/query/resource-query/reference-model/use-role-reference-data-model';
import { useSecretReferenceDataModel } from '@/query/resource-query/reference-model/use-secret-reference-data-model';
import { useServiceAccountReferenceDataModel } from '@/query/resource-query/reference-model/use-service-account-reference-data-model';
import { useTrustedAccountReferenceDataModel } from '@/query/resource-query/reference-model/use-trusted-account-reference-data-model';
import { useUserGroupReferenceDataModel } from '@/query/resource-query/reference-model/use-user-group-reference-data-model';
import { useUserReferenceDataModel } from '@/query/resource-query/reference-model/use-user-reference-data-model';
import { useWorkspaceGroupReferenceDataModel } from '@/query/resource-query/reference-model/use-workspace-group-reference-data-model';
import { useWorkspaceReferenceDataModel } from '@/query/resource-query/reference-model/use-workspace-reference-data-model';

export const useAllReferenceDataModel = () => {
    const app = useAppReferenceDataModel();
    const workspace = useWorkspaceReferenceDataModel();
    const workspaceGroup = useWorkspaceGroupReferenceDataModel();
    const user = useUserReferenceDataModel();
    const userGroup = useUserGroupReferenceDataModel();
    const provider = useProvodierReferenceDataModel();
    const protocol = useProtocolReferenceDataModel();
    const cloudServiceType = useCloudServiceTypeReferenceDataModel();
    const collector = useCollectorReferenceDataModel();
    const costDataSource = useCostDataSourceReferenceModel();
    const metric = useMetricReferenceDataModel();
    const namespace = useNamespaceReferenceDataModel();
    const project = useProjectReferenceDataModel();
    const projectGroup = useProjectGroupReferenceDataModel();
    const role = useRoleReferenceDataModel();
    const region = useRegionReferenceDataModel();
    const secret = useSecretReferenceDataModel();
    const serviceAccount = useServiceAccountReferenceDataModel();
    const trustedAccount = useTrustedAccountReferenceDataModel();

    return {
        app: app.map,
        workspace: workspace.map,
        workspaceGroup: workspaceGroup.map,
        user: user.map,
        userGroup: userGroup.map,
        provider: provider.map,
        protocol: protocol.map,
        cloudServiceType: cloudServiceType.map,
        collector: collector.map,
        costDataSource: costDataSource.map,
        metric: metric.map,
        namespace: namespace.map,
        project: project.map,
        projectGroup: projectGroup.map,
        role: role.map,
        region: region.map,
        secret: secret.map,
        serviceAccount: serviceAccount.map,
        trustedAccount: trustedAccount.map,
    };
};
