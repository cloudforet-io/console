<template>
    <p-button-modal :header-title="headerTitle"
                    :scrollable="scrollable"
                    :centered="centered"
                    :size="size"
                    :fade="fade"
                    :backdrop="backdrop"
                    :visible.sync="proxyVisible"
                    :theme-color="themeColor"
                    :footer-cancel-button-bind="footerCancelButtonBind"
                    :footer-confirm-button-bind="footerConfirmButtonBind"

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
                <div class="overflow-auto" :style="{'max-height': '300px'}">
                    <slot v-bind="$props">
                        <p-data-table :sortable="true" :items="sortedItems" :fields="fields"
                                      :sort-by.sync="sortBy" :sort-desc.sync="sortDesc"
                        >
                            <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                                <slot :name="slot" v-bind="scope" />
                            </template>
                        </p-data-table>
                    </slot>
                </div>
            </div>
        </template>
    </p-button-modal>
</template>
<script lang="ts">
import { reactive, computed, toRefs } from '@vue/composition-api';
import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import { makeByEvent, makeProxy } from '@/components/util/composition-helpers';
import { sizeMapping } from '@/components/molecules/modals/type';
import { orderBy } from 'lodash';

export default {
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
            validator: value => Object.keys(sizeMapping).includes(value),
        },
        centered: {
            type: Boolean,
            default: false,
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
        hideOnCancel: {
            type: Boolean,
            default: true,
        },
        headerTitle: String,
        subTitle: String,
        fields: Array,
        items: Array,
    },
    setup(props, context) {
        const state = reactive({
            proxyVisible: makeProxy('visible', props, context.emit),
        });
        const sortState = reactive({
            sortBy: '',
            sortDesc: true,
        });
        const footerCancelButtonBind = reactive({
            styleType: 'gray900',
            outline: true,
        });
        const footerConfirmButtonBind = computed(() => ({
            styleType: props.themeColor === 'primary' ? 'primary-dark' : props.themeColor,
        }));
        const confirm = () => {
            context.emit('confirm', props.items);
        };

        return {
            ...toRefs(state),
            ...toRefs(sortState),
            footerCancelButtonBind,
            footerConfirmButtonBind,
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


};
</script>

<style lang="scss" scoped>
.p-table-check-modal-sub-title {
    font-style: normal;
    font-weight: normal;
    font-size: 1.5rem;
    line-height: 1.9rem;
    margin-bottom: 1.2rem;
}
</style>
