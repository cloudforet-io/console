<template>
    <p-button-modal :header-title="$t('COMMON.COLLECT_MODAL.TITLE')"
                    size="lg"
                    fade
                    backdrop
                    :scrollable="false"
                    :loading="loading"
                    :visible.sync="proxyVisible"
                    @confirm="onClickCollectConfirm"
    >
        <template #body>
            <p class="title">
                {{ $t('COMMON.COLLECT_MODAL.SELECT_COLLECTOR') }}
            </p>
            <div class="collect-modal-body">
                <div class="left-container">
                    <p class="sub-title">
                        {{ $t('COMMON.COLLECT_MODAL.COLLECTOR_LIST') }}
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
                        {{ $t('COMMON.COLLECT_MODAL.RESOURCE_LIST') }}
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
                        {{ $t('COMMON.COLLECT_MODAL.HINT_TEXT') }}
                    </div>
                </div>
            </div>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import { keys, forEach, get } from 'lodash';

import {
    toRefs, reactive, computed, watch, SetupContext, getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';

import {
    PButtonModal, PDataTable, PSelectableList, PBadge,
} from '@spaceone/design-system';
import { makeProxy } from '@spaceone/design-system/src/util/composition-helpers';

import { CollectModalProps } from '@/common/modules/collect-modal/type';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';

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
        visible: Boolean, // sync
        idKey: {
            type: String,
            default: '',
        },
        nameKey: {
            type: String,
            default: 'name',
        },
    },
    setup(props: CollectModalProps, context: SetupContext) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            loading: true,
            resourceLoading: true,
            proxyVisible: makeProxy('visible', props, context.emit),
            collectors: [],
            fields: computed(() => ([
                { name: props.idKey, label: vm.$t('COMMON.COLLECT_MODAL.ID') },
                { name: props.nameKey, label: vm.$t('COMMON.COLLECT_MODAL.NAME') },
            ])),
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
                'plugin_info.metadata.filter_format',
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

        const apiQuery = new ApiQueryHelper();
        const listCollector = async (): Promise<void> => {
            state.loading = true;

            try {
                apiQuery.setFilters([{ k: 'collector_id', v: state.mergedCollectorIds, o: '=' }]);
                const res = await SpaceConnector.client.inventory.collector.list({ query: apiQuery.data });
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
                showSuccessMessage(vm.$t('COMMON.COLLECT_MODAL.ALT_S_COLLECT_DATA'), '', context.root);
            } catch (e) {
                showErrorMessage(vm.$t('COMMON.COLLECT_MODAL.ALT_E_COLLECT_DATA'), e, context.root);
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
    .right-table {
        height: auto;
        padding-bottom: 1rem;
    }
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
        font-size: 0.875rem;
        border-radius: 6.25rem;
        box-shadow: 0 4px 4px rgba(theme('colors.black'), 0.17);
        padding: 0 1rem;
        line-height: 1.875rem;
    }
}
</style>
