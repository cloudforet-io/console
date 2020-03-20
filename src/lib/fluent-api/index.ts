import InventoryService from './inventory';
import PluginService from './plugin';
export class FluentApi {
    inventory = () => new InventoryService();
    plugin = ()=> new PluginService();
}

export const fluentApi = new FluentApi();
export default fluentApi;
export * from './type';
export * from './toolset';
