<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PButtonModal, PSearch, PCheckbox, PButton, PI, PIconButton,
} from '@cloudforet/mirinae';

import type { PrivateDashboardModel } from '@/schema/dashboard/private-dashboard/model';
import type { PublicDashboardModel } from '@/schema/dashboard/public-dashboard/model';

import { useProxyValue } from '@/common/composables/proxy-state';
import LSBCollapsibleMenuItem from '@/common/modules/navigations/lsb/modules/LSBCollapsibleMenuItem.vue';

import DashboardManageVariableImportModalTree
    from '@/services/dashboards/components/dashboard-detail/DashboardManageVariableImportModalTree.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';
import { useDashboardPageControlStore } from '@/services/dashboards/stores/dashboard-page-control-store';
import type { DashboardGlobalVariableModel } from '@/services/dashboards/types/global-variable-type';

const MOCK_CURRNET_DASHBOARD_VARIABLES: DashboardGlobalVariableModel[] = [
    {
        management: 'managed',
        key: 'mock_key1',
        name: 'Variable 1',
        method: 'manual',
        type: 'text',
        valueType: 'any',
        options: {
        },
    },
    {
        management: 'managed',
        key: 'mock_key2',
        name: 'Variable 2',
        method: 'manual',
        type: 'text',
        valueType: 'any',
        options: {
        },
    },
];

const MOCK_SELECTED_DASHBOARD_VARIABLES: DashboardGlobalVariableModel[] = [
    {
        management: 'managed',
        key: 'mock_key1',
        name: 'Variable 1',
        method: 'manual',
        type: 'text',
        valueType: 'any',
        options: {
        },
    },
    {
        management: 'managed',
        key: 'mock_key2',
        name: 'Variable 2',
        method: 'manual',
        type: 'text',
        valueType: 'any',
        options: {
        },
    },
    {
        management: 'managed',
        key: 'mock_key3',
        name: 'Variable 3',
        method: 'manual',
        type: 'text',
        valueType: 'any',
        options: {
        },
    },
    {
        management: 'managed',
        key: 'mock_key4',
        name: 'Variable 4',
        method: 'manual',
        type: 'text',
        valueType: 'any',
        options: {
        },
    },
    {
        management: 'managed',
        key: 'mock_key5',
        name: 'Variable 5',
        method: 'manual',
        type: 'text',
        valueType: 'any',
        options: {
        },
    },
];

interface Props {
    visible: boolean;
}
const dashboardPageControlStore = useDashboardPageControlStore();
const dashboardPageControlGetters = dashboardPageControlStore.getters;
const dashboardDetailInfoStore = useDashboardDetailInfoStore();
const dashboardDetailInfoState = dashboardDetailInfoStore.state;
const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;}>();

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    currentDashboardId: computed(() => dashboardDetailInfoState.dashboardId),
    currentDashboardVariables: computed<DashboardGlobalVariableModel[]>(() => {
        // const currentVariables = Object.values(dashboardDetailInfoState.variablesSchema.properties) as DashboardGlobalVariableModel[];
        const currentVariables = MOCK_CURRNET_DASHBOARD_VARIABLES as DashboardGlobalVariableModel[];
        return currentVariables;
    }),
    keyword: '',
    selectedDashboardId: '' as string|undefined,
    publicDashboardItems: computed<PublicDashboardModel[]>(() => dashboardPageControlGetters.publicDashboardItems.filter((item) => item.dashboard_id !== state.currentDashboardId)),
    privateDashboardItems: computed<PrivateDashboardModel[]>(() => dashboardPageControlGetters.privateDashboardItems.filter((item) => item.dashboard_id !== state.currentDashboardId)),
    allDashboardItems: computed<PrivateDashboardModel[]>(() => [...state.publicDashboardItems, ...state.privateDashboardItems]),
    selectedDashboardVariables: computed<DashboardGlobalVariableModel[]>(() => {
        const _mock = MOCK_SELECTED_DASHBOARD_VARIABLES;
        // const selectedDashboard = state.allDashboardItems.find((item) => item.dashboard_id === state.selectedDashboardId);
        // if (!selectedDashboard) return [];
        // return Object.values(selectedDashboard.variables_schema?.properties as Record<string, DashboardGlobalVariableModel> ?? {});
        return _mock;
    }),
    selectedVariables: [] as string[],
    isAllSelected: computed(() => state.selectedVariables.length === state.selectedDashboardVariables.filter((variable) => !isDuplicatedVariableName(variable)).length),
    notiBannerVisible: true,
});


const handleChangeSelectedVariables = (selected: string[]) => {
    state.selectedVariables = selected;
};
const handleChangeAllSelectedVariables = (selected: boolean) => {
    state.selectedVariables = selected ? state.selectedDashboardVariables.filter((variable) => !isDuplicatedVariableName(variable)).map((variable) => variable.key) : [];
};
const handleClickClearAll = () => {
    state.selectedVariables = [];
};

const handleCloseScopeNotificationBanner = () => {
    state.notiBannerVisible = false;
};

const handleConfirmImportVariables = () => {
    // TODO: Implement import variables
};


const isDuplicatedVariableName = (variable: DashboardGlobalVariableModel) => state.currentDashboardVariables.some((currentVariable) => currentVariable.name === variable.name
    || currentVariable.key === variable.key);

const getIndeterminate = () => {
    const availableVariableCount = state.selectedDashboardVariables.filter((variable) => !isDuplicatedVariableName(variable)).length;
    return state.selectedVariables.length > 0 && state.selectedVariables.length < availableVariableCount;
};

watch(() => state.selectedDashboardVariables, (selectedDashboardVariables) => {
    state.notiBannerVisible = selectedDashboardVariables.some((variable) => isDuplicatedVariableName(variable));
});

</script>

<template>
    <p-button-modal class="dashboard-manage-variable-import-modal"
                    :header-title="$t('DASHBOARDS.DETAIL.VARIABLES.IMPORT_MODAL_HEADER')"
                    :visible.sync="state.proxyVisible"
                    @confirm="handleConfirmImportVariables"
    >
        <template #body>
            <div class="import-contents">
                <div class="left-dashboard-variable-tree-contents">
                    <l-s-b-collapsible-menu-item v-if="state.publicDashboardItems.length || dashboardPageControlGetters.publicFolderItems.length"
                                                 class="category-menu-item mt-1"
                                                 :item="{
                                                     type: 'collapsible',
                                                     label: $t('DASHBOARDS.LNB.SHARED'),
                                                     subItems: state.publicDashboardItems,
                                                 }"
                                                 is-sub-item
                                                 show-sub-item-count
                    >
                        <template #collapsible-contents>
                            <dashboard-manage-variable-import-modal-tree type="PUBLIC"
                                                                         :dashboards="state.publicDashboardItems"
                                                                         :selected.sync="state.selectedDashboardId"
                            />
                        </template>
                    </l-s-b-collapsible-menu-item>
                    <l-s-b-collapsible-menu-item v-if="state.privateDashboardItems.length || dashboardPageControlGetters.privateFolderItems.length"
                                                 class="category-menu-item mt-1"
                                                 :item="{
                                                     type: 'collapsible',
                                                     label: $t('DASHBOARDS.LNB.PRIVATE'),
                                                     subItems: state.privateDashboardItems,
                                                 }"
                                                 is-sub-item
                                                 show-sub-item-count
                    >
                        <template #collapsible-contents>
                            <dashboard-manage-variable-import-modal-tree type="PRIVATE"
                                                                         :dashboards="state.privateDashboardItems"
                                                                         :selected.sync="state.selectedDashboardId"
                            />
                        </template>
                    </l-s-b-collapsible-menu-item>
                </div>
                <div class="left-dashboard-variable-contents">
                    <p-search v-model="state.keyword" />
                    <div class="variable-list-wrapper">
                        <div class="variable-list-header">
                            <div class="header">
                                <p-checkbox :selected="state.isAllSelected"
                                            :indeterminate="getIndeterminate()"
                                            @change="handleChangeAllSelectedVariables"
                                />
                                <span>{{ $t('DASHBOARDS.DETAIL.VARIABLES.NAME') }}</span>
                            </div>
                            <p-button size="sm"
                                      style-type="tertiary"
                                      @click="handleClickClearAll"
                            >
                                {{ $t('DASHBOARDS.DETAIL.VARIABLES.CLEAR_ALL') }}
                            </p-button>
                        </div>
                        <div class="variable-list">
                            <div v-if="state.notiBannerVisible"
                                 class="variable-scoped-notification-banner"
                            >
                                <p-i name="ic_warning-filled"
                                     width="1.25rem"
                                     height="1.25rem"
                                />
                                <span class="description">{{ $t('DASHBOARDS.DETAIL.VARIABLES.DUPLICATED_NAME_WARNING') }}</span>
                                <p-icon-button name="ic_close"
                                               width="1.5rem"
                                               height="1.5rem"
                                               @click="handleCloseScopeNotificationBanner"
                                />
                            </div>
                            <div v-for="(variable) in state.selectedDashboardVariables"
                                 :key="variable.key"
                                 class="variable"
                            >
                                <p-checkbox :selected="state.selectedVariables"
                                            :value="variable.key"
                                            :disabled="isDuplicatedVariableName(variable)"
                                            @change="handleChangeSelectedVariables"
                                >
                                    <span class="variable-text">{{ variable.name }}</span>
                                </p-checkbox>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </p-button-modal>
</template>

<style scoped lang="postcss">
.dashboard-manage-variable-import-modal {
    .import-contents {
        @apply bg-gray-100 flex;
        height: 36.6875rem;

        .left-dashboard-variable-tree-contents {
            width: 14.625rem;
            padding-right: 1rem;
            height: 100%;
            overflow: auto;
        }
        .left-dashboard-variable-contents {
            @apply flex-1 flex flex-col gap-2;
            padding: 0.5rem;

            .variable-list-wrapper {
                @apply bg-white border border-gray-150 rounded-lg;
                height: 100%;
                overflow: auto;

                .variable-list-header {
                    @apply border-b-2 border-gray-200 flex items-center justify-between;
                    padding: 0.5rem;
                    height: 2.5rem;
                    .header {
                        @apply flex items-center gap-1 text-label-md font-bold text-gray-900;
                    }
                }

                .variable-list {
                    height: calc(100% - 2.5rem);
                    overflow: auto;

                    .variable-scoped-notification-banner {
                        @apply bg-yellow-100 flex gap-1;
                        padding: 0.5rem 1rem;

                        .description {
                            @apply flex-1 text-paragraph-md text-gray-900;
                        }
                    }

                    .variable {
                        @apply flex items-center;
                        padding: 0.5rem;
                        height: 2.25rem;
                        .variable-text {
                            @apply text-label-md text-gray-900;
                            padding-left: 0.25rem;
                            line-height: 1.5;
                        }
                    }
                }
            }
        }
    }
}
</style>
