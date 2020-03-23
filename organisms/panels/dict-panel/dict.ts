import { DictPanelToolSet } from '@/components/organisms/panels/dict-panel/DictPanel.toolset';
import {
    DictResource,
} from '@/lib/fluent-api';
import { FluentResourceAPIToolSet } from '@/lib/api/toolset';

export class DictPanelAPI<
    param=any, resp=any, D=any, SyncD=any,
    T extends DictPanelToolSet<D, SyncD> = DictPanelToolSet<D, SyncD>,
    actions extends DictResource<param, resp> = DictResource<param, resp>,
> extends FluentResourceAPIToolSet<param, resp, actions> {
    ts: DictPanelToolSet;

    protected idKey: string;

    protected tagsKey: string;

    // protected resourceItem: Ref<any> | Ref<Readonly<any>>;

    private id = '';

    constructor(actions: actions,
        // resourceItem?: Ref<any> | Ref<Readonly<any>>,
        initData: D = {} as D,
        initSyncData: SyncD = {} as SyncD,
        tagsKey = 'tags') {
        super(actions);
        this.ts = new DictPanelToolSet<D, SyncD>(initData, initSyncData);
        this.idKey = this.actions.get().getIdField();
        this.tagsKey = tagsKey;
        this.ts.listeners = {
            save: this.updateData,
        };

        // this.resourceItem = resourceItem;

        // watch(() => this.resourceItem.value, async (val) => {
        //     this.id = this.resourceItem.value[this.idKey];
        //     this.ts.toReadMode();
        //     await this.getData();
        // });
    }

    setId(id: string) {
        this.id = id;
    }

    getData = async () => {
        this.ts.state.loading = true;
        try {
            const res = await this.actions.get()
                .setId(this.id)
                .setOnly(this.tagsKey)
                .execute();
            this.ts.syncState.dict = res.data[this.tagsKey];
        } catch (e) {
            console.error(e);
        } finally {
            this.ts.state.loading = false;
        }
    }

    updateData = async () => {
        this.ts.state.loading = true;
        try {
            await this.actions.update()
                .setParameter({
                    [this.idKey]: this.id,
                    [this.tagsKey]: { ...this.ts.syncState.dict },
                } as any)
                .execute();
            this.ts.toReadMode();
        } catch (e) {
            console.error(e);
        } finally {
            this.ts.state.loading = false;
        }
    }
}
