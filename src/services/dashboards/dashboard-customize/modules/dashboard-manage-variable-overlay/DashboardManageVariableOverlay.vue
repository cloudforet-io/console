<template>
    <overlay-page-layout :visible="visible"
                         class="dashboard-manage-variable-overay"
    >
        <p-page-title :title="$t('DASHBOARDS.CUSTOMIZE.VARIABLES.TITLE')"
                      child
                      @goBack="$router.go(-1)"
        />
        <div class="content-wrapper">
            <p-panel-top :use-total-count="contentType === 'LIST'"
                         :total-count="1"
            >
                <template #default>
                    {{ titleSet[contentType] }}
                </template>
                <template #extra>
                    <div class="add-button-wrapper">
                        <p-button v-if="contentType === 'LIST'"
                                  icon-left="ic_plus"
                                  @click="handleChangeAddContent"
                        >
                            {{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.ADD') }}
                        </p-button>
                        <p-button v-else-if="contentType === 'EDIT'"
                                  icon-left="ic_trashcan"
                                  style-type="negative-secondary"
                                  @click="handleOpenDeleteModal"
                        >
                            {{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.DELETE') }}
                        </p-button>
                    </div>
                </template>
            </p-panel-top>
            <dashboard-manage-variable-table v-if="contentType === 'LIST'"
                                             :content-type.sync="contentType"
                                             :variables="variables"
                                             :order="order"
                                             @use-change="handleChangeVariableUse"
                                             @delete="handleOpenDeleteModal"
            />
            <dashboard-manage-variable-form v-else
                                            :content-type.sync="contentType"
            />
        </div>
        <delete-modal :header-title="deleteModalState.headerTitle"
                      :visible.sync="deleteModalState.visible"
                      :loading="deleteModalState.loading"
                      @confirm="handleDeleteVariable"
        />
    </overlay-page-layout>
</template>

<script setup lang="ts">
import {
    computed, reactive, toRefs,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';


import {
    PPanelTop,
    PButton,
    PPageTitle,
} from '@spaceone/design-system';
import { cloneDeep } from 'lodash';

import { i18n } from '@/translations';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import OverlayPageLayout from '@/common/modules/page-layouts/OverlayPageLayout.vue';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import DashboardManageVariableForm from '@/services/dashboards/dashboard-customize/modules/dashboard-manage-variable-overlay/modules/DashboardManageVariableForm.vue';
import DashboardManageVariableTable
    from '@/services/dashboards/dashboard-customize/modules/dashboard-manage-variable-overlay/modules/DashboardManageVariableTable.vue';
import type {
    OverlayStatus,
} from '@/services/dashboards/dashboard-customize/modules/dashboard-manage-variable-overlay/type';

interface Props {
    visible: boolean;
    variables: DashboardVariablesSchema['properties'];
    order: string[];
}
interface EmitFn {
    (e: 'change', value: DashboardVariablesSchema['properties']): void;
}

const props = defineProps<Props>();
const emit = defineEmits<EmitFn>();

const state = reactive({
    contentType: 'LIST' as OverlayStatus,
    titleSet: computed<Record<OverlayStatus, TranslateResult>>(() => ({
        LIST: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.SUB_TITLE'),
        ADD: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.ADD'),
        EDIT: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.SUB_TITLE_EDIT'),
    })),
});

const { contentType, titleSet } = toRefs(state);

const deleteModalState = reactive({
    headerTitle: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.DELETE_TITLE'),
    visible: false,
    loading: false,
    selected: '',
});

/* EVENT */
const handleChangeAddContent = () => {
    state.contentType = 'ADD';
};
const handleOpenDeleteModal = (propertyName: string) => {
    deleteModalState.selected = propertyName;
    deleteModalState.visible = true;
};
const handleDeleteVariable = () => {
    console.log(deleteModalState.selected, 'Delete!!!!');
};
const handleChangeVariableUse = (name: string, value: boolean) => {
    const properties = cloneDeep(props.variables) as DashboardVariablesSchema['properties'];
    properties[name].use = value;
    emit('change', properties);
};

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
