<template>
    <p-button-modal
        ref="modal"
        :header-title="headerTitle"
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
                <h4 class="p-table-check-modal-sub-title">
                    {{ subTitle }}
                </h4>
                <p-data-table :sortable="true" :items="sortedItems" :fields="fields"
                              :sort-by.sync="sortBy" :sort-desc.sync="sortDesc"
                />
                <slot />
            </div>
        </template>
    </p-button-modal>
</template>
<script>
import { reactive, computed, toRefs } from '@vue/composition-api';
import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal.vue';
import PDataTable from '@/components/organisms/tables/data-table/DataTable.vue';
import { propsMixin } from '@/components/molecules/modals/PModal.vue';
import { makeByPass, makeProxy } from '@/lib/compostion-util';
import { setup as contentModalSetup } from '@/components/organisms/modals/content-modal/ContentModal.vue';

const setup = (props, context) => {
    const state = contentModalSetup(props, context);
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
        ...state,
        ...toRefs(sortState),
        footerCancelButtonBind,
        footerConfirmButtonBind,
        sortedItems: computed(() => {
        // todo: move this feather to p-data-table
            if (sortState.sortBy) {
                return _.orderBy(props.items, sortState.sortBy, sortState.sortDesc ? 'desc' : 'asc');
            }
            return props.items;
        }),
        proxyVisible: makeProxy('visible', props, context.emit),
        cancel: makeByPass(context.emit, 'cancel'),
        close: makeByPass(context.emit, 'close'),
        confirm,
    };
};

export default {
    name: 'PTableCheckModal',
    components: { PButtonModal, PDataTable },
    mixins: [propsMixin],
    props: {
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
        responsiveStyle: {
            type: Object,
            default: () => ({ 'max-height': '100px', 'overflow-y': 'auto', 'overflow-x': 'auto' }),

        },
    },
    setup(props, context) {
        return setup(props, context);
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
