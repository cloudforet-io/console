<script lang="ts" setup>
import {
    computed, defineExpose, reactive, watch,
} from 'vue';

import {
    PI, PFieldGroup, PTextInput, PSelectDropdown,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/inputs/dropdown/select-dropdown/type';
import type { InputItem } from '@cloudforet/mirinae/types/inputs/input/text-input/type';

import { SpaceRouter } from '@/router';
import { RESOURCE_GROUP } from '@/schema/_common/constant';
import type { DashboardCreateParams } from '@/schema/dashboard/_types/dashboard-type';
import type { PublicDashboardCreateParameters } from '@/schema/dashboard/public-dashboard/api-verbs/create';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import { showErrorMessage } from '@/lib/helper/notice-alert-helper';

import { useFormValidator } from '@/common/composables/form-validator';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import { useProxyValue } from '@/common/composables/proxy-state';

import DashboardCreateScopeForm from '@/services/dashboards/components/dashboard-create/DashboardCreateScopeForm.vue';
import {
    DASHBOARD_VARS_SCHEMA_PRESET,
    DOMAIN_DASHBOARD_VARS_SCHEMA_PRESET,
} from '@/services/dashboards/constants/dashboard-vars-schema-preset';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { useDashboardCreatePageStore } from '@/services/dashboards/stores/dashboard-create-page-store';
import { useDashboardPageControlStore } from '@/services/dashboards/stores/dashboard-page-control-store';



interface Props {
    isValid: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:is-valid', value: boolean): void
}>();

const { getProperRouteLocation } = useProperRouteLocation();
const appContextStore = useAppContextStore();
const dashboardStore = useDashboardStore();
const dashboardCreatePageStore = useDashboardCreatePageStore();
const dashboardCreatePageState = dashboardCreatePageStore.state;
const dashboardCreatePageGetters = dashboardCreatePageStore.getters;
const dashboardPageControlStore = useDashboardPageControlStore();
const dashboardPageControlGetters = dashboardPageControlStore.getters;
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});
const state = reactive({
    proxyIsValid: useProxyValue('isValid', props, emit),
    dashboardNameList: computed<string[]>(() => dashboardStore.getDashboardNameList(dashboardCreatePageGetters.dashboardType)),
    labels: [] as InputItem[],
    folderMenuItems: computed<SelectDropdownMenuItem[]>(() => {
        const defaultItem = {
            label: i18n.t('DASHBOARDS.ALL_DASHBOARDS.NO_PARENT_FOLDER'),
            name: '',
        };
        if (dashboardCreatePageState.dashboardScope === 'PRIVATE') {
            return [
                defaultItem,
                ...dashboardPageControlGetters.privateFolderItems.map((folder) => ({
                    label: folder.name,
                    name: folder.folder_id,
                })),
            ];
        }
        return [
            defaultItem,
            ...dashboardPageControlGetters.publicFolderItems.map((folder) => ({
                label: folder.name,
                name: folder.folder_id,
            })),
        ];
    }),
    selectedFolderId: '' as string,
});
const {
    forms: {
        dashboardName,
    },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    dashboardName: '',
}, {
    dashboardName(value: string) {
        if (dashboardCreatePageState.loading || dashboardCreatePageState.dashboardCreated) return '';
        if (value.length > 100) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_LENGTH');
        if (!value.trim().length) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_INPUT');
        if (state.dashboardNameList.find((d) => d === value)) return i18n.t('DASHBOARDS.FORM.VALIDATION_DASHBOARD_NAME_UNIQUE');
        return '';
    },
});

/* Api */
const createSingleDashboard = async () => {
    const _dashboardParams: DashboardCreateParams = {
        name: dashboardName.value,
        labels: state.labels.map((item) => item.name),
        tags: { created_by: store.state.user.userId },
        folder_id: state.selectedFolderId,
        vars_schema: storeState.isAdminMode ? DOMAIN_DASHBOARD_VARS_SCHEMA_PRESET : DASHBOARD_VARS_SCHEMA_PRESET,
    };
    try {
        if (storeState.isAdminMode) {
            (_dashboardParams as PublicDashboardCreateParameters).resource_group = RESOURCE_GROUP.DOMAIN;
        } else if (dashboardCreatePageState.dashboardScope !== 'PRIVATE') {
            (_dashboardParams as PublicDashboardCreateParameters).resource_group = dashboardCreatePageState.dashboardScope || RESOURCE_GROUP.WORKSPACE;
        }
        const _dashboardType = dashboardCreatePageState.dashboardScope === 'PRIVATE' ? 'PRIVATE' : 'PUBLIC';
        const res = await dashboardStore.createDashboard(_dashboardType, _dashboardParams);
        dashboardCreatePageStore.setDashboardCreated(true);
        return res.dashboard_id;
    } catch (e) {
        showErrorMessage(i18n.t('DASHBOARDS.FORM.ALT_E_CREATE_DASHBOARD'), e);
        return undefined;
    }
};

/* Event */
const handleConfirm = async () => {
    dashboardCreatePageStore.setLoading(true);
    const createdDashboardId = await createSingleDashboard();
    await dashboardStore.load();
    if (createdDashboardId) {
        await SpaceRouter.router.push(getProperRouteLocation({
            name: DASHBOARDS_ROUTE.DETAIL._NAME,
            params: {
                dashboardId: createdDashboardId,
            },
        }));
    }
};

/* Watcher */
watch(() => isAllValid.value, (value) => {
    emit('update:is-valid', value);
});

/* Expose */
defineExpose({
    handleConfirm,
});
</script>

<template>
    <div class="dashboard-create-step2">
        <div class="selected-ootb-wrapper">
            <p-i name="ic_dashboard-template_others"
                 width="3.5rem"
                 height="3.5rem"
            />
            <div class="description-wrapper">
                <p class="description-title">
                    Blank
                </p>
            </div>
        </div>
        <div class="input-form-wrapper">
            <p-field-group :label="$t('DASHBOARDS.CREATE.NAME')"
                           required
                           :invalid="invalidState.dashboardName"
                           :invalid-text="invalidTexts.dashboardName"
            >
                <template #default="{invalid}">
                    <p-text-input :value="dashboardName"
                                  :invalid="invalid"
                                  block
                                  @update:value="setForm('dashboardName', $event)"
                    />
                </template>
            </p-field-group>
            <p-field-group :label="$t('DASHBOARDS.CREATE.LABEL')">
                <p-text-input multi-input
                              appearance-type="stack"
                              :selected.sync="state.labels"
                              block
                />
            </p-field-group>
            <dashboard-create-scope-form v-if="!storeState.isAdminMode" />
            <p-field-group :label="$t('DASHBOARDS.ALL_DASHBOARDS.LOCATION')"
                           required
                           class="mt-4"
            >
                <p-select-dropdown :selected.sync="state.selectedFolderId"
                                   :menu="state.folderMenuItems"
                                   block
                                   show-select-marker
                                   use-fixed-menu-style
                                   class="w-full"
                >
                    <template #menu-item--format="{item}">
                        <p-i v-if="item.name"
                             name="ic_folder"
                             width="1rem"
                             height="1rem"
                        />
                        {{ item.label }}
                    </template>
                </p-select-dropdown>
            </p-field-group>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-create-step2 {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}
.selected-ootb-wrapper {
    display: flex;
    gap: 1rem;
    .description-wrapper {
        display: grid;
        align-items: center;
        padding: 0.25rem 0;
        .description-title {
            @apply text-label-lg;
            font-weight: 500;
        }
    }
}
</style>
