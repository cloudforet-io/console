import {
    onMounted, reactive, ref, Ref, watch,
} from '@vue/composition-api';
import { TreeToolSet } from '@/components/molecules/tree-new/ToolSet';


export class TreeModalToolSet<initDataType,initSyncDataType> extends TreeToolSet<initDataType> {
    public syncState:any;


    constructor(initData:initDataType = {} as initDataType, initSyncData, treeApi:Ref<any> = ref(null)) {
        super(initData, treeApi);
        this.syncState = reactive({
            visible: false,
            ...initSyncData,
        });

        onMounted(() => {
            watch(() => this.syncState.visible, (now, pre) => {
                if (now && now !== pre) {
                    this.metaState.selectedNode = [];
                }
            });
        });
    }

    public getSelectedNode() {
        console.debug('this api', this.treeApi);
        this.metaState.selectedNode = this.treeApi.value.$refs['p-tree'].$refs.tree.selected();
    }
}
