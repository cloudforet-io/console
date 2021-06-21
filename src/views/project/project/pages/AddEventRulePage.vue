<template>
    <general-page-layout class="add-service-account-container">
        <p-breadcrumbs class="flex-grow" :routes="routeState.routes" />
        <p-page-title child :title="'event rule'"
                      class="page-title"
                      @goBack="$router.go(-1)"
        />
        <div v-for="data in orderedCardData" :key="data.order" class="card-list-wrapper">
            <p-card class="card">
                <template #header>
                    <span>#{{ data.order }} </span>
                    <span :class="{'disabled': data.order === 1}"
                          class="arrow-button"
                          @click="onClickUpButton(data)"
                    >
                        <p-i name="ic_arrow_top" width="1rem" height="1rem"
                             color="inherit transparent"
                        />
                    </span>
                    <span :class="{'disabled': data.order === orderedCardData.length}"
                          class="arrow-button"
                          @click="onClickDownButton(data)"
                    >
                        <p-i name="ic_arrow_bottom" width="1rem" height="1rem"
                             color="inherit transparent"
                        />
                    </span>
                </template>
                {{ data.event_rule_id }}
            </p-card>
        </div>
    </general-page-layout>
</template>


<script lang="ts">
/* eslint-disable camelcase */
import { computed, reactive, toRefs } from '@vue/composition-api';

import {
    PPageTitle, PBreadcrumbs, PCard, PI,
} from '@spaceone/design-system';

import GeneralPageLayout from '@/common/components/layouts/GeneralPageLayout.vue';
import { i18n } from '@/translations';
import { SpaceConnector } from '@/lib/space-connector';


export default {
    name: 'AddEventRulePage',
    components: {
        GeneralPageLayout,
        PBreadcrumbs,
        PPageTitle,
        PCard,
        PI,
    },
    setup() {
        const state = reactive({
            cardData: [],
            orderedCardData: computed(() => state.cardData.sort((a, b) => a.order - b.order)),
            isEditMode: false,
            // cardHeaderStyle: computed(() => state.isEditMode ? )
        });
        const routeState = reactive({
            routes: computed(() => ([
            ])),
        });

        const changeOrder = (targetData, clickedData, tempOrder) => {
            if (targetData.order < clickedData.order) {
                targetData.order = tempOrder;
                clickedData.order = tempOrder - 1;
            } else {
                targetData.order = tempOrder;
                clickedData.order = tempOrder + 1;
            }
        };

        const onClickUpButton = async (data) => {
            const tempCardData = [...state.cardData];
            const tempOrder = data.order;
            try {
                changeOrder(tempCardData[data.order - 2], tempCardData[data.order - 1], tempOrder);
                await SpaceConnector.client.monitoring.eventRule.changeOrder({
                    event_rule_id: data.event_rule_id,
                    order: tempOrder - 1,
                });
            } catch (e) {
                changeOrder(tempCardData[data.order], tempCardData[data.order - 1], tempOrder);
            } finally {
                state.cardData = tempCardData;
            }
        };

        const onClickDownButton = async (data) => {
            const tempCardData = [...state.cardData];
            const tempOrder = data.order;
            try {
                changeOrder(tempCardData[data.order], tempCardData[data.order - 1], tempOrder);
                await SpaceConnector.client.monitoring.eventRule.changeOrder({
                    event_rule_id: data.event_rule_id,
                    order: tempOrder + 1,
                });
                state.cardData = tempCardData;
            } catch (e) {
                changeOrder(tempCardData[data.order - 2], tempCardData[data.order - 1], tempOrder);
            } finally {
                state.cardData = tempCardData;
            }
        };

        const listEventRule = async () => {
            const res = await SpaceConnector.client.monitoring.eventRule.list();
            state.cardData = res.results;
        };

        (async () => {
            await listEventRule();
        })();


        return {
            ...toRefs(state),
            routeState,
            onClickUpButton,
            onClickDownButton,
        };
    },
};
</script>

<style lang="postcss" scoped>
.card-list-wrapper {
    display: flex;
    flex-direction: column;
}
.card {
    margin-bottom: 1rem;
}
.arrow-button {
    @apply cursor-pointer text-gray-800;
    &.disabled {
        @apply pointer-events-none cursor-not-allowed text-gray-200;
    }
}
</style>
