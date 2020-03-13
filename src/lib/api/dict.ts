import { AxiosInstance, AxiosResponse } from 'axios';
import { DictIGToolSet } from '@/components/organisms/forms/dict-input-group/DictInputGroup.toolset';

// TODO: find axios type
export type requestApiType = (url: string, params?: any) => Promise<AxiosResponse<any>>;

export abstract class BaseDictAPI<D = any, T extends DictIGToolSet<D> = DictIGToolSet<D>> {
    public abstract ts: T;

    protected abstract url: string;

    protected abstract requestData: requestApiType;

    public abstract paramsFormatter: (params) => any;

    public abstract afterFetch: (res: AxiosResponse<any>, params?: any) => void;

    protected async fetchApi(params?: any) {
        try {
            // TODO: loading
            const res = await this.requestData(this.url, this.paramsFormatter(params));
            this.afterFetch(res, params);
        } catch (e) {
            console.error(e);
        } finally {
            // TODO: loading
        }
    }
}
