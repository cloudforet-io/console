<template>
    <p-button-modal :header-title="headerTitle"
                    :scrollable="scrollable"
                    :size="size"
                    :fade="fade"
                    :backdrop="backdrop"
                    :visible.sync="proxyVisible"
                    :theme-color="themeColor"
                    :loading="loading"
                    @cancel="cancel"
                    @close="close"
                    @confirm="confirm"
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
                    <slot v-bind="$props">
                        <p-data-table :sortable="true"
                                      :items="sortedItems"
                                      :fields="fields"
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
import {
    reactive, computed, toRefs, defineComponent,
} from 'vue';

import { orderBy } from 'lodash';

import PDataTable from '@/data-display/tables/data-table/PDataTable.vue';
import PButtonModal from '@/feedbacks/modals/button-modal/PButtonModal.vue';
import { SizeMapping } from '@/feedbacks/modals/type';
import { makeByEvent, makeProxy } from '@/utils/composition-helpers';


export default defineComponent({
    name: 'PTableCheckModal',
    components: { PButtonModal, PDataTable },
    props: {
        fade: {
            type: Boolean,
            default: false,
        },
        scrollable: {
            type: Boolean,
            default: false,
        },
        size: {
            type: String,
            default: 'md',
            validator: (value: any) => Object.keys(SizeMapping).includes(value),
        },
        backdrop: {
            type: Boolean,
            default: true,
        },
        visible: { // sync
            type: Boolean,
            default: false,
        },
        themeColor: {
            type: String,
            default: 'primary',
        },
        headerTitle: {
            type: String,
            default: undefined,
        },
        subTitle: {
            type: String,
            default: undefined,
        },
        fields: {
            type: Array,
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
    setup(props, context) {
        const state = reactive({
            proxyVisible: makeProxy('visible', props, context.emit),
        });
        const sortState = reactive({
            sortBy: '',
            sortDesc: true,
        });
        const confirm = () => {
            context.emit('confirm', props.items);
        };

        return {
            ...toRefs(state),
            ...toRefs(sortState),
            sortedItems: computed(() => {
                // todo: move this feather to p-data-table
                if (sortState.sortBy) {
                    return orderBy(props.items, sortState.sortBy, sortState.sortDesc ? 'desc' : 'asc');
                }
                return props.items;
            }),
            cancel: makeByEvent(context.emit, 'cancel'),
            close: makeByEvent(context.emit, 'close'),
            confirm,
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
