<template>
    <p-button-modal :header-title="headerTitle"
                    :size="modalSize"
                    :visible.sync="proxyVisible"
                    :theme-color="themeColor"
                    :loading="loading"
                    @cancel="handleClose"
                    @close="handleClose"
                    @confirm="handleConfirm"
    >
        <template #body>
            <div>
                <slot name="sub-title">
                    <h4 class="p-table-check-modal-sub-title">
                        <slot name="sub-title-format">
                            {{ subTitle }}
                        </slot>
                    </h4>
                </slot>
                <div class="overflow-auto"
                     :style="{maxHeight: '300px'}"
                >
                    <slot v-bind="$props">
                        <p-data-table :sortable="true"
                                      :items="sortedItems"
                                      :fields="fields || []"
                                      :sort-by.sync="sortBy"
                                      :sort-desc.sync="sortDesc"
                        >
                            <template v-for="(_, slot) of $scopedSlots"
                                      #[slot]="scope"
                            >
                                <slot :name="slot"
                                      v-bind="scope"
                                />
                            </template>
                        </p-data-table>
                    </slot>
                </div>
            </div>
        </template>
    </p-button-modal>
</template>
<script lang="ts">
import type { PropType } from 'vue';
import {
    reactive, computed, toRefs, defineComponent,
} from 'vue';

import { orderBy } from 'lodash';
import type { TranslateResult } from 'vue-i18n';

import PDataTable from '@/data-display/tables/data-table/PDataTable.vue';
import type { DataTableFieldType } from '@/data-display/tables/data-table/type';
import PButtonModal from '@/feedbacks/modals/button-modal/PButtonModal.vue';
import type { ModalThemeColor } from '@/feedbacks/modals/button-modal/type';
import type { ModalSizeType } from '@/feedbacks/modals/type';
import { useProxyValue } from '@/hooks';


export default defineComponent({
    name: 'PTableCheckModal',
    components: { PButtonModal, PDataTable },
    props: {
        modalSize: {
            type: String as PropType<ModalSizeType>,
            default: 'md',
        },
        visible: { // sync
            type: Boolean,
            default: false,
        },
        themeColor: {
            type: String as PropType<ModalThemeColor>,
            default: 'primary',
        },
        headerTitle: {
            type: String as PropType<string|TranslateResult>,
            default: undefined,
        },
        subTitle: {
            type: String,
            default: undefined,
        },
        fields: {
            type: Array as PropType<DataTableFieldType[]>,
            default: undefined,
        },
        items: {
            type: Array,
            default: undefined,
        },
        loading: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            proxyVisible: useProxyValue('visible', props, emit),
            sortBy: '',
            sortDesc: true,
            sortedItems: computed(() => {
                if (state.sortBy) {
                    return orderBy(props.items, state.sortBy, state.sortDesc ? 'desc' : 'asc');
                }
                return props.items;
            }),
        });

        /* Event */
        const handleClose = () => {
            emit('cancel');
        };
        const handleConfirm = () => {
            emit('confirm', props.items);
        };

        return {
            ...toRefs(state),
            handleClose,
            handleConfirm,
        };
    },
});
</script>

<style lang="postcss" scoped>
.p-table-check-modal-sub-title {
    font-style: normal;
    font-weight: normal;
    font-size: 1.5rem;
    line-height: 1.9rem;
    margin-bottom: 1.2rem;
}
</style>
