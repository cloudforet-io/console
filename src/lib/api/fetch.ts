/* eslint-disable camelcase */
import { reactive } from '@vue/composition-api';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import { AxiosError } from 'axios';
import { fetchDataAPI } from '@/lib/api/toolset';
import { readonlyRefArg } from '@/lib/type';

export interface FetchApiState<params> {
    url: string;
    params: params;
}

export abstract class ChangeAPI<
        params = any,
        apiState extends FetchApiState<params> = FetchApiState<params>
    > extends fetchDataAPI {
    apiState: UnwrapRef<apiState>;

    protected constructor(initApiState: apiState) {
        super();
        this.apiState = reactive(initApiState);
    }

    protected hasError: (e: AxiosError) => Promise<any> =(e) => {
        console.error(this.apiState.url, e);
        return Promise.reject(e);
    };

    protected async requestData(data?: any, ...args: any[]) {
        const resp = this.$http.post(this.apiState.url, this.apiState.params).then(result => result, this.hasError);
        return resp;
    }
}
interface ReleaseProjectParams {
    release_project: boolean;
}
interface SetProjectParams {
    project_id: string;
}

export type ChangeProjectParams = ReleaseProjectParams | SetProjectParams

export class ChangeProjectAPI<
        params extends ChangeProjectParams= ChangeProjectParams,
    > extends ChangeAPI<params> {
    constructor(url: string, public resourceFieldName: string) {
        super({ url, params: {} as params });
    }

    async fetchData(resources: readonlyRefArg<string[]>, project_id?: string): Promise<void | any> {
        const release = !project_id;
        const params: any = { [this.resourceFieldName]: resources };
        if (release) {
            params.release_project = release;
        } else {
            params.project_id = project_id;
        }
        this.apiState.params = params;
        const resp = await this.requestData();
        return resp;
    }
}

export class MockChangeProject extends ChangeProjectAPI {
    constructor() {
        super('', 'mocks');
    }
}

export class ChangeServerProject extends ChangeProjectAPI {
    constructor() {
        super('/inventory/server/change-project', 'servers');
    }
}

export class ChangeCloudServiceProject extends ChangeProjectAPI {
    constructor() {
        super('/inventory/cloud-service/change-project', 'cloud_services');
    }
}
