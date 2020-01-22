<template>
    <div>
        <p-panel-top>
            {{ tr('PANEL.CREDENTIAL') }}
        </p-panel-top>
        <p-toolbox-table :items="items"
                         :fields="fields"
                         selectable
                         sortable
                         hover
                         :border="false"
                         :shadow="false"
                         :sort-by.sync="sortBy"
                         :sort-desc.sync="sortDesc"
                         :all-page="allPage"
                         :this-page.sync="thisPage"
                         :select-index.sync="selectIndex"
                         :page-size.sync="pageSize"
                         :setting-visible="false"
                         :loading="loading"
                         use-spinner-loading
                         use-cursor-loading
                         @changePageSize="listCredentials"
                         @changePageNumber="listCredentials"
                         @clickRefresh="listCredentials"
                         @changeSort="listCredentials"
        >
            <template #toolbox-left>
                <p-button style-type="safe" @click="onClickVerify">
                    {{ tr('COMMON.VERIFY') }}
                </p-button>
            </template>
            <template #col-credential_groups-format="{value}">
                <span>
                    <p-tag v-for="crdg in value" :key="crdg.credential_group_id" :deletable="false">
                        {{ crdg }}
                    </p-tag>
                </span>
            </template>
            <template #col-created_at-format="{value}">
                {{ timestampFormatter(value) }}
            </template>
        </p-toolbox-table>

        <p-button-modal
            :header-title="tr('COMMON.VERIFY')"
            theme-color="safe"
            centered
            size="lg"
            fade
            backdrop
            :footer-confirm-button-bind="{
                styleType: 'safe',
            }"
            :footer-cancel-button-bind="{
                styleType: 'safe',
                outline: true
            }"
            :visible.sync="verifyModalVisible"
            @confirm="onVerifyConfirm"
        />
    </div>
</template>

<script>
import {
    reactive, toRefs, computed, ref,
} from '@vue/composition-api';
import { defaultQuery } from '@/lib/api';
import { makeTrItems } from '@/lib/view-helper';
import { timestampFormatter } from '@/lib/util';
import CollectorEventBus from '@/views/inventory/collector/CollectorEventBus';

import PPanelTop from '@/components/molecules/panel/panel-top/PanelTop.vue';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal.vue';
import PContentModal from '@/components/organisms/modals/content-modal/ContentModal.vue';

export const crdState = reactive({
    items: [],
    totalCount: 0,
    loading: true,
    query: undefined,
    selectIndex: [],
});

const setTableRefs = (root) => {
    const state = reactive({
        fields: makeTrItems([
            ['credential_id', 'COMMON.ID', { size: '400px' }],
            ['name', 'COMMON.NAME', { size: '400px' }],
            ['issue_type', 'COMMON.ISSUE_TYPE', { size: '400px' }],
            ['credential_groups', 'COMMON.GROUP', { size: '800px', sortable: false }],
            ['created_at', 'COMMON.CREATED', { size: '300px' }],
        ], root),
        sortBy: '',
        sortDesc: '',
        pageSize: 10,
        thisPage: 1,
        allPage: computed(() => Math.ceil(crdState.totalCount / state.pageSize) || 1),
        verifyModalVisible: false,
    });

    crdState.query = computed(() => (defaultQuery(
        state.thisPage, state.pageSize,
        state.sortBy, state.sortDesc,
    )));

    const listCredentials = () => {
        CollectorEventBus.$emit('listCredentials');
    };

    const onClickVerify = () => {
        state.verifyModalVisible = true;
        // CollectorEventBus.$emit('verifyCredentials');
    };

    const onVerifyConfirm = () => {};

    listCredentials();

    return {
        ...toRefs(state),
        listCredentials,
        onClickVerify,
        onVerifyConfirm,
        timestampFormatter,
    };
};
export default {
    name: 'CollectorCredentials',
    components: {
        PPanelTop,
        PToolboxTable,
        PButton,
        PButtonModal,
        PContentModal,
    },
    props: {
        item: Object,
    },
    setup(props, { root }) {
        const tableRefs = setTableRefs(root);

        return {
            ...toRefs(crdState),
            ...tableRefs,
        };
    },
};
</script>

<style lang="scss" scoped>

</style>
