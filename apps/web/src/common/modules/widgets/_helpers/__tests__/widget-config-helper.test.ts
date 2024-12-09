import {
    describe,
    // expect, it
} from 'vitest';

// import basePieWidgetConfig from '@/services/dashboards/widgets/_base/base-pie/widget-config';
// import { getWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-helper';
// import costPieWidgetConfig from '@/services/dashboards/widgets/cost-widgets/cost-pie/widget-config';

// const costPieConfigId = costPieWidgetConfig.widget_config_id;
// const basePieConfigId = basePieWidgetConfig.widget_config_id;
// const costPieSchema = costPieWidgetConfig.options_schema;

describe('[Widget Config Helper] getWidgetConfig', () => {
    // NOTE: SpaceConnector must be initialized before testing
    it('dummy test', () => {
        expect(true).toBeTruthy();
    });
    // it('Get console widget config by config id', () => {
    //     if (!costPieConfigId) throw new Error('Can not test. No widget config id in costPieConfigId');
    //     const costPieWidgetMergedConfig = getWidgetConfig(costPieConfigId);
    //     expect(costPieWidgetMergedConfig).toBeTruthy();
    // });
    // it('Do not get base widget config by config id', () => {
    //     if (!basePieConfigId) throw new Error('Can not test. No widget config id in basePieConfigId');
    //     const basePieConfig = getWidgetConfig(basePieConfigId);
    //     expect(basePieConfig).toBeFalsy();
    // });
    // it('Merge configs by base configs', () => {
    //     expect(costPieSchema?.properties?.['filters.provider']).toBeTruthy();
    //
    //     if (!costPieConfigId) throw new Error('Can not test. No widget config id in costPieConfigId');
    //     const mergedCostPieConfig = getWidgetConfig(costPieConfigId);
    //     expect(mergedCostPieConfig.options_schema?.properties['filters.provider']).toBeTruthy();
    // });
});
