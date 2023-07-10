<script lang="ts" setup>

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PCheckbox, PFieldGroup, PRadio, PTextInput,
} from '@spaceone/design-system';
import {
    computed,
    reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { fetchDefaultLayoutData } from '@/services/cost-explorer/cost-dashboard/lib/helper';
import type {
    CustomLayout, DashboardCreateParam,
    DashboardInfo,
    DashboardPrivacyType, PeriodType,
} from '@/services/cost-explorer/cost-dashboard/type';
import {
    DASHBOARD_PRIVACY_TYPE, PERIOD_TYPE,
} from '@/services/cost-explorer/cost-dashboard/type';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { useCostExplorerDashboardStore } from '@/services/cost-explorer/store/cost-explorer-dashboard-store';


interface Props {
    visible: boolean;
    dashboard: DashboardInfo;
    manageDisabled: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    dashboard: () => ({}) as DashboardInfo,
    manageDisabled: false,
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void}>();

const { t } = useI18n();
const router = useRouter();

const visibilityList = [
    {
        name: DASHBOARD_PRIVACY_TYPE.USER,
        label: t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.VISIBILITY.PRIVATE'),
    },
    {
        name: DASHBOARD_PRIVACY_TYPE.PUBLIC,
        label: t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.VISIBILITY.PUBLIC'),
    },
];

const costExplorerDashboardStore = useCostExplorerDashboardStore();

const {
    forms: {
        name,
        visibility,
    },
    setForm,
    initForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    name: '',
    visibility: '',
}, {
    name(value: string) { return value.trim().length ? '' : 'Required Field'; },
    visibility(value: DashboardPrivacyType) { return value.length ? '' : 'Required Field'; },
});
const state = reactive({
    proxyVisible: props.visible,
    filteredVisibilityList: computed(() => (props.manageDisabled ? visibilityList.filter((item) => item.name === DASHBOARD_PRIVACY_TYPE.USER) : visibilityList)),
    includesFilter: false,
});

const handleUpdateVisible = (visible) => {
    state.proxyVisible = visible;
    emit('update:visible', visible);
};

const getCustomLayouts = async () => {
    const hasDefaultId = Object.prototype.hasOwnProperty.call(props.dashboard, 'default_layout_id');
    if (hasDefaultId && (!props.dashboard.custom_layouts || props.dashboard.custom_layouts.length === 0)) {
        return await fetchDefaultLayoutData(props.dashboard.default_layout_id as string) as CustomLayout[];
    }
    return props.dashboard.custom_layouts as CustomLayout[];
};

const makeDashboardCreateParam = async (): Promise<DashboardCreateParam> => ({
    name: name.value,
    custom_layouts: await getCustomLayouts(),
    period_type: props.dashboard.period_type as PeriodType ?? PERIOD_TYPE.AUTO,
    period: props.dashboard.period,
    default_filter: state.includesFilter ? props.dashboard.default_filter : {},
});

const createPublicDashboard = async (): Promise<string|undefined> => {
    try {
        const res = await SpaceConnector.client.costAnalysis.publicDashboard.create(await makeDashboardCreateParam() as DashboardCreateParam);
        return res.public_dashboard_id;
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.ALT_E_CREATE_ALERT'));
    }
    return undefined;
};

const createUserDashboard = async (): Promise<string|undefined> => {
    try {
        const res = await SpaceConnector.client.costAnalysis.userDashboard.create(await makeDashboardCreateParam() as DashboardCreateParam);
        return res.user_dashboard_id;
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.ALT_E_CREATE_ALERT'));
    }
    return undefined;
};

const handleConfirm = async () => {
    if (!isAllValid) return;
    const duplicatedDashboardId = visibility.value === DASHBOARD_PRIVACY_TYPE.PUBLIC ? await createPublicDashboard() : await createUserDashboard();
    await costExplorerDashboardStore.setDashboardList();
    if (duplicatedDashboardId) {
        await router.push({
            name: COST_EXPLORER_ROUTE.DASHBOARD._NAME,
            params: { dashboardId: duplicatedDashboardId },
        });
    }
    emit('update:visible', false);
};

const init = () => {
    initForm('name', `Copy - ${props.dashboard.name}`);
    initForm('visibility', '');
};

watch(() => props.visible, (visible) => {
    if (visible !== state.proxyVisible) state.proxyVisible = visible;
    init();
});

</script>

<template>
    <p-button-modal :visible="state.proxyVisible"
                    :header-title="t('BILLING.COST_MANAGEMENT.DASHBOARD.DUPLICATE_DASHBOARD')"
                    size="sm"
                    :disabled="!isAllValid"
                    class="cost-dashboard-duplicate-modal"
                    @confirm="handleConfirm"
                    @update:visible="handleUpdateVisible"
    >
        <template #body>
            <p-field-group :label="t('BILLING.COST_MANAGEMENT.DASHBOARD.DASHBOARD_NAME')"
                           :invalid="invalidState.name"
                           :invalid-text="invalidTexts.name"
                           required
            >
                <p-text-input :value="name"
                              :invalid="invalidState.name"
                              @update:value="setForm('name', $event)"
                />
            </p-field-group>
            <p-checkbox v-model="state.includesFilter">
                {{ t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.TEMPLATE.APPLIED_FILTER') }}
            </p-checkbox>
            <p-field-group :label="t('BILLING.COST_MANAGEMENT.DASHBOARD.DASHBOARD_VISIBILITY')"
                           :invalid="invalidState.visibility"
                           :invalid-text="invalidTexts.visibility"
                           required
                           class="mt-6"
            >
                <p-radio v-for="{ name: visibilityName, label } in state.filteredVisibilityList"
                         :key="visibilityName"
                         :value="visibilityName"
                         :selected="visibility"
                         class="radio-group"
                         @change="setForm('visibility', $event)"
                >
                    <span class="capitalize ml-1">{{ label.toLowerCase() }}</span>
                </p-radio>
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.cost-dashboard-duplicate-modal {
    .radio-group {
        @apply inline-block;
        margin-bottom: 0.625rem;
    }
    .p-text-input {
        @apply w-full;
    }
}
</style>
