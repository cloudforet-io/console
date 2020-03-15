import InventoryService from './inventory';

class FluentApi {
    public inventory=() => new InventoryService()
}
const fluentApi = new FluentApi();
export default fluentApi;
export * from './type';
export * from './toolset';
