<template>
    <p-button-modal
        ref="modal"
        :header-title="headerTitle"
        :scrollable="scrollable"
        :centered="centered"
        :size="size"
        :fade="fade"
        :backdrop="backdrop"

        @cancel="cancel"
        @close="close"
        @confirm="confirm"
    >
        <template #body>
            <div>
                <h4>{{ subTitle }}</h4>
                <p-data-table :sortable="true" :items="sortedItems" :fields="fields"
                              :sort-by="sortBy" :sort-desc="sortDesc"
                />
            </div>
        </template>
    </p-button-modal>
</template>
<script>
import { reactive, computed, toRefs } from '@vue/composition-api';
import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal';
import PDataTable from '@/components/organisms/tables/data-table/DataTable';
import { propsMixin } from '@/components/molecules/modals/Modal';
import { setup as contentModalSetup } from '../content-modal/ContentModal';
import { makeByPass } from '@/lib/compostion-util';

const setup = (props, context) => {
    const state = contentModalSetup(props, context);
    const sortState = reactive({
        sortBy: '',
        sortDesc: true,
    });
    return {
        ...state,
        ...toRefs(sortState),
        sortedItems: computed(() => {
            if (sortState.sortBy) {
                return props.items;
            }
            return props.items;
        }),
        cancel: makeByPass(context.emit, 'cancel'),
        close: makeByPass(context.emit, 'close'),
        confirm: makeByPass(context.emit, 'confirm'),
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
    },
    setup(props, context) {
        return setup(props, context);
    },


};
</script>

<style scoped>

</style>
