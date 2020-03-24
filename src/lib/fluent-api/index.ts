import InventoryService from './inventory';
import PluginService from './plugin';
import SecretService from './secret';
import IdentityService from './identity';

export class FluentApi {
    inventory = () => new InventoryService();

    plugin = () => new PluginService();

    secret = () => new SecretService();

    identity = () => new IdentityService();
}

export const fluentApi = new FluentApi();
export default fluentApi;
export * from './type';
export * from './toolset';
