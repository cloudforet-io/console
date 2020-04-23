import { DynamicFluentAPIToolSet } from '@/lib/api/toolset';
import { ExportAction, ExportType } from '@/lib/fluent-api/add-ons/excel';
import { BaseTableFluentAPI } from '@/lib/api/table';
import config from '@/lib/config';
import { BaseGridFluentAPI } from '@/lib/api/grid';

export class ExcelExportAPIToolSet extends DynamicFluentAPIToolSet<any, any, ExportAction> {
    constructor(action: ExportAction, public target: BaseTableFluentAPI<any, any>|BaseGridFluentAPI) {
        super(action);
    }

    getAction = () => this.action
        .setUrl(this.target.action.url)
        .setParam({ ...this.target.getAction().getParameter() });

    getData= async (format: ExportType = 'xlsx') => {
        const result = await this.getAction().setFileType(format).execute();
        window.open(config.get('VUE_APP_API.ENDPOINT') + result.data.file_link);
    };
}
