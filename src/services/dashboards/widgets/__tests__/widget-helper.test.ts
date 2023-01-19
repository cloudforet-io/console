import { describe, expect, it } from 'vitest';

import basePieWidgetConfig from '@/services/dashboards/widgets/_base/base-pie/widget-config';
import { getWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-helper';
import costMapWidgetConfig from '@/services/dashboards/widgets/cost-map/widget-config';
import costPieWidgetConfig from '@/services/dashboards/widgets/cost-pie/widget-config';
import costTrendWidgetConfig from '@/services/dashboards/widgets/cost-trend/widget-config';
import monthlyCostWidgetConfig from '@/services/dashboards/widgets/monthly-cost/widget-config';

const costPieConfigId = costPieWidgetConfig.widget_config_id;
const basePieConfigId = basePieWidgetConfig.widget_config_id;
const costTrendConfigId = costTrendWidgetConfig.widget_config_id;
const monthlyCostWidgetConfigId = monthlyCostWidgetConfig.widget_config_id;
const costMapWidgetConfigId = costMapWidgetConfig.widget_config_id;
const costPieSchema = costPieWidgetConfig.options_schema?.schema;

describe('[Widget Helper] getWidgetConfig', () => {
    it('Get console widget config by config id', () => {
        if (!costPieConfigId) throw new Error('Can not test. No widget config id in costPieConfigId');
        const costPieWidgetMergedConfig = getWidgetConfig(costPieConfigId);
        expect(costPieWidgetMergedConfig).toBeTruthy();
    });
    it('Do not get base widget config by config id', () => {
        if (!basePieConfigId) throw new Error('Can not test. No widget config id in basePieConfigId');
        const basePieConfig = getWidgetConfig(basePieConfigId);
        expect(basePieConfig).toBeFalsy();
    });
    it('Merge configs by base configs', () => {
        expect(costPieSchema?.properties?.['filters.provider']).toBeTruthy();

        if (!costPieConfigId) throw new Error('Can not test. No widget config id in costPieConfigId');
        const mergedCostPieConfig = getWidgetConfig(costPieConfigId);
        expect(mergedCostPieConfig.options_schema?.schema?.properties['filters.provider']).toBeTruthy();
    });
    it('Merge default_properties of base trend config', () => {
        const mergedBaseTrendConfig = getWidgetConfig(costTrendConfigId);
        expect(mergedBaseTrendConfig?.options_schema?.default_properties).toEqual(expect.arrayContaining([
            'filters.provider', 'filters.project_id', 'filters.service_account_id',
        ]));
    });
    it('test MonthlyCostWidget', () => {
        const mergedMonthlyCostWidgetConfig = getWidgetConfig(monthlyCostWidgetConfigId);
        expect(mergedMonthlyCostWidgetConfig?.options_schema?.default_properties).toEqual(expect.arrayContaining([
            'filters.provider', 'filters.project_id', 'filters.service_account_id',
        ]));
    });
    it('test CostMapWidget', () => {
        const mergedCostMapWidgetConfig = getWidgetConfig(costMapWidgetConfigId);
        expect(mergedCostMapWidgetConfig?.options_schema?.default_properties).toEqual(expect.arrayContaining([
            'group_by', 'filters.provider', 'filters.project_id', 'filters.service_account_id',
        ]));
    });
});
