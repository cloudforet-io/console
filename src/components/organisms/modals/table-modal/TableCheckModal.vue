<template>
    <p-button-modal
        ref="modal"
        :header-title="headerTitle"
        :scrollable="scrollable"
        :centered="centered"
        :size="size"
        :fade="fade"
        :keyboard="keyboard"
        :backdrop="backdrop"

        @shown="shown"
        @hidden="hidden"
        @cancel="onCancelClick"
        @close="onCloseClick"
        @confirm="onConfirmClick"
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
import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal';
import PDataTable from '@/components/organisms/tables/data-table/DataTable';
import PModal from '@/components/molecules/modals/Modal';
import buttonActionMixin from '@/components/organisms/modals/button-modal/ButtonModal.mixins';

export default {
    name: 'PTableCheckModal',
    components: { PButtonModal, PDataTable },
    mixins: [PModal, buttonActionMixin],
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
    data() {
        return {
            sortBy: '',
            sortDesc: true,
        };
    },
    computed: {
        modalElement() {
            console.log('asf');
            debugger;
            return this.$refs.modal.$children[0].$children[0].$el;
        },
        sortedItems() {
            if (this.sortBy) {
                return this.items;
            }
            return this.items;
        },
    },
};
</script>

<style scoped>

</style>
