import { api as consoleApi } from '@/lib/api/axios';
import { ApiType } from '@/lib/fluent-api/type';
import Monitoring from '@/lib/fluent-api/monitoring';
import InventoryService from './inventory';
import PluginService from './plugin';
import SecretService from './secret';
import IdentityService from './identity';
import RepositoryService from './repository';
import AddOns from './add-ons';
import Statistics from './statistics';
import StatisticsTest from './statistics/index-new';

export class FluentApi {
    constructor(public api: ApiType) { }

    inventory = (): InventoryService => new InventoryService(this.api);

    plugin = (): PluginService => new PluginService(this.api);

    secret = (): SecretService => new SecretService(this.api);

    identity = (): IdentityService => new IdentityService(this.api);

    repository = (): RepositoryService => new RepositoryService(this.api);

    addons = (): AddOns => new AddOns(this.api);

    statistics = (): Statistics => new Statistics(this.api);

    monitoring = (): Monitoring => new Monitoring(this.api);

    statisticsTest = (): StatisticsTest => new StatisticsTest(this.api);
}

export const fluentApi = new FluentApi(consoleApi);
export * from './type';
export * from './toolset';
