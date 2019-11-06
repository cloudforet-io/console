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
            :headerTitle="headerTitle"
            @shown="shown"
            @hidden="hidden"
            @cancel="cancel"
            @close="close"
            @confirm="confirm"
    >
        <template #body>
            <div>
                <h4>{{this.subTitle}}</h4>
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

export default {
    name: 'TableCheckModal',
    components: { PButtonModal, PDataTable },
    mixins: [PButtonModal],
    props: {
        themeColor: {
            type: String,
            default: 'primary',
        },
        subTitle: String,
        fields: {
            type: Array,
        },
        items: {
            type: Array,
        },
    },
    data() {
        return {
            sortBy: '',
            sortDesc: true,
        };
    },
    computed: {
        modalElement() {
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
