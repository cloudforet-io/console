<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PHeadingLayout, PTab, PHeading, PDefinitionTable, PStatus,
} from '@cloudforet/mirinae';
import type { DefinitionField } from '@cloudforet/mirinae/types/data-display/tables/definition-table/type';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';

import { i18n } from '@/translations';

import { webhookStateFormatter } from '@/services/alert-manager-v2/composables/refined-table-data';
import {
    NOTIFICATIONS_DETAIL_TABS,
} from '@/services/alert-manager-v2/constants/common-constant';
import type { WebhookDetailTabsType } from '@/services/alert-manager-v2/types/alert-manager-type';

interface Props {
    // TODO: add type
    selectedNotifications?: any
}

const props = withDefaults(defineProps<Props>(), {
    selectedNotifications: undefined,
});

const tabState = reactive({
    notificationsDetailTabs: computed<TabItem[]>(() => ([
        { label: i18n.t('ALERT_MANAGER.ALERTS.DETAILS'), name: NOTIFICATIONS_DETAIL_TABS.DETAIL },
    ])),
    activeNotificationsDetailTab: NOTIFICATIONS_DETAIL_TABS.DETAIL as WebhookDetailTabsType,
});
const tableState = reactive({
    definitionFields: computed<DefinitionField[]>(() => [
        { label: 'Name', name: 'name' },
        { label: 'Channel', name: 'channel' },
        { label: 'State', name: 'state' },
        { label: 'Member', name: 'member' },
        { label: 'Schedule', name: 'schedule' },
    ]),
});
</script>

<template>
    <p-tab :tabs="tabState.notificationsDetailTabs"
           :active-tab.sync="tabState.activeNotificationsDetailTab"
           class="service-detail-tabs-webhook-detail-tabs"
    >
        <template #detail>
            <p-heading-layout>
                <template #heading>
                    <p-heading class="pt-8 px-4 pb-4"
                               heading-type="sub"
                               :title="$t('ALERT_MANAGER.WEBHOOK.BASE_INFO_TITLE')"
                    />
                </template>
            </p-heading-layout>
            <p-definition-table :fields="tableState.definitionFields"
                                :data="props.selectedNotifications"
                                :skeleton-rows="4"
                                block
            >
                <template #data-state="{data}">
                    <p-status class="capitalize"
                              v-bind="webhookStateFormatter(data)"
                    />
                </template>
            </p-definition-table>
        </template>
    </p-tab>
</template>

<style scoped lang="postcss">
.service-detail-tabs-webhook-detail-tabs {
    .col-type {
        display: inline-flex;
        align-items: center;
        .name {
            margin-top: -0.125rem;
        }
    }
}
</style>
