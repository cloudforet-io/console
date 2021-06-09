<template>
    <p-button-modal
        class="alert-reassign-modal"
        header-title="Reassign to other member"
        size="md"
        :visible.sync="proxyVisible"
        :loading="modalLoading"
        @confirm="onClickReassign"
    >
        <template #body>
            <p-toolbox-table :excel-visible="false"
                             selectable
                             sortable
                             :multi-select="false"
                             :fields="fields"
                             :items="items"
                             :select-index.sync="selectIndex"
                             :loading="loading"
                             :total-count="totalCount"
                             @change="onChangeTable"
            />
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import { PButtonModal, PToolboxTable } from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { makeProxy } from '@/lib/compostion-util';
import { SpaceConnector } from '@/lib/space-connector';
import { Options } from '@spaceone/design-system/dist/src/data-display/tables/search-table/type';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';

export default {
    name: 'AlertReassignModal',
    components: {
        PButtonModal,
        PToolboxTable,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        projectId: {
            type: String,
            default: undefined,
        },
        alertId: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { emit, root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            //
            modalLoading: false,
            proxyVisible: makeProxy('visible', props, emit),
            //
            loading: true,
            selectIndex: [] as number[],
            selectedUserID: computed(() => state.items[state.selectIndex]?.resource_id),
            fields: computed(() => [
                { label: 'User ID', name: 'resource_id', type: 'item' },
                { label: 'Name', name: 'resource_id', type: 'item' },
            ]),
            items: [] as any,
            options: {
                sortBy: 'resource_id',
                sortDesc: true,
                pageStart: 1,
                pageLimit: 15,
                searchText: '',
            },
            totalCount: 0,
        });

        const reassignMember = async () => {
            try {
                await SpaceConnector.client.monitoring.alert.update({
                    alert_id: props.alertId,
                    assignee: state.selectedUserID,
                });
                showSuccessMessage('Reassign Member success', '', root);
            } catch (e) {
                console.error(e);
                showErrorMessage('Reassign Member failure', e, root);
            } finally {
                state.proxyVisible = false;
            }
        };

        const onClickReassign = async () => {
            await reassignMember();
            console.log('confirm test')
            emit('confirm');
        };

        const apiQuery = new ApiQueryHelper();
        const getQuery = () => apiQuery.setSort(state.options.sortBy, state.options.sortDesc)
            .setPage(
                state.options.pageStart,
                state.options.pageLimit,
            ).setFilters([{ v: state.options.searchText }])
            .data;

        const listMemberInProject = async () => {
            try {
                state.loading = true;
                const res = await SpaceConnector.client.identity.project.member.list({
                    project_id: props.projectId,
                    query: getQuery(),
                });
                state.items = res.results;
            } catch (e) {
                console.error(e);
                state.items = [];
            } finally {
                state.loading = false;
            }
        };

        const onChangeTable = async (changed: any = {}) => {
            if (changed.sortBy !== undefined) {
                apiQuery.setSort(changed.sortBy, changed.sortDesc);
            }
            if (changed.pageLimit !== undefined) {
                apiQuery.setPageLimit(changed.pageLimit);
            }
            if (changed.pageStart !== undefined) {
                apiQuery.setPageStart(changed.pageStart);
            }
            if (changed.searchText !== undefined) {
                apiQuery.setFilters([{ v: changed.searchText }]);
            }
            await listMemberInProject();
        };
        (async () => {
            await listMemberInProject();
        })();
        return {
            ...toRefs(state),
            onClickReassign,
            onChangeTable,
        };
    },
};
</script>

<style lang="postcss" scoped>

</style>
