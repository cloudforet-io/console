<template>
    <!--    song-lang-->
    <p-button-modal :visible="proxyVisible"
                    header-title="Duplicate Dashboard"
                    size="sm"
                    :disabled="!isAllValid"
                    class="dashboard-duplicate-modal"
                    @confirm="handleConfirm"
                    @update:visible="handleUpdateVisible"
    >
        <template #body>
            <p-field-group label="Dashboard Name"
                           :invalid="invalidState.name"
                           :invalid-text="invalidTexts.name"
                           required
            >
                <p-text-input :value="name"
                              :invalid="invalidState.name"
                              @input="setForm('name', $event)"
                />
            </p-field-group>
            <p-check-box v-model="includesFilter">
                <!--                song-lang-->
                Include Applied Filter from selected dashboard
            </p-check-box>
            <!--            song-lang-->
            <p-field-group label="Dashboard Visibility"
                           :invalid="invalidState.visibility"
                           :invalid-text="invalidTexts.visibility"
                           required
                           class="mt-6"
            >
                <p-radio v-for="{ name: visibilityName, label } in filteredVisibilityList"
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

<script lang="ts">

import {
    computed,
    defineComponent,
    reactive, toRefs, watch,
} from 'vue';

import {
    PButtonModal, PCheckBox, PFieldGroup, PRadio, PTextInput,
} from '@spaceone/design-system';

import { SpaceRouter } from '@/router';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import type {
    DashboardInfo,
    DashboardPrivacyType,
} from '@/services/cost-explorer/cost-dashboard/type';
import {
    DASHBOARD_PRIVACY_TYPE,
} from '@/services/cost-explorer/cost-dashboard/type';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';

interface Props {
    visible: boolean;
    dashboard: DashboardInfo;
    manageDisabled: boolean;
}

const visibilityList = [
    {
        name: DASHBOARD_PRIVACY_TYPE.USER,
        // song-lang
        label: 'My Dashboard (Private)',
    },
    {
        name: DASHBOARD_PRIVACY_TYPE.PUBLIC,
        // song-lang
        label: 'Public (Public To All Members Who Has ‘View‘ Access.)',
    },
];
export default defineComponent<Props>({
    name: 'DashboardDuplicateModal',
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
            default: () => {},
        },
        manageDisabled: {
            type: Boolean,
            default: false,
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
            // song-lang
            name(value: string) { return value.trim().length ? '' : 'Required Field'; },
            // song-lang
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

        // const getCustomLayouts = async () => {
        //     const hasDefaultId = Object.prototype.hasOwnProperty.call(props.dashboard, 'default_layout_id');
        //     if (hasDefaultId && (!props.dashboard.custom_layouts || props.dashboard.custom_layouts.length === 0)) {
        //         return await fetchDefaultLayoutData(props.dashboard.default_layout_id as string) as CustomLayout[];
        //     }
        //     return props.dashboard.custom_layouts as CustomLayout[];
        // };

        // const makeDashboardCreateParam = async (): Promise<DashboardCreateParam> => ({
        //     name: name.value,
        //     custom_layouts: await getCustomLayouts(),
        //     period_type: props.dashboard.period_type as PeriodType ?? PERIOD_TYPE.AUTO,
        //     period: props.dashboard.period,
        //     default_filter: state.includesFilter ? props.dashboard.default_filter : {},
        // });

        const createPublicDashboard = async (): Promise<string|undefined> => {
            try {
                // const res = await SpaceConnector.client.costAnalysis.publicDashboard.create(await makeDashboardCreateParam() as DashboardCreateParam);
                // return res.public_dashboard_id;
            } catch (e) {
                // song-lang
                ErrorHandler.handleRequestError(e, 'Failed to create dashboard');
            }
            return undefined;
        };

        const createUserDashboard = async (): Promise<string|undefined> => {
            try {
                // const res = await SpaceConnector.client.costAnalysis.userDashboard.create(await makeDashboardCreateParam() as DashboardCreateParam);
                // return res.user_dashboard_id;
            } catch (e) {
                // song-lang
                ErrorHandler.handleRequestError(e, 'Failed to create dashboard');
            }
            return undefined;
        };

        const handleConfirm = async () => {
            if (!isAllValid) return;
            const duplicatedDashboardId = visibility.value === DASHBOARD_PRIVACY_TYPE.PUBLIC ? await createPublicDashboard() : await createUserDashboard();
            // TODO:: connect dashboard store
            // await costExplorerStore.dispatch('setDashboardList');
            if (duplicatedDashboardId) {
                await SpaceRouter.router.push({
                    name: DASHBOARDS_ROUTE._NAME,
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
.dashboard-duplicate-modal {
    .radio-group {
        @apply inline-block;
        margin-bottom: 0.625rem;
    }
    .p-text-input {
        @apply w-full;
    }
}
</style>
