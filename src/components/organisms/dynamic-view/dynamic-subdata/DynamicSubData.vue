<template>
    <div v-if="subData.length >= 1" class="s-dynamic-subdata my-8">
        <p-select-btn-group
            class="ml-4"
            :buttons="buttons" :selected.sync="selected" @clickButton="apiHandler.getData"
        />

        <p-dynamic-view :api-handler="apiHandler" v-bind="selectData" @clickExcel="exportToolSet.getData()">
            <template #toolbox-top>
                <PPanelTop style="margin: 0px" :use-total-count="true" :total-count="apiHandler.totalCount.value">
                    {{ selected }}
                </PPanelTop>
            </template>
        </p-dynamic-view>
    </div>

    <p-empty v-else class="my-8">
        No data
    </p-empty>
</template>

<script lang="ts">
import {
    onMounted, reactive, toRefs, watch, computed, defineComponent, Ref, ref,
} from '@vue/composition-api';
import _ from 'lodash';
import PButton from '@/components/atoms/buttons/Button.vue';
import PDynamicView from '@/components/organisms/dynamic-view/dynamic-view/DynamicView.vue';
import PSelectBtnGroup from '@/components/organisms/buttons/select-btn-group/SelectBtnGroup.vue';
import PEmpty from '@/components/atoms/empty/Empty.vue';
import { SubDataAPI, SubDataFluentAPI } from '@/lib/api/table';
import { GetDataAction, fluentApi } from '@/lib/fluent-api';
import { ExcelExportAPIToolSet } from '@/lib/api/add-on';
import PPanelTop from '@/components/molecules/panel/panel-top/PanelTop.vue';

interface Props {
    action: GetDataAction<any, any>;
    selectId: string;
    subData: any[];
}
export default defineComponent({
    name: 'PDynamicSubData',
    components: {
        PSelectBtnGroup, PDynamicView, PEmpty, PButton, PPanelTop,
    },
    props: {
        action: Object,
        selectId: String,
        subData: {
            type: Array,
            default: () => ([]),
        },
    },
    setup(props: Props) {
        const selected = ref(props.subData[0]?.name);
        const buttons = computed(() => props.subData.map(dv => ({
            name: dv.name, label: dv.name, vbind: { styleType: 'gray900-hover', outline: selected.value !== dv.name },
        })));
        const state = reactive({
            dvs: computed(() => _.keyBy(props.subData, 'name')),
        });

        // eslint-disable-next-line camelcase
        const selectData = computed(() => {
            if (!state.dvs[selected.value]) {
                selected.value = buttons.value[0]?.name;
            }
            // eslint-disable-next-line camelcase
            return { view_type: 'table', ...state.dvs[selected.value] };
        });
        const selectKeyPath = computed((): string => selectData.value.key_path);
        const selectId = computed(() => props.selectId);
        const apiHandler = new SubDataFluentAPI(props.action, selectKeyPath, selectId);


        const exportAction = fluentApi.addons().excel().export();

        const exportToolSet = new ExcelExportAPIToolSet(exportAction, apiHandler);
        watch(selectData, (origin, before) => {
            if (origin && origin !== before) {
                exportToolSet.action = exportAction.setDataSource(origin.data_source);
            }
        });
        const totalCount = computed<number>(() => apiHandler.tableTS.state.items?.length || 0);

        return {
            ...toRefs(state),
            selected,
            buttons,
            apiHandler,
            selectData,
            exportToolSet,
            totalCount,
        };
    },
});
</script>
