<template>
    <p-button-modal :header-title="$t('COMMON.COL_DATA')"
                    centered
                    size="lg"
                    fade
                    backdrop
                    :scrollable="false"
                    :loading="loading"
                    :footer-cancel-button-bind="{
                        styleType: 'gray900',
                        outline: true,
                    }"
                    :visible.sync="proxyVisible"
                    @confirm="onClickCollectConfirm"
    >
        <template #body>
            <p class="title">
                Select a Collector.
            </p>
            <div class="collect-modal-body">
                <div class="left-container">
                    <p class="sub-title">
                        Collector List
                    </p>
                    <p-selectable-list :items="collectors"
                                       :multi-selectable="false"
                                       :mapper="mapper"
                                       :selected-indexes.sync="selectedIndexes"
                    >
                        <template #extra="{item, index}">
                            <span class="count">
                                {{ collectorResourceMap[item.collector_id].length }}
                            </span>
                        </template>
                    </p-selectable-list>
                </div>
                <div class="right-container">
                    <p class="sub-title">
                        Resource List
                    </p>
                    <p-data-table :fields="fields"
                                  :sortable="false"
                                  :selectable="false"
                                  :loading="resourceLoading"
                                  :items="selectedResources"
                                  table-style-type="light"
                                  bordered
                                  class="right-table"
                    >
                        <template #col-name-format="{value}">
                            <p-badge v-if="value" outline style-type="gray">
                                {{ value }}
                            </p-badge>
                        </template>
                    </p-data-table>
                    <div v-if="!hasFilterFormat" class="all-resource-msg">
                        It collects all resources including items above.
                    </div>
                </div>
            </div>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    toRefs, reactive, computed, SetupContext, watch,
} from '@vue/composition-api';
import { keys, forEach, get } from 'lodash';
import { makeTrItems } from '@/lib/view-helper';
import { makeProxy } from '@/components/util/composition-helpers';

import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';

import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import PSelectableList from '@/components/organisms/lists/selectable-list/PSelectableList.vue';
import PBadge from '@/components/atoms/badges/PBadge.vue';
import { CollectModalPropsType } from '@/views/common/collect-modal/CollectModal.toolset';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';

export default {
    name: 'CollectModal',
    components: {
        PButtonModal,
        PDataTable,
        PSelectableList,
        PBadge,
    },
    props: {
        resources: {
            type: Array,
            default: () => [],
            validator(resources) {
                return resources.every(resource => resource && resource.collection_info && resource.collection_info.collectors);
            },
        },
        // sync
        visible: Boolean,
        idKey: {
            type: String,
            default: '',
        },
        nameKey: {
            type: String,
            default: 'name',
        },
    },
    setup(props: CollectModalPropsType, context: SetupContext) {
        const state = reactive({
            loading: true,
            resourceLoading: true,
            proxyVisible: makeProxy('visible', props, context.emit),
            collectors: [],
            fields: makeTrItems(
                [[props.idKey, 'COMMON.ID'], [props.nameKey, 'COMMON.NAME']],
                context.parent,
            ),
            mapper: {
                key: 'collector_id',
                iconUrl: 'tags.icon',
                title: 'name',
            },
            selectedIndexes: [0],
            collectorResourceMap: {},
            mergedCollectorIds: computed(() => keys(state.collectorResourceMap)),
            selectedCollector: computed(() => state.collectors[state.selectedIndexes[0]]),
            hasFilterFormat: computed(() => get(
                state.selectedCollector,
                'plugin_info.options.filter_format',
                [],
            ).some(f => f.key === props.idKey)),
            selectedResources: computed(() => (state.selectedCollector
                ? state.collectorResourceMap[state.selectedCollector.collector_id] : [])),
        });

        const setCollectorResourceMap = (): void => {
            state.resourceLoading = true;
            state.collectorResourceMap = {};
            forEach(props.resources, (resource) => {
                forEach(resource.collection_info.collectors, (collectorId: string) => {
                    if (state.collectorResourceMap[collectorId]) state.collectorResourceMap[collectorId].push(resource);
                    else state.collectorResourceMap[collectorId] = [resource];
                });
            });
            state.resourceLoading = false;
        };

        const getBadgeType = (idx): string => {
            if (state.selectedIndexes[0] === idx) return 'secondary';

            return 'gray900';
        };

        const listCollector = async (): Promise<void> => {
            state.loading = true;

            try {
                const query = new QueryHelper()
                    .setFilter({ k: 'collector_id', v: state.mergedCollectorIds, o: 'in' });
                const res = await SpaceConnector.client.inventory.collector.list({ query: query.data });
                state.collectors = res.results;
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        const collectData = async (id: string): Promise<void> => {
            try {
                await SpaceConnector.client.inventory.collector.collect({
                    collector_id: id,
                    filter: { [props.idKey]: state.collectorResourceMap[state.selectedCollector.collector_id].map(r => r[props.idKey]) },
                });
                showSuccessMessage('success', 'Collect Data', context.root);
            } catch (e) {
                showErrorMessage('Fail to Collect Data', e, context.root);
            } finally {
                state.proxyVisible = false;
            }
        };

        const onClickCollectConfirm = async (): Promise<void> => {
            state.loading = true;

            if (state.selectedCollector) await collectData(state.selectedCollector.collector_id);

            state.loading = false;
        };


        const initiate = async (): Promise<void> => {
            state.selectedIndexes = [0];
            setCollectorResourceMap();
            await listCollector();
        };

        watch(() => props.visible, async (val) => {
            if (val) await initiate();
        }, { immediate: true });


        return {
            ...toRefs(state),
            onClickCollectConfirm,
            getBadgeType,
        };
    },
};
</script>

<style lang="postcss" scoped>
.collect-modal-body {
    @apply grid grid-cols-2 overflow-hidden;
    height: 450px;
}
.title {
    font-size: 1.5rem;
    line-height: 1.8125rem;
    padding-bottom: 1.375rem;
}
.sub-title {
    font-size: 0.875rem;
    font-weight: bold;
    line-height: 1.0625rem;
    padding-bottom: 1.0625rem;
}
.left-container {
    height: 100%;
    overflow: auto;
    padding-right: 0.5rem;
    .count {
        font-size: 1.125rem;
        line-height: 1.375rem;
        font-weight: bold;
    }
}
.right-container {
    padding-left: 0.5rem;
    height: 100%;
    .p-data-table::v-deep {
        @apply overflow-auto;
        max-height: calc(450px * 0.85);
        th {
            @apply relative border-t-0;
        }
    }
    .all-resource-msg {
        @apply bg-black text-white;
        float: right;
        height: 1.875rem;
        border-radius: 100px;
        box-shadow: 0 4px 4px rgba(theme('colors.black'), 0.17);
        padding: 0 1rem;
        line-height: 1.875rem;
    }
}
</style>
