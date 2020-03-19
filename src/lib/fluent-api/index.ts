import InventoryService from './inventory';

export class FluentApi {
    inventory = () => new InventoryService()
}

export const fluentApi = new FluentApi();
export default fluentApi;
export * from './type';
export * from './toolset';
