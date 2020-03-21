import { DictPanelToolSet } from '@/components/organisms/panels/dict-panel/DictPanel.toolset';
import { Tags, UpdateAction } from '@/lib/fluent-api';
import { AxiosResponse } from 'axios';
import { Ref, UnwrapRef } from '@vue/composition-api/dist/reactivity';
import { getCurrentInstance } from '@vue/composition-api';


export class DictPanelAPI<D=any, SyncD=any> {
    ts: DictPanelToolSet;

    api: UpdateAction<Tags, AxiosResponse>;

    listeners: {save: any};

    protected vm = getCurrentInstance();

    constructor(initData: D = {} as D,
        initSyncData: SyncD = {} as SyncD,
        parentItem: Ref<any> | Ref<Readonly<any>>,
        api: UpdateAction<Tags, AxiosResponse>) {
        this.ts = new DictPanelToolSet<D, SyncD>(initData, initSyncData, parentItem);
        this.api = api;

        this.listeners = {
            save: async () => {
                this.ts.state.loading = true;
                this.api = this.api.setParameter({
                    tags: this.ts.syncState.dict,
                });
                this.api.debug();
                debugger;
                try {
                    await this.api.execute();
                    this.ts.listeners.save();
                    // @ts-ignore
                    // this.vm.$emit('update', this.ts.syncState.dict);
                } catch (e) {
                    console.error(e);
                } finally {
                    this.ts.state.loading = false;
                }
            },
        };
    }
}
