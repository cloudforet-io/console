import { api as consoleApi } from '@/lib/api/axios';
import { ApiType } from '@/lib/fluent-api/type';
import IdentityService from './identity';
import AddOns from './add-ons';

export class FluentApi {
    constructor(public api: ApiType) { }

    identity = (): IdentityService => new IdentityService(this.api);

    addons = (): AddOns => new AddOns(this.api);

}

export const fluentApi = new FluentApi(consoleApi);
export * from './type';
export * from './toolset';
