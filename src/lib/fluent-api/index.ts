import { api as consoleApi } from '@/lib/api/axios';
import { ApiType } from '@/lib/fluent-api/type';
import InventoryService from './inventory';
import PluginService from './plugin';
import IdentityService from './identity';
import AddOns from './add-ons';
import StatisticsTest from './statistics/index-new';

export class FluentApi {
    constructor(public api: ApiType) { }

    inventory = (): InventoryService => new InventoryService(this.api);

    plugin = (): PluginService => new PluginService(this.api);

    identity = (): IdentityService => new IdentityService(this.api);

    addons = (): AddOns => new AddOns(this.api);

    statisticsTest = (): StatisticsTest => new StatisticsTest(this.api);
}

export const fluentApi = new FluentApi(consoleApi);
export * from './type';
export * from './toolset';
