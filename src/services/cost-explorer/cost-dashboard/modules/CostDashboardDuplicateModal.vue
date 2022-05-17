<template>
    <p-button-modal :visible="proxyVisible" :header-title="$t('BILLING.COST_MANAGEMENT.DASHBOARD.DUPLICATE_DASHBOARD')"
                    size="sm"
                    :disabled="!isAllValid"
                    class="cost-dashboard-duplicate-modal"
                    @confirm="handleConfirm"
                    @update:visible="handleUpdateVisible"
    >
        <template #body>
            <p-field-group :label="$t('BILLING.COST_MANAGEMENT.DASHBOARD.DASHBOARD_NAME')"
                           :invalid="invalidState.name"
                           :invalid-text="invalidTexts.name"
                           required
            >
                <p-text-input :value="name" :invalid="invalidState.name"
                              @input="setForm('name', $event)"
                />
            </p-field-group>
            <p-check-box v-model="includesFilter">
                {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.TEMPLATE.APPLIED_FILTER') }}
            </p-check-box>
            <p-field-group :label="$t('BILLING.COST_MANAGEMENT.DASHBOARD.DASHBOARD_VISIBILITY')"
                           :invalid="invalidState.visibility"
                           :invalid-text="invalidTexts.visibility"
                           required
                           class="mt-6"
            >
                <p-radio v-for="{ name, label } in filteredVisibilityList" :key="name" :value="name"
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

<script lang="ts">
import {
    computed,
    defineComponent,
    reactive, toRefs, watch,
} from '@vue/composition-api';
import {
    PButtonModal, PCheckBox, PFieldGroup, PRadio, PTextInput,
} from '@spaceone/design-system';
import { useFormValidator } from '@/common/composables/form-validator';
import {
    CustomLayout,
    DASHBOARD_PRIVACY_TYPE, DashboardCreateParam,
    DashboardInfo,
    DashboardPrivacyType, PERIOD_TYPE, PeriodType,
} from '@/services/cost-explorer/cost-dashboard/type';
import { i18n } from '@/translations';
import { fetchDefaultLayoutData } from '@/services/cost-explorer/cost-dashboard/lib/helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { store } from '@/store';
import { SpaceRouter } from '@/router';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { costExplorerStore } from '@/services/cost-explorer/store';

interface Props {
    visible: boolean;
    dashboard: DashboardInfo;
}

const visibilityList = [
    {
        name: DASHBOARD_PRIVACY_TYPE.USER,
        label: i18n.t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.VISIBILITY.PRIVATE'),
    },
    {
        name: DASHBOARD_PRIVACY_TYPE.PUBLIC,
        label: i18n.t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.VISIBILITY.PUBLIC'),
    },
];
export default defineComponent<Props>({
    name: 'CostDashboardDashboardDuplicateModal',
    components: {
        PButtonModal,
        PRadio,
        PFieldGroup,
        PTextInput,
        PCheckBox,
    },
    model: {
        prop: 'visible',
        event: 'update:visible',
    },
    props: {
        visible: {
            type: Boolean,
            required: true,
        },
        dashboard: {
            type: Object as () => DashboardInfo,
            default: {},
        },
    },
    setup(props, { emit }) {
        const {
            forms: {
                name,
                visibility,
            },
            setForm,
            initForm,
            invalidState,
            invalidTexts,
            validate,
            isAllValid,
        } = useFormValidator({
            name: '',
            visibility: '',
        }, {
            name(value: string) { return value.trim().length ? '' : 'Required Field'; },
            visibility(value: DashboardPrivacyType) { return value.length ? '' : 'Required Field'; },
        });
        const state = reactive({
            hasManagePermission: computed<boolean>(() => store.getters['user/hasManagePermission']),
            proxyVisible: props.visible,
            filteredVisibilityList: computed(() => (!state.hasManagePermission ? visibilityList.filter(item => item.name === DASHBOARD_PRIVACY_TYPE.USER) : visibilityList)),
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
                ErrorHandler.handleRequestError(e, i18n.t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.ALT_E_CREATE_ALERT'));
            }
            return undefined;
        };

        const createUserDashboard = async (): Promise<string|undefined> => {
            try {
                const res = await SpaceConnector.client.costAnalysis.userDashboard.create(await makeDashboardCreateParam() as DashboardCreateParam);
                return res.user_dashboard_id;
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.ALT_E_CREATE_ALERT'));
            }
            return undefined;
        };

        const handleConfirm = async () => {
            if (!isAllValid) return;
            const duplicatedDashboardId = visibility.value === DASHBOARD_PRIVACY_TYPE.PUBLIC ? await createPublicDashboard() : await createUserDashboard();
            await costExplorerStore.dispatch('setDashboardList');
            if (duplicatedDashboardId) {
                await SpaceRouter.router.push({
                    name: COST_EXPLORER_ROUTE.DASHBOARD._NAME,
                    params: { dashboardId: duplicatedDashboardId },
                });
            }
            emit('update:visible', false);
        };

        const init = () => {
            initForm('name', `CLONE - ${props.dashboard.name}`);
            initForm('visibility', '');
        };

        watch(() => props.visible, (visible) => {
            if (visible !== state.proxyVisible) state.proxyVisible = visible;
            init();
        });
        return {
            name,
            visibility,
            invalidState,
            invalidTexts,
            setForm,
            validate,
            isAllValid,
            ...toRefs(state),
            handleConfirm,
            handleUpdateVisible,
        };
    },
});
</script>
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
