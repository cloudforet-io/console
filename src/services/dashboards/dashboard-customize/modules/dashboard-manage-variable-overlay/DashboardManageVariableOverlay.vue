<template>
    <overlay-page-layout :visible="visible"
                         class="dashboard-manage-variable-overay"
    >
        <p-page-title :title="$t('DASHBOARDS.CUSTOMIZE.VARIABLES.TITLE')"
                      child
                      @goBack="$router.go(-1)"
        />
        <div class="content-wrapper">
            <p-panel-top :use-total-count="overlayState.contentStatus === 'LIST'"
                         :total-count="1"
            >
                <template #default>
                    {{ overlayState.titleSet[overlayState.contentStatus] }}
                </template>
                <template #extra>
                    <div class="add-button-wrapper">
                        <p-button v-if="overlayState.contentStatus === 'LIST'"
                                  icon-left="ic_plus"
                                  @click="handleChangeAddContent"
                        >
                            {{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.ADD') }}
                        </p-button>
                        <p-button v-else-if="overlayState.contentStatus === 'EDIT'"
                                  icon-left="ic_trashcan"
                                  style-type="negative-secondary"
                                  @click="handleOpenDeleteModal"
                        >
                            {{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.DELETE') }}
                        </p-button>
                    </div>
                </template>
            </p-panel-top>
            <div v-if="overlayState.contentStatus === 'LIST'"
                 class="list-wrapper"
            >
                <div class="variable-select-filter">
                    <span class="filter-header">{{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.FILTER_TITLE') }}</span>
                    <p-select-status v-for="(type, idx) in variableFilterList"
                                     :key="`variable-type-${idx}`"
                                     :selected="selectedVariableType"
                                     :value="type.name"
                                     @change="handleSelectType"
                    >
                        {{ type.label }}
                    </p-select-status>
                </div>
                <p-data-table :items="[]"
                              :fields="variableFields"
                >
                    <template #col-variable_type-formvariableItemsat="{ value }">
                        <p-badge :style-type="variableTypeBadgeStyleFormatter(value)">
                            {{ variableType[value] }}
                        </p-badge>
                    </template>
                    <template #col-use-format="{ value }">
                        <p-toggle-button :value="value"
                                         sync
                        />
                    </template>
                    <template #col-edit-format>
                        <button class="manage-button"
                                @click="handleEditVariable"
                        >
                            <p-i name="ic_edit" />
                            <span>{{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.EDIT') }}</span>
                        </button>
                    </template>
                    <template #col-delete-format>
                        <button class="manage-button"
                                @click="handleDeleteVariable"
                        >
                            <p-i name="ic_trashcan" />
                            <span>{{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.DELETE') }}</span>
                        </button>
                    </template>
                </p-data-table>
            </div>
            <dashboard-manage-variable-form v-else />
        </div>
        <delete-modal :header-title="deleteModalState.headerTitle"
                      :visible.sync="deleteModalState.visible"
                      :loading="deleteModalState.loading"
                      @confirm="handleDeleteVariable"
        />
    </overlay-page-layout>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';


import {
    PDataTable,
    PPanelTop,
    PButton,
    PBadge,
    PToggleButton,
    PI,
    PPageTitle,
    PSelectStatus,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import OverlayPageLayout from '@/common/modules/page-layouts/OverlayPageLayout.vue';

import type { VariableType } from '@/services/dashboards/config';
import DashboardManageVariableForm from '@/services/dashboards/dashboard-customize/modules/dashboard-manage-variable-overlay/modules/DashboardManageVariableForm.vue';

type OverlayStatus = 'LIST' | 'ADD' | 'EDIT';

export default defineComponent({
    name: 'DashboardManageVariableOverlay',
    components: {
        OverlayPageLayout,
        DeleteModal,
        PDataTable,
        PPanelTop,
        PButton,
        PBadge,
        PToggleButton,
        PI,
        PPageTitle,
        PSelectStatus,
        DashboardManageVariableForm,
    },
    props: {
        visible: {
            default: undefined,
            type: Boolean,
        },
    },
    setup() {
        const state = reactive({
            // TODO: implementation
            variableFilterList: computed(() => [
                { label: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.FILTER_ALL'), name: 'ALL' },
                { label: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.FILTER_MANAGED'), name: 'MANAGED' },
                { label: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.FILTER_CUSTOM'), name: 'CUSTOM' },
            ]),
            selectedVariableType: 'ALL',
            variableFields: [
                { name: 'name', label: 'Name' },
                { name: 'selectionType', label: 'Selection Type' },
                { name: 'variableType', label: 'Variable Type' },
                { name: 'use', label: 'Use' },
                { name: 'options', label: 'Options' },
                { name: 'edit', label: ' ' },
                { name: 'delete', label: ' ' },
            ],
            selectionType: computed(() => ({
                SINGLE: i18n.t('Single '),
                MULTI: i18n.t('Multi'),
            })),
            variableType: computed(() => ({
                MANAGED: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.FILTER_MANAGED'),
                CUSTOM: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.FILTER_CUSTOM'),
            })),
        });
        const overlayState = reactive({
            contentStatus: 'LIST' as OverlayStatus,
            titleSet: computed<Record<OverlayStatus, TranslateResult>>(() => ({
                LIST: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.SUB_TITLE'),
                ADD: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.ADD'),
                EDIT: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.SUB_TITLE_EDIT'),
            })),
        });

        const deleteModalState = reactive({
            headerTitle: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.DELETE_TITLE'),
            visible: false,
            loading: false,
        });

        /* Helper */
        const variableTypeBadgeStyleFormatter = (type: VariableType) => {
            if (type === 'MANAGED') return 'gray';
            return 'primary';
        };
        /* EVENT */
        const handleOpenDeleteModal = () => {
            deleteModalState.visible = true;
        };
        const handleSelectType = (selected) => {
            state.selectedVariableType = selected;
        };
        const handleChangeAddContent = () => {
            overlayState.contentStatus = 'ADD';
        };
        const handleAddVariable = () => {
            console.log('Add Variable!');
        };
        const handleEditVariable = () => {
            console.log('edit!');
        };
        const handleDeleteVariable = () => {
            console.log('delete!');
        };
        return {
            ...toRefs(state),
            overlayState,
            deleteModalState,
            handleChangeAddContent,
            handleOpenDeleteModal,
            handleSelectType,
            handleAddVariable,
            variableTypeBadgeStyleFormatter,
            handleEditVariable,
            handleDeleteVariable,
        };
    },
});
</script>

<style lang="postcss" scoped>
.dashboard-manage-variable-overay {
    @apply bg-gray-100;

    .content-wrapper {
        @apply relative bg-white border border-gray-200 rounded-md ;

        .add-button-wrapper {
            @apply flex justify-end;
        }
        .list-wrapper {
            .variable-select-filter {
                @apply flex items-center;
                height: 2.875rem;
                gap: 1rem;
                padding: 0.75rem 1rem;

                .filter-header {
                    @apply text-gray-500;
                    font-size: 0.875rem;
                    line-height: 1.25;
                }
            }
        }
    }
}
</style>
