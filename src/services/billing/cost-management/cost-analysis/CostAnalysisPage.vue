<template>
    <div class="cost-analysis-page">
        <p-breadcrumbs :routes="routeState.route" />
        <div class="top-wrapper">
            <p-icon-button name="ic_list" class="list-button" />
            <p-page-title :title="title">
                <template #extra>
                    <div class="title-extra-wrapper">
                        <favorite-button :item-id="widgetId"
                                         favorite-type="billing"
                                         resource-type="billing.CostManagement"
                        />
                        <div class="button-wrapper">
                            <p-button style-type="gray-border" class="mr-4">
                                PDF
                            </p-button>
                            <p-button style-type="gray-border">
                                Save
                            </p-button>
                        </div>
                    </div>
                </template>
            </p-page-title>
        </div>
        <div class="filter-wrapper">
            filters
        </div>
    </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';
import { i18n } from '@/translations';

import {
    PBreadcrumbs, PPageTitle, PButton, PIconButton,
} from '@spaceone/design-system';

import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { BILLING_ROUTE } from '@/services/billing/routes';


export default {
    name: 'CostAnalysisPage',
    components: {
        FavoriteButton,
        PBreadcrumbs,
        PPageTitle,
        PButton,
        PIconButton,
    },
    setup() {
        const state = reactive({
            title: 'Sample Title',
            widgetId: '',
        });
        const routeState = reactive({
            route: computed(() => [
                { name: i18n.t('MENU.BILLING.BILLING'), to: { name: BILLING_ROUTE._NAME } },
                { name: i18n.t('MENU.BILLING.COST_MANAGEMENT'), to: { name: BILLING_ROUTE.COST_MANAGEMENT._NAME } },
                { name: i18n.t('MENU.BILLING.COST_ANALYSIS') },
            ]),
        });

        return {
            ...toRefs(state),
            routeState,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-analysis-page {
    .top-wrapper {
        display: flex;

        .list-button {
            margin-right: 0.5rem;
        }
        .title-extra-wrapper {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-left: 0.75rem;
        }
    }
}
</style>
