<template>
    <div v-if="subData.length >= 1">
        <p-select-btn-group
            style="margin-bottom: 1rem"
            :buttons="buttons" :selected.sync="selected" @clickButton="apiHandler.getData"
        />
        <p-dynamic-view :api-handler="apiHandler" v-bind="selectData" />
    </div>
    <p-empty v-else style="margin-top: 1rem">
        No data
    </p-empty>
</template>

<script lang="ts">
import {
    onMounted, reactive, toRefs, watch, computed, defineComponent, Ref,
} from '@vue/composition-api';
import _ from 'lodash';
import { SubDataAPI, HttpInstance } from '@/lib/api';
import PDynamicView from '@/components/organisms/dynamic-view/dynamic-view/DynamicView.vue';
import PSelectBtnGroup from '@/components/organisms/buttons/select-btn-group/SelectBtnGroup.vue';
import PEmpty from '@/components/atoms/empty/Empty.vue';

interface Props {
    selectId:string;
    idKey:string;
    subData:any[];
    url:string,
}
export default defineComponent({
    name: 'PDynamicSubData',
    components: {
        PSelectBtnGroup, PDynamicView, PEmpty,
    },
    props: {
        selectId: String,
        idKey: String,
        subData: {
            type: Array,
            default: () => ([]),
        },
        url: String,
    },
    setup(props:Props, { parent }) {
        const buttons = computed(() => props.subData.map(dv => ({
            name: dv.name, label: dv.name, vbind: { styleType: 'dark', outline: true },
        })));
        const state = reactive({
            selected: buttons.value[0].name,
            dvs: computed(() => _.keyBy(props.subData, 'name')),
        });

        // eslint-disable-next-line camelcase
        const selectData = computed(() => ({ view_type: 'table', ...state.dvs[state.selected] }));
        const selectKeyPath = computed(():string => selectData.value.key_path);
        const selectId = computed(() => props.selectId);
        const apiHandler = new SubDataAPI(
            parent as HttpInstance, props.url, props.idKey,
            selectKeyPath, selectId,
        );

        onMounted(() => {
            watch(() => props.selectId, (val) => {
                if (val) {
                    apiHandler.getData();
                }
            });
        });

        return {
            ...toRefs(state),
            buttons,
            apiHandler,
            selectData,
        };
    },
});
</script>
