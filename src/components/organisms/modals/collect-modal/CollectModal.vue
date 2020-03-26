<template>
    <p-button-modal :header-title="$t('COMMON.COL_DATA')"
                    centered
                    size="xl"
                    fade
                    backdrop
                    :loading="loading"
                    :footer-cancel-button-bind="{
                        styleType: 'dark',
                        outline: true,
                    }"
                    :visible.sync="proxyVisible"
                    @confirm="onClickCollectConfirm"
    >
        <template #body>
            <div class="grid grid-cols-2">
                <div class="left-container ">
                    <div v-for="collector in collectors"
                         :key="collector.collector_id"
                         class="flex items-center"
                    >
                        <img class="icon" :src="collector.tags.icon || defaultImg">
                        <span class="name">{{ collector.name }}</span>
                    </div>
                </div>
                <div class="right-container">
                    <p-data-table :fields="fields"
                                  :sortable="false"
                                  :selectable="false"
                                  :items="resources"
                    />
                </div>
            </div>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    toRefs, reactive, computed, defineComponent, SetupContext,
} from '@vue/composition-api';
import _ from 'lodash';
import config from '@/lib/config';
import { makeTrItems } from '@/lib/view-helper';
import { makeProxy } from '@/lib/compostion-util';

import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
// @ts-ignore
import PDynamicForm, { setValidation } from '@/components/organisms/forms/dynamic-form/DynamicForm.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PRow from '@/components/atoms/grid/row/Row.vue';
import PCol from '@/components/atoms/grid/col/Col.vue';
import PTextInput from '@/components/atoms/inputs/TextInput.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/SelectDropdown.vue';
import { fluentApi } from '@/lib/fluent-api';
import PDataTable from '@/components/organisms/tables/data-table/DataTable.vue';
import { CollectParameter } from '@/lib/fluent-api/inventory/collector';
import { AxiosResponse } from 'axios';


export default defineComponent({
    name: 'CollectDataModal',
    components: {
        PButtonModal,
        PButton,
        PDynamicForm,
        PFieldGroup,
        PRow,
        PCol,
        PTextInput,
        PDropdownMenuBtn,
        PSelectDropdown,
        PDataTable,
    },
    props: {
        resources: {
            type: Array,
            default: () => [],
        },
        visible: Boolean,
        idKey: {
            type: String,
            default: '',
        },
        filterKey: {
            type: String,
            default: '',
        },
        type: {
            type: String,
            default: 'SERVER',
            validator(val) {
                return ['SERVER'].includes(val);
            },
        },
        nameKey: {
            type: String,
            default: 'name',
        },
    },
    setup(props, context: SetupContext) {
        const state = reactive({
            loading: false,
            proxyVisible: makeProxy('visible', props, context.emit),
            collectors: [],
            selectedCollector: null,
            resourceKeys: computed(() => props.resources.map(resource => resource[props.idKey])),
            fields: makeTrItems(
                [[props.nameKey, 'COMMON.NAME']],
                context.parent,
            ),
            defaultImg: config.get('COLLECTOR_IMG'),
        });


        const collectorApi = fluentApi.inventory().collector();
        const listCollector = async () => {
            state.loading = true;
            try {
                const res = await collectorApi.list().setFilter({
                    key: 'plugin_info.options.supported_resource_type',
                    value: props.type,
                    operator: '',
                }).execute();
                // @ts-ignore
                state.collectors = res.data.results;
                state.selectedCollector = state.collectors[0];
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        const collectData = async (id: string) => {
            try {
                await collectorApi.collect().setParameter({
                    // eslint-disable-next-line camelcase
                    collector_id: id,
                    filter: { [props.filterKey]: state.resourceKeys },
                }).execute();
                context.root.$notify({
                    group: 'noticeBottomRight',
                    type: 'success',
                    title: 'success',
                    text: 'Collect Data',
                    duration: 2000,
                    speed: 1000,
                });
            } catch (e) {
                context.root.$notify({
                    group: 'noticeBottomRight',
                    type: 'alert',
                    title: 'Fail',
                    text: 'Request Fail',
                    duration: 2000,
                    speed: 1000,
                });
            }
        };

        const collectDataAll = async () => {
            const collectPromises = state.collectors.map((collector: any) => collectData(collector.collector_id));
            await Promise.all(collectPromises);
        };

        const onClickCollectConfirm = async () => {
            state.loading = true;
            // @ts-ignore
            if (state.selectedCollector) await collectData(state.selectedCollector.collector_id);
            state.loading = false;
        };

        listCollector();

        return {
            ...toRefs(state),
            onClickCollectConfirm,
        };
    },
});
</script>

<style lang="postcss" scoped>
.left-container {
    @apply border-r border-gray2;
    padding-right: 2.5rem;
        .icon {
            width: 3rem;
            height: 3rem;
        }
    .name {
        font-size: 1.125rem;
    }
}
.right-container {
    padding-left: 2.5rem;
}
</style>
