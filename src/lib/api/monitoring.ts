import { fluentApi } from '@/lib/fluent-api';
import { DynamicAPI } from '@/lib/api/toolset';
import { MonitoringToolSet } from '@/components/organisms/monitoring/Monitoring.toolset';
import { MONITORING_TYPE, DataSourceResp, STATISTICS_TYPE } from '@/lib/fluent-api/monitoring/type';
import _ from 'lodash';
import { watch } from '@vue/composition-api';
import { BaseTableFluentAPI } from '@/lib/api/table';

export class MetricAPI<
    param, resp, D,
    T extends MonitoringToolSet<D> = MonitoringToolSet<D>,
> extends DynamicAPI {
    ts: MonitoringToolSet<D>;

    protected dataSourceApi = fluentApi.monitoring().dataSource().list().setMonitoringType(MONITORING_TYPE.metric);

    dataSources: DataSourceResp[] = [];

    protected target: BaseTableFluentAPI;

    constructor(
        resourceType: string,
        idField: string,
        target: BaseTableFluentAPI,
        initData: D = {} as D,
    ) {
        super();
        this.ts = new MonitoringToolSet(idField, resourceType, initData);
        this.target = target;
        this.listDataSources();

        watch(() => this.target.tableTS.selectState.selectItems, (items) => {
            this.ts.setResources(items);
        });
    }

    listDataSources = async () => {
        try {
            const res = await this.dataSourceApi.execute();
            this.dataSources = res.data.results;
            this.ts.setDataTools(this.dataSources);
            // this.ts.setStatisticsTypes(this.dataSources);
        } catch (e) {
            console.error(e);
        }
    }
}
