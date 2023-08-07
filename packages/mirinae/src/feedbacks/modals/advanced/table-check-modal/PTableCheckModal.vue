<template>
    <p-button-modal v-model:visible="state.proxyVisible"
                    :header-title="headerTitle"
                    :size="modalSize"
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
                     :style="{'max-height': '300px'}"
                >
                    <slot v-bind="props">
                        <p-data-table v-model:sort-by="state.sortBy"
                                      v-model:sort-desc="state.sortDesc"
                                      :sortable="true"
                                      :items="state.sortedItems"
                                      :fields="fields"
                        >
                            <template v-for="(_, slot) of slots"
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
<script setup lang="ts">
import { orderBy } from 'lodash';
import {
    reactive, computed, useSlots,
} from 'vue';


import PDataTable from '@/data-display/tables/data-table/PDataTable.vue';
import type { DataTableField } from '@/data-display/tables/data-table/type';
import PButtonModal from '@/feedbacks/modals/button-modal/PButtonModal.vue';
import type { ModalThemeColor } from '@/feedbacks/modals/button-modal/type';
import type { ModalSizeType } from '@/feedbacks/modals/type';
import { useProxyValue } from '@/hooks';

interface Props {
    modalSize: ModalSizeType;
    visible: boolean;
    themeColor: ModalThemeColor;
    headerTitle?: string;
    subTitle?: string;
    fields?: DataTableField[];
    items?: any[];
    loading: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    modalSize: 'md',
    visible: false,
    themeColor: 'primary',
    headerTitle: undefined,
    subTitle: undefined,
    fields: undefined,
    items: undefined,
    loading: false,
});
const emit = defineEmits(['update:visible', 'cancel', 'confirm']);
const slots = useSlots();

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
