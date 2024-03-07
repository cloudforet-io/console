import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { CostDataSourceListParameters } from '@/schema/cost-analysis/data-source/api-verbs/list';
import type { CostDataSourceModel } from '@/schema/cost-analysis/data-source/model';
import type { DashboardTemplate } from '@/schema/dashboard/_types/dashboard-type';

import type { PluginReferenceMap } from '@/store/modules/reference/plugin/type';

import { awsCdnAndTrafficDashboard } from '@/services/dashboards/dashboard-template/templates/aws-cdn-and-traffic';
import { awsMonthlyCostSummaryDashboard } from '@/services/dashboards/dashboard-template/templates/aws-monthly-cost-summary';
import { azureMonthlyCostSummaryDashboard } from '@/services/dashboards/dashboard-template/templates/azure-monthly-cost-summary';
import { dCloComplianceOverviewDashboard } from '@/services/dashboards/dashboard-template/templates/d-clo-compliance-overview';
import { googleMonthlyCostSummaryDashboard } from '@/services/dashboards/dashboard-template/templates/google-monthly-cost-summary';
import { prowlerComplianceOverviewDashboard } from '@/services/dashboards/dashboard-template/templates/prowler-compliance-overview';


export const DASHBOARD_TEMPLATES = {
    // aws
    awsMonthlyCostSummary: awsMonthlyCostSummaryDashboard,
    awsCdnAndTraffic: awsCdnAndTrafficDashboard,
    // azure
    azureMonthlyCostSummary: azureMonthlyCostSummaryDashboard,
    // google
    googleMonthlyCostSummary: googleMonthlyCostSummaryDashboard,
    // etc
    prowlerComplianceOverview: prowlerComplianceOverviewDashboard,
    dCloComplianceOverview: dCloComplianceOverviewDashboard,
};

export const generateDashboardTemplateList = async (availablePlugins: PluginReferenceMap): Promise<DashboardTemplate[]> => {
    try {
        const { results } = await SpaceConnector.clientV2.costAnalysis.dataSource.list<CostDataSourceListParameters, ListResponse<CostDataSourceModel>>({
            query: {
                only: ['data_source_id', 'name', 'plugin_info', 'provider'],
            },
        });
        const templateMap: Record<string, DashboardTemplate> = {
        // aws
            awsMonthlyCostSummary: {
                ...DASHBOARD_TEMPLATES.awsMonthlyCostSummary,
                pluginIds: [
                    ...(results ?? []).filter((item) => item.provider === 'aws').map((item) => item.plugin_info.plugin_id),
                ],
            },
            awsCdnAndTraffic: {
                ...DASHBOARD_TEMPLATES.awsCdnAndTraffic,
                pluginIds: [
                    ...(results ?? []).filter((item) => item.provider === 'aws').map((item) => item.plugin_info.plugin_id),
                ],
            },
            // azure
            azureMonthlyCostSummary: {
                ...DASHBOARD_TEMPLATES.azureMonthlyCostSummary,
                pluginIds: [
                    ...(results ?? []).filter((item) => item.provider === 'azure').map((item) => item.plugin_info.plugin_id),
                ],
            },
            // google
            googleMonthlyCostSummary: {
                ...DASHBOARD_TEMPLATES.googleMonthlyCostSummary,
                pluginIds: [
                    ...(results ?? []).filter((item) => item.provider === 'google_cloud').map((item) => item.plugin_info.plugin_id),
                ],
            },
            // etc
            prowlerComplianceOverview: {
                ...DASHBOARD_TEMPLATES.prowlerComplianceOverview,
                pluginIds: ['plugin-prowler-inven-collector'],
            },
            dCloComplianceOverview: {
                ...DASHBOARD_TEMPLATES.dCloComplianceOverview,
                pluginIds: ['plugin-dclo-inven-collector'],
            },
        };

        const result: Record<string, DashboardTemplate> = {};
        Object.entries(templateMap).forEach(([key, value]) => {
            const isAvailable = value.pluginIds?.every((pluginId) => availablePlugins[pluginId]);
            if ((value.pluginIds ?? []).length > 0 && isAvailable) result[key] = value;
        });

        return Object.values(result);
    } catch (e) {
        console.error(e);
        return [];
    }
};
