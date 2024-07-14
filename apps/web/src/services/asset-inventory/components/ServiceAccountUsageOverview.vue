<script setup lang="ts">
import { computed, reactive } from 'vue';

import { sum, values } from 'lodash';

import {
    PPaneLayout, PHeading, PDefinitionTable, PI, PLink, PStatus, PTooltip,
} from '@cloudforet/mirinae';
import type { DefinitionField } from '@cloudforet/mirinae/src/data-display/tables/definition-table/type';
import { numberFormatter } from '@cloudforet/utils';

import type { ServiceAccountModel } from '@/schema/identity/service-account/model';
import type { TrustedAccountModel } from '@/schema/identity/trusted-account/model';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { CURRENCY_SYMBOL } from '@/store/modules/settings/config';
import type { Currency } from '@/store/modules/settings/type';

import { gray, indigo } from '@/styles/colors';

import { stateFormatter } from '@/services/asset-inventory/helpers/dynamic-ui-schema-generator';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useServiceAccountPageStore } from '@/services/asset-inventory/stores/service-account-page-store';
import { useCostReportPageStore } from '@/services/cost-explorer/stores/cost-report-page-store';

interface Props {
    serviceAccountLoading: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    serviceAccountLoading: false,
});

const serviceAccountPageStore = useServiceAccountPageStore();
const serviceAccountPageState = serviceAccountPageStore.state;
const costReportPageStore = useCostReportPageStore();
const constReportPageGetters = costReportPageStore.getters;

const storeState = reactive({
    currency: computed<Currency|undefined>(() => constReportPageGetters.currency),
    item: computed<Partial<TrustedAccountModel & ServiceAccountModel>>(() => serviceAccountPageState.originServiceAccountItem),
});
const tableState = reactive({
    fields: computed<DefinitionField[]>(() => [
        { name: 'state', label: 'State', disableCopy: true },
        { name: 'cost_info', label: 'Cost', disableCopy: true },
        { name: 'asset_info', label: 'Asset Total Count', disableCopy: true },
        { name: 'asset_info.server', label: 'Server Count', disableCopy: true },
        { name: 'asset_info.database', label: 'Database Count', disableCopy: true },
        { name: 'asset_info.storage', label: 'Storage Size', disableCopy: true },
    ]),
});
</script>

<template>
    <p-pane-layout class="service-account-usage-overview">
        <p-heading heading-type="sub"
                   :title="$t('IDENTITY.SERVICE_ACCOUNT.MAIN.USAGE_OVERVIEW')"
                   class="heading"
        />
        <div class="content-wrapper">
            <div v-if="storeState.item.is_managed"
                 class="managed-banner"
            >
                <p-i name="ic_info-circle"
                     width="1.25rem"
                     height="1.25rem"
                     :color="indigo[500]"
                />
                <span>{{ $t('IDENTITY.SERVICE_ACCOUNT.MAIN.MANAGED_INFO') }}</span>
                <p-link :text="$t('IDENTITY.SERVICE_ACCOUNT.MAIN.VIEW_IN_ADMIN_MODE')"
                        action-icon="internal-link"
                        new-tab
                        highlight
                        :to="{
                            name: makeAdminRouteName(ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT.DETAIL._NAME),
                            params: { serviceAccountId: storeState.item.service_account_id }
                        }"
                />
            </div>
            <p-definition-table :fields="tableState.fields"
                                :data="storeState.item"
                                :loading="props.serviceAccountLoading"
                                :skeleton-rows="6"
                                style-type="white"
                                class="data-source-definition-table"
                                v-on="$listeners"
            >
                <template #data-state="{value}">
                    <p-status v-bind="stateFormatter(value)"
                              class="capitalize"
                    />
                </template>
                <template #key="{index}">
                    <div v-if="index === 1"
                         class="th-tooltip"
                    >
                        <span>{{ tableState.fields[index].label }}</span>
                        <p-tooltip
                            :contents="$t('IDENTITY.SERVICE_ACCOUNT.TOOLTIP_COST')"
                            position="bottom"
                            class="tooltip-wrapper"
                        >
                            <p-i name="ic_info-circle"
                                 class="title-tooltip"
                                 height="1rem"
                                 width="1rem"
                                 :color="gray[500]"
                            />
                        </p-tooltip>
                    </div>
                </template>
                <template #data-cost_info="{value}">
                    <p-link action-icon="internal-link"
                            new-tab
                    >
                        <span>{{ CURRENCY_SYMBOL[storeState.currency] }}</span>
                        {{ numberFormatter(value?.month) || 0 }}
                    </p-link>
                </template>
                <template #data-asset_info="{value}">
                    <p-link action-icon="internal-link"
                            :text="sum(values(value))"
                            new-tab
                    />
                </template>
                <template #data-asset_info.server="{value}">
                    <p-link action-icon="internal-link"
                            :text="value.server || 0"
                            new-tab
                    />
                </template>
                <template #data-asset_info.database="{value}">
                    <p-link action-icon="internal-link"
                            :text="value.database || 0"
                            new-tab
                    />
                </template>
                <template #data-asset_info.storage="{value}">
                    <p-link action-icon="internal-link"
                            :text="value.storage || 0"
                            new-tab
                    />
                </template>
            </p-definition-table>
        </div>
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.service-account-usage-overview {
    .heading {
        margin-bottom: 1.5rem;
    }
    .content-wrapper {
        @apply flex flex-col;
        padding-bottom: 2.5rem;
        gap: 1.5rem;
        .managed-banner {
            @apply flex bg-indigo-100 text-paragraph-md;
            padding: 0.5rem 1rem;
            margin-right: 1rem;
            margin-left: 1rem;
            border-radius: 0.25rem;
            gap: 0.25rem;
        }
    }
    .th-tooltip {
        @apply flex items-center;
        gap: 0.25rem;
        .tooltip-wrapper {
            margin-top: -0.125rem;
        }
    }
}
</style>
