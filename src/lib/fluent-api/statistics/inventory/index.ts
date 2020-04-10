import {GetAction, Resource, ResourceActions, ServiceResources} from '@/lib/fluent-api';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface GetParameter {
    //
}
class Get extends GetAction<GetParameter, any> {

}

export default class Inventory extends Resource implements ServiceResources<'server' | 'cloudService'> {
    name: 'inventory'
    server() {}
}
