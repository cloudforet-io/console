<template>
    <div>
        <nav>
            <p-breadcrumbs :routes="routeState.route" />
            <p-page-title title="Create New Dashboard" child @goBack="$router.go(-1)" />
        </nav>
        <p-pane-layout>
            <h2>Template</h2>
            <h3>Start a new template</h3>

            <li v-for="({ name, widgetList }, idx) in defaultLayoutData" :key="name">
                <p-select-card
                    v-model="selectedLayout"
                    :value="name"
                    block
                >
                    {{ name }}
                </p-select-card>
                <p v-if="widgetList.length">
                    <span>List of widgets</span>
                    <p-collapsible-toggle :is-collapsed="!unfoldedIndices.includes(idx)"
                                          @update:isCollapsed="handleUpdateCollapsed(idx, ...arguments)"
                    />
                    <template v-if="unfoldedIndices.includes(idx)">
                        <span v-for="({name}) in getNamesOfWidgetList(widgetList)" :key="name">
                            {{ name }} <br>
                        </span>
                    </template>
                </p>
            </li>
            <p-divider class="w-full" />
            <h3>Clone an Existing Dashboard</h3>
            <p-select-card
                v-for="({ dashboard_id, name }) in existingDashboardData" :key="dashboard_id"
                v-model="selectedDashboard"
                :value="name"
                block
            >
                {{ name }}
            </p-select-card>
            <span>Filter</span>
        </p-pane-layout>
    </div>
</template>

<script lang="ts">
import {
    PBreadcrumbs, PCollapsibleToggle, PDivider, PPageTitle, PPaneLayout, PSelectCard,
} from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { flattenDeep } from 'lodash';
import { i18n } from '@/translations';
import { defaultLayoutMap } from '@/services/billing/cost-management/cost-dashboard/lib/config';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { DashboardInfo } from '@/services/billing/cost-management/cost-dashboard/type';

interface WidgetInfo {
    name: string;
    options: object;
    type: string;
    widget_id: string;
}
interface DefaultLayout {
    name: string;
    widgetList: any;
}
const defaultLayoutList: Record<string, DefaultLayout> = {
    ...{ blank: { name: 'Blank', widgetList: [] } },
    ...{ 'layout-1': { ...defaultLayoutMap['layout-1'] } },
    ...{ 'layout-4': { ...defaultLayoutMap['layout-4'] } },
};
const defaultLayoutData = Object.values(defaultLayoutList).map(d => (d));

const getNamesOfWidgetList = (widgetList) => {
    const flattenWidgetList: WidgetInfo[] = flattenDeep(widgetList);
    if (flattenWidgetList) return flattenWidgetList.map<Pick<WidgetInfo, 'name'>>(d => ({ name: d.name }));
    return [];
};


export default {
    name: 'CostDashboardCreatePage',
    components: {
        PBreadcrumbs,
        PPageTitle,
        PPaneLayout,
        PDivider,
        PSelectCard,
        PCollapsibleToggle,
    },

    setup() {
        const routeState = reactive({
            route: computed(() => [
                { name: i18n.t('MENU.BILLING.BILLING'), path: '/billing' },
                { name: i18n.t('MENU.BILLING.COST_MANAGEMENT'), path: '/billing/cost-management' },
                { name: 'Create New Dashboard' },
            ]),
        });
        const state = reactive({
            existingDashboardData: [] as Partial<DashboardInfo>[],
            selectedLayout: {} as Record<string, DefaultLayout>,
            unfoldedIndices: [] as number[],
            selectedDashboard: {} as DashboardInfo,
        });

        const handleUpdateCollapsed = (idx: number, isCollapsed: boolean) => {
            const foundIdx = state.unfoldedIndices.findIndex(d => d === idx);
            if (isCollapsed) {
                if (foundIdx !== -1) {
                    const newIndices = [...state.unfoldedIndices];
                    newIndices.splice(foundIdx, 1);
                    state.unfoldedIndices = newIndices;
                }
            } else if (foundIdx === -1) {
                state.unfoldedIndices.push(idx);
            }
        };

        const listDashboard = async () => {
            try {
                const { results } = await SpaceConnector.client.costAnalysis.dashboard.list();
                state.existingDashboardData = results.map(d => ({
                    custom_layouts: d.custom_layouts,
                    dashboard_id: d.dashboard_id,
                    default_filter: d.default_filter,
                    default_layout_id: d.default_layout_id,
                    name: d.name,
                }) as Partial<DashboardInfo>);
            } catch (e) {
                ErrorHandler.handleError(e);
                state.existingDashboardData = [];
            }
        };
        listDashboard();

        return {
            routeState,
            ...toRefs(state),
            defaultLayoutData,
            handleUpdateCollapsed,
            getNamesOfWidgetList,
        };
    },
};
</script>
