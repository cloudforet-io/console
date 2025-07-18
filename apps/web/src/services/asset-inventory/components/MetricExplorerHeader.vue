<script lang="ts" setup>
import { onClickOutside } from '@vueuse/core/index';
import { computed, reactive, ref } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router/composables';

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { clone } from 'lodash';

import {
    useContextMenuController, PHeading, PIconButton, PButton, PContextMenu, PI, PHeadingLayout,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { RESOURCE_GROUP } from '@/api-clients/_common/schema/constant';
import { useMetricExampleApi } from '@/api-clients/inventory/metric-example/composables/use-metric-example-api';
import { useMetricApi } from '@/api-clients/inventory/metric/composables/use-metric-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { gray } from '@/styles/colors';

import MetricExplorerNameFormModal from '@/services/asset-inventory/components/MetricExplorerNameFormModal.vue';
import MetricExplorerQueryFormSidebar from '@/services/asset-inventory/components/MetricExplorerQueryFormSidebar.vue';
import { useMetricExampleGetQuery } from '@/services/asset-inventory/composables/use-metric-example-get-query';
import { useMetricGetQuery } from '@/services/asset-inventory/composables/use-metric-get-query';
import { useMetricListQuery } from '@/services/asset-inventory/composables/use-metric-list-query';
import { useNamespaceGetQuery } from '@/services/asset-inventory/composables/use-namespace-get-query';
import { NAME_FORM_MODAL_TYPE } from '@/services/asset-inventory/constants/asset-analysis-constant';
import { ADMIN_ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/admin/route-constant';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';

const contextMenuRef = ref<any|null>(null);
const targetRef = ref<HTMLElement | null>(null);


const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerPageState = metricExplorerPageStore.state;
const appContextStore = useAppContextStore();
const authorizationStore = useAuthorizationStore();

const router = useRouter();
const route = useRoute();

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});
const state = reactive({
    selectedMenuId: computed(() => {
        const reversedMatched = clone(route.matched).reverse();
        const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
        const targetMenuId: MenuId = closestRoute?.meta?.menuId || MENU_ID.WORKSPACE_HOME;
        if (route.name === COST_EXPLORER_ROUTE.LANDING._NAME) {
            return '';
        }
        return targetMenuId;
    }),
    hasReadWriteAccess: computed<boolean|undefined>(() => authorizationStore.getters.pageAccessPermissionMap[state.selectedMenuId]?.write),
    currentMetricId: computed<string>(() => route.params.metricId),
    isDuplicateEnabled: computed<boolean>(() => {
        if (!currentNamespace.value) return false;
        return currentNamespace.value.group !== 'common';
    }),
    currentMetricExampleId: computed<string|undefined>(() => route.params.metricExampleId),
    isManagedMetric: computed<boolean>(() => (currentMetric.value?.is_managed && !state.currentMetricExampleId) || false),
    metricNameFormModalVisible: false,
    metricDeleteModalVisible: false,
    loadingDuplicate: false,
    selectedNameFormModalType: undefined as string|undefined,
    saveDropdownMenuItems: computed<MenuItem[]>(() => (state.hasReadWriteAccess ? [
        {
            type: 'item',
            name: 'saveAs',
            icon: 'ic_disk-edit-filled',
            label: `${i18n.t('INVENTORY.METRIC_EXPLORER.SAVE_AS')}...`,
        },
    ] : [])),
    pageTitle: computed<string|TranslateResult>(() => currentMetricExample.value?.name || currentMetric.value?.name || i18n.t('INVENTORY.METRIC_EXPLORER.METRIC_EXPLORER')),
    deleteModalTitle: computed(() => {
        if (state.currentMetricExampleId) {
            return i18n.t('INVENTORY.METRIC_EXPLORER.DELETE_METRIC_EXAMPLE');
        }
        return i18n.t('INVENTORY.METRIC_EXPLORER.DELETE_CUSTOM_METRIC');
    }),
    editQueryTitle: computed<TranslateResult>(() => {
        if (!state.hasReadWriteAccess || state.isManagedMetric || state.currentMetricExampleId) {
            return i18n.t('INVENTORY.METRIC_EXPLORER.VIEW_QUERY');
        }
        return i18n.t('INVENTORY.METRIC_EXPLORER.EDIT_QUERY');
    }),
    editQueryButtonIcon: computed<string>(() => {
        if (!state.hasReadWriteAccess || state.isManagedMetric || state.currentMetricExampleId) {
            return 'ic_editor-code';
        }
        return 'ic_edit';
    }),
    existingMetricNameList: computed<string[]>(() => currentNamespaceMetrics.value?.map((metric) => metric.name) || []),
});
const loading = computed(() => currentMetricLoading.value);

const {
    visibleMenu: visibleContextMenu,
    showContextMenu,
    hideContextMenu,
} = useContextMenuController({
    useFixedStyle: false,
    targetRef,
    contextMenuRef,
    menu: state.saveDropdownMenuItems,
    position: 'right',
});
onClickOutside(targetRef, hideContextMenu);

/* Util */
const openNameFormModal = (modalType: string) => {
    state.selectedNameFormModalType = modalType;
    state.metricNameFormModalVisible = true;
};
const getDuplicatedMetricName = (name: string): string => {
    let _name = name;

    while (state.existingMetricNameList.includes(_name)) {
        const trimmedName = _name.trim();

        if (trimmedName.endsWith(' copy')) {
            _name = `${trimmedName} 2`;
        } else if (trimmedName.match(/ copy \d+$/)) {
            const lastSpaceIndex = trimmedName.lastIndexOf(' ');
            const baseName = trimmedName.slice(0, lastSpaceIndex);
            const number = parseInt(trimmedName.slice(lastSpaceIndex + 1));
            _name = `${baseName} ${number + 1}`;
        } else {
            _name = `${_name} copy`;
        }
    }

    return _name;
};

/* Query */
const { data: currentMetric, isLoading: currentMetricLoading } = useMetricGetQuery({
    metricId: computed(() => route.params.metricId),
});
const { data: currentNamespace } = useNamespaceGetQuery({
    namespaceId: computed(() => currentMetric.value?.namespace_id || ''),
});
const { data: currentNamespaceMetrics, metricListQueryKey } = useMetricListQuery({
    params: computed(() => ({
        namespace_id: currentMetric.value?.namespace_id,
    })),
});
const { data: currentMetricExample } = useMetricExampleGetQuery({
    metricExampleId: computed(() => route.params.metricExampleId),
});
const { key: metricExampleListQueryKey } = useServiceQueryKey('inventory', 'metric-example', 'list', {
    params: computed(() => ({
        namespace_id: currentMetric.value?.namespace_id,
    })),
});

/* Mutation */
const { metricAPI } = useMetricApi();
const { metricExampleAPI } = useMetricExampleApi();
const queryClient = useQueryClient();
const { mutate: duplicateMetric } = useMutation({
    mutationFn: metricAPI.create,
    onMutate: () => {
        state.loadingDuplicate = true;
    },
    onSuccess: async (data) => {
        showSuccessMessage(i18n.t('INVENTORY.METRIC_EXPLORER.ALT_S_DUPLICATE_METRIC'), '');
        queryClient.invalidateQueries({ queryKey: metricListQueryKey.value });
        await router.replace({
            name: storeState.isAdminMode ? ADMIN_ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME : ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME,
            params: { metricId: data.metric_id },
        }).catch(() => {});
    },
    onError: async (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.METRIC_EXPLORER.ALT_E_DUPLICATE_METRIC'));
    },
    onSettled: () => {
        state.loadingDuplicate = false;
    },
});
const { mutateAsync: deleteMetric } = useMutation({
    mutationFn: metricAPI.delete,
    onSuccess: async () => {
        queryClient.invalidateQueries({ queryKey: metricListQueryKey.value });
        showSuccessMessage(i18n.t('INVENTORY.METRIC_EXPLORER.ALT_S_DELETE_METRIC'), '');
    },
    onError: async (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.METRIC_EXPLORER.ALT_E_DELETE_METRIC'));
    },
});
const { mutate: deleteMetricExample } = useMutation({
    mutationFn: metricExampleAPI.delete,
    onSuccess: async () => {
        queryClient.invalidateQueries({ queryKey: metricExampleListQueryKey.value });
        showSuccessMessage(i18n.t('INVENTORY.METRIC_EXPLORER.ALT_S_DELETE_METRIC_EXAMPLE'), '');
        await router.replace({
            name: storeState.isAdminMode ? ADMIN_ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME : ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME,
            params: { metricId: state.currentMetricId },
        }).catch(() => {});
    },
    onError: async (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.METRIC_EXPLORER.ALT_E_DELETE_METRIC_EXAMPLE'));
    },
});
const { mutate: updateMetricExample } = useMutation({
    mutationFn: metricExampleAPI.update,
    onSuccess: () => {
        showSuccessMessage(i18n.t('INVENTORY.METRIC_EXPLORER.ALT_S_UPDATE_METRIC_EXAMPLE'), '');
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.METRIC_EXPLORER.ALT_E_UPDATE_METRIC_EXAMPLE'));
    },
});

/* Event */
const handleDuplicate = () => {
    if (!currentMetric.value) return;
    duplicateMetric({
        name: getDuplicatedMetricName(currentMetric.value.name),
        namespace_id: currentMetric.value.namespace_id || '',
        unit: currentMetric.value.unit,
        metric_type: currentMetric.value.metric_type,
        resource_group: storeState.isAdminMode ? RESOURCE_GROUP.DOMAIN : RESOURCE_GROUP.WORKSPACE,
        query_options: currentMetric.value.query_options,
    });
};
const handleSaveMetricExample = () => {
    updateMetricExample({
        example_id: state.currentMetricExampleId,
        options: {
            granularity: metricExplorerPageState.granularity,
            period: metricExplorerPageState.period,
            relative_period: metricExplorerPageState.relativePeriod,
            group_by: metricExplorerPageState.selectedGroupByList,
            filters: metricExplorerPageState.filters,
            operator: metricExplorerPageState.selectedOperator,
        },
    });
};
const handleDeleteMetric = async () => {
    if (state.currentMetricExampleId) {
        deleteMetricExample({
            example_id: state.currentMetricExampleId,
        });
    } else {
        if (!currentMetric.value) return;
        await deleteMetric({
            metric_id: currentMetric.value.metric_id,
        });
        const otherMetricId = currentNamespaceMetrics.value?.[0]?.metric_id;
        if (otherMetricId) {
            await router.replace({
                name: storeState.isAdminMode ? ADMIN_ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME : ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME,
                params: { metricId: otherMetricId },
            }).catch(() => {});
        } else {
            await router.replace({
                name: storeState.isAdminMode ? ADMIN_ASSET_INVENTORY_ROUTE.METRIC_EXPLORER._NAME : ASSET_INVENTORY_ROUTE.METRIC_EXPLORER._NAME,
            }).catch(() => {});
        }
    }
    state.metricDeleteModalVisible = false;
};
const handleClickEditName = () => {
    openNameFormModal(NAME_FORM_MODAL_TYPE.EDIT_NAME);
};
const handleSelectSaveAsExample = () => {
    openNameFormModal(NAME_FORM_MODAL_TYPE.SAVE_AS_EXAMPLE);
};
const handleOpenAddExampleModal = () => {
    openNameFormModal(NAME_FORM_MODAL_TYPE.ADD_EXAMPLE);
};
const handleClickDeleteMetric = () => {
    state.metricDeleteModalVisible = true;
};
const handleClickMoreMenuButton = () => {
    if (visibleContextMenu.value) hideContextMenu();
    else showContextMenu();
};
const handleOpenEditQuery = () => {
    if (!state.hasReadWriteAccess || state.isManagedMetric || state.currentMetricExampleId) {
        metricExplorerPageStore.openMetricQueryFormSidebar('VIEW');
    } else {
        metricExplorerPageStore.openMetricQueryFormSidebar('UPDATE');
    }
};
</script>

<template>
    <fragment>
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading :title="state.pageTitle">
                    <template v-if="!loading"
                              #title-left-extra
                    >
                        <p-i v-if="state.currentMetricExampleId"
                             name="ic_example-filled"
                             width="1.5rem"
                             height="1.5rem"
                             :color="gray[700]"
                        />
                        <p-i v-else
                             :name="state.isManagedMetric ? 'ic_main-filled' : 'ic_sub'"
                             width="1rem"
                             height="1rem"
                             :color="gray[500]"
                        />
                    </template>
                    <template v-if="!loading"
                              #title-right-extra
                    >
                        <div v-if="!state.isManagedMetric"
                             class="title-right-extra icon-wrapper"
                        >
                            <p-icon-button v-if="state.hasReadWriteAccess"
                                           name="ic_edit-text"
                                           size="md"
                                           @click.stop="handleClickEditName"
                            />
                            <p-icon-button v-if="state.hasReadWriteAccess"
                                           name="ic_delete"
                                           size="md"
                                           style-type="negative-transparent"
                                           @click.stop="handleClickDeleteMetric"
                            />
                        </div>
                    </template>
                </p-heading>
            </template>
            <template v-if="!loading"
                      #extra
            >
                <!-- metric case -->
                <p-button style-type="tertiary"
                          :icon-left="state.editQueryButtonIcon"
                          @click="handleOpenEditQuery"
                >
                    {{ state.editQueryTitle }}
                </p-button>
                <template v-if="state.hasReadWriteAccess">
                    <template v-if="!state.currentMetricExampleId">
                        <p-button v-if="state.isDuplicateEnabled"
                                  style-type="tertiary"
                                  icon-left="ic_clone"
                                  :loading="state.loadingDuplicate"
                                  @click="handleDuplicate"
                        >
                            {{ $t('INVENTORY.METRIC_EXPLORER.DUPLICATE') }}
                        </p-button>
                        <p-button v-if="!storeState.isAdminMode"
                                  style-type="tertiary"
                                  icon-left="ic_plus_bold"
                                  @click="handleOpenAddExampleModal"
                        >
                            {{ $t('INVENTORY.METRIC_EXPLORER.ADD_EXAMPLE') }}
                        </p-button>
                    </template>
                    <!-- example case -->
                    <span v-else
                          class="save-button-wrapper"
                    >
                        <p-button class="save-button"
                                  style-type="tertiary"
                                  icon-left="ic_disk-filled"
                                  @click="handleSaveMetricExample"
                        >
                            {{ $t('INVENTORY.METRIC_EXPLORER.SAVE') }}
                        </p-button>
                        <p-icon-button ref="targetRef"
                                       class="more-menu-button"
                                       :name="visibleContextMenu ? 'ic_chevron-up' : 'ic_chevron-down'"
                                       style-type="tertiary"
                                       shape="square"
                                       size="md"
                                       color="inherit"
                                       @click="handleClickMoreMenuButton"
                        />
                        <p-context-menu v-show="visibleContextMenu"
                                        ref="contextMenuRef"
                                        :visible-menu="visibleContextMenu"
                                        :menu="state.saveDropdownMenuItems"
                                        @select="handleSelectSaveAsExample"
                        />
                    </span>
                </template>
            </template>
        </p-heading-layout>
        <delete-modal :header-title="state.deleteModalTitle"
                      :visible.sync="state.metricDeleteModalVisible"
                      :contents="$t('INVENTORY.METRIC_EXPLORER.DELETE_MODAL_DESC')"
                      @confirm="handleDeleteMetric"
        />
        <metric-explorer-name-form-modal :visible.sync="state.metricNameFormModalVisible"
                                         :type="state.selectedNameFormModalType"
        />
        <metric-explorer-query-form-sidebar />
    </fragment>
</template>

<style lang="postcss" scoped>
.title-right-extra {
    @apply flex-shrink-0 inline-flex items-center;
    margin-bottom: -0.25rem;
}
.save-button-wrapper {
    @apply relative;
    display: flex;
    align-items: center;
    gap: 0;
    .save-button {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }
    .more-menu-button {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        border-left: 0;
    }
    > .p-context-menu {
        margin-top: -1px;
        min-width: 10rem !important;
    }
}
</style>
