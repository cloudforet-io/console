<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router/composables';
import type { RawLocation } from 'vue-router/types/router';

import dayjs from 'dayjs';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PToolboxTable, PSelectDropdown, PLink, PBadge, PI, PSelectStatus, PDivider,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem, AutocompleteHandler } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';
import type { ValueHandlerMap } from '@cloudforet/mirinae/types/controls/search/query-search/type';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';
import { iso8601Formatter } from '@cloudforet/utils';

import type { ExportParameter } from '@/api-clients/_common/schema/api-verbs/export';
import { QueryType } from '@/api-clients/_common/schema/api-verbs/export';
import { ALERT_STATUS, ALERT_URGENCY } from '@/schema/alert-manager/alert/constants';
import type { AlertModel } from '@/schema/alert-manager/alert/model';
import type { CloudServiceGetParameters } from '@/schema/inventory/cloud-service/api-verbs/get';
import type { CloudServiceModel } from '@/schema/inventory/cloud-service/model';
import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { AppReferenceMap } from '@/store/reference/app-reference-store';
import type { ServiceReferenceMap } from '@/store/reference/service-reference-store';
import type { WebhookReferenceMap } from '@/store/reference/webhook-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { downloadExcelByExportFetcher } from '@/lib/helper/file-download-helper';
import { replaceUrlQuery } from '@/lib/router-query-string';

import CustomDateModal from '@/common/components/custom-date-modal/CustomDateModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useQueryTags } from '@/common/composables/query-tags';
import CustomFieldModal from '@/common/modules/custom-table/custom-field-modal/CustomFieldModal.vue';

import { gray, red } from '@/styles/colors';

import {
    alertStatusBadgeStyleTypeFormatter, calculateTime,
    getAlertStateI18n,
    getAlertUrgencyI18n,
    makeTriggeredValueHandler,
} from '@/services/alert-manager/v2/composables/alert-table-data';
import {
    ALERT_EXCEL_FIELDS,
    ALERT_MANAGEMENT_TABLE_FIELDS,
    ALERT_MANAGEMENT_TABLE_HANDLER,
    ALERT_STATUS_FILTERS, ALERT_PERIOD_DROPDOWN_MENU,
} from '@/services/alert-manager/v2/constants/alert-table-constant';
import {
    convertRelativePeriodToPeriod,
} from '@/services/alert-manager/v2/helpers/alert-period-helper';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/v2/routes/route-constant';
import { useAlertPageStore } from '@/services/alert-manager/v2/stores/alert-page-store';
import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';
import type {
    AlertFilterType, AlertPeriodItemType,
    AlertPeriodDropdownMenuType,
    Period,
} from '@/services/alert-manager/v2/types/alert-manager-type';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const alertPageStore = useAlertPageStore();
const alertPageState = alertPageStore.state;
const alertPageGetters = alertPageStore.getters;
const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageState = serviceDetailPageStore.state;
const userStore = useUserStore();
const userState = userStore.state;
const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceGetters = userWorkspaceStore.getters;

const route = useRoute();
const router = useRouter();

const storeState = reactive({
    webhook: computed<WebhookReferenceMap>(() => allReferenceGetters.webhook),
    app: computed<AppReferenceMap>(() => allReferenceGetters.app),
    serviceList: computed<ServiceReferenceMap>(() => allReferenceGetters.service),
    serviceId: computed<string>(() => serviceDetailPageState.serviceInfo?.service_id),
    totalCount: computed<number>(() => alertPageState.totalAlertCount),
    alertList: computed<AlertModel[]>(() => alertPageState.alertList),
    selectedServiceId: computed<string>(() => alertPageState.selectedServiceId),
    selectedStatus: computed<string>(() => alertPageState.selectedStatus),
    selectedUrgency: computed<string>(() => alertPageState.selectedUrgency),
    selectedLabels: computed<SelectDropdownMenuItem[]>(() => alertPageState.selectedLabels),
    selectedSearchFilter: computed<string[]|undefined>(() => alertPageState.selectedSearchFilter),
    period: computed<Period>(() => alertPageState.selectedPeriod),
    selectedPeriodRange: computed<string>(() => alertPageState.selectedPeriodRange),
    timezone: computed<string>(() => userState.timezone || ''),
    currentWorkspaceId: computed<string>(() => userWorkspaceGetters.currentWorkspaceId || ''),
});
const state = reactive({
    loading: false,
    visibleCustomFieldModal: false,
    isServicePage: computed<boolean>(() => route.name === ALERT_MANAGER_ROUTE.SERVICE.DETAIL._NAME),

    refinedAlertList: computed<AlertModel[]>(() => storeState.alertList.map((alert) => ({
        ...alert,
        duration: alert.status === ALERT_STATUS.RESOLVED
            ? calculateTime(alert?.resolved_at, storeState.timezone)
            : calculateTime(alert?.created_at, storeState.timezone),
        created_at: iso8601Formatter(alert.created_at, storeState.timezone),
        resolved_at: iso8601Formatter(alert.resolved_at, storeState.timezone) || '-',
    }))),
    alertStateLabels: getAlertStateI18n(),
    urgencyLabels: getAlertUrgencyI18n(),
    defaultFields: computed<DataTableFieldType[]>(() => (state.isServicePage ? ALERT_MANAGEMENT_TABLE_FIELDS : [{ name: 'service_id', label: 'Service' }, ...ALERT_MANAGEMENT_TABLE_FIELDS])),
    fields: route.name === ALERT_MANAGER_ROUTE.SERVICE.DETAIL._NAME ? ALERT_MANAGEMENT_TABLE_FIELDS : [{ name: 'service_id', label: 'Service' }, ...ALERT_MANAGEMENT_TABLE_FIELDS],
    customRangeModalVisible: false,
    tableHandler: computed<ValueHandlerMap>(() => ({
        ...ALERT_MANAGEMENT_TABLE_HANDLER.valueHandlerMap,
        triggered_by: makeTriggeredValueHandler({
            webhooks: storeState.webhook,
            apps: storeState.app,
        }),
    })),
});
const filterState = reactive({
    urgencyFields: computed<SelectDropdownMenuItem[]>(() => ([
        { label: i18n.t('ALERT_MANAGER.ALERTS.ALL'), name: 'ALL' },
        { label: i18n.t('ALERT_MANAGER.ALERTS.HIGH'), name: ALERT_URGENCY.HIGH },
        { label: i18n.t('ALERT_MANAGER.ALERTS.LOW'), name: ALERT_URGENCY.LOW },
    ])),
    periodMenuItems: computed<AlertPeriodItemType[]>(() => [
        {
            type: 'item',
            name: 'ALL',
            label: i18n.t('ALERT_MANAGER.ALERTS.ALL'),
        },
        {
            name: ALERT_PERIOD_DROPDOWN_MENU.LAST_1_MONTH,
            relativePeriod: { value: 1 },
            label: i18n.t('ALERT_MANAGER.ALERTS.LAST_1_MONTHS'),
        },
        {
            name: ALERT_PERIOD_DROPDOWN_MENU.LAST_3_MONTHS,
            relativePeriod: { value: 3 },
            label: i18n.t('ALERT_MANAGER.ALERTS.LAST_3_MONTHS'),
        },
        {
            name: ALERT_PERIOD_DROPDOWN_MENU.LAST_6_MONTHS,
            relativePeriod: { value: 6 },
            label: i18n.t('ALERT_MANAGER.ALERTS.LAST_6_MONTHS'),
        },
        {
            name: ALERT_PERIOD_DROPDOWN_MENU.LAST_12_MONTHS,
            relativePeriod: { value: 12 },
            label: i18n.t('ALERT_MANAGER.ALERTS.LAST_12_MONTHS'),
        },
        {
            type: 'divider',
        }, {
            type: 'item',
            name: ALERT_PERIOD_DROPDOWN_MENU.CUSTOM,
            label: i18n.t('ALERT_MANAGER.ALERTS.CUSTOM'),
        },
    ]),
    isPeriodInvalid: computed<boolean>(() => {
        const now = dayjs().utc();
        const checkPeriod = (limit:number):{isStartInvalid:boolean, isEndInvalid:boolean} => {
            const isStartInvalid = now.diff(storeState.period?.start, 'month') >= limit;
            const isEndInvalid = now.diff(storeState.period?.end, 'month') >= limit;
            return { isStartInvalid, isEndInvalid };
        };
        const LIMIT_MONTH = 36;
        const { isStartInvalid, isEndInvalid } = checkPeriod(LIMIT_MONTH);
        return isStartInvalid || isEndInvalid;
    }),
    showPeriodBadge: computed<boolean>(() => storeState.selectedPeriodRange === ALERT_PERIOD_DROPDOWN_MENU.CUSTOM && storeState.period?.start && storeState.period?.end),
    serviceDropdownList: computed<SelectDropdownMenuItem[]>(() => alertPageGetters.serviceDropdownList),
    statusFields: computed<AlertFilterType[]>(() => ([
        { label: i18n.t('ALERT_MANAGER.ALERTS.OPEN'), name: ALERT_STATUS_FILTERS.OPEN },
        { label: i18n.t('ALERT_MANAGER.ALERTS.TRIGGERED'), name: ALERT_STATUS_FILTERS.TRIGGERED },
        { label: i18n.t('ALERT_MANAGER.ALERTS.ACKNOWLEDGED'), name: ALERT_STATUS_FILTERS.ACKNOWLEDGED },
        { label: i18n.t('ALERT_MANAGER.ALERTS.RESOLVED'), name: ALERT_STATUS_FILTERS.RESOLVED },
        { label: i18n.t('ALERT_MANAGER.ALERTS.IGNORED'), name: ALERT_STATUS_FILTERS.IGNORED },
        { label: i18n.t('ALERT_MANAGER.ALERTS.ALL'), name: 'ALL' },
    ])),
});

const alertListApiQueryHelper = new ApiQueryHelper().setSort('created_at', true)
    .setPage(1, 15);

const filterQueryHelper = new QueryHelper();
const queryTagHelper = useQueryTags({ keyItemSets: ALERT_MANAGEMENT_TABLE_HANDLER.keyItemSets });
const { queryTags } = queryTagHelper;


const labelMenuItemsHandler = (): AutocompleteHandler => async (inputText: string, pageStart = 1, pageLimit = 10) => {
    try {
        const { results } = await SpaceConnector.client.addOns.autocomplete.distinct({
            resource_type: 'alert_manager.Alert',
            options: { limit: pageLimit },
            distinct_key: 'labels',
        });
        const refinedMenuItems = (results ?? []).map((i) => ({
            label: i.name,
            name: i.key,
        }));
        const totalCount = pageStart - 1 + Number(pageLimit);
        const slicedResults = refinedMenuItems?.slice(pageStart - 1, totalCount);

        return {
            results: slicedResults,
            more: totalCount < refinedMenuItems.length,
        };
    } catch (e) {
        ErrorHandler.handleError(e);
        return {
            results: [],
            more: false,
        };
    }
};
const getCreatedByNames = (id: string): string => {
    if (id.includes('webhook')) {
        return storeState.webhook[id]?.label || id;
    }
    if (id.includes('app')) {
        return storeState.app[id]?.label || id;
    }
    return id;
};
const getServiceName = (id: string): TranslateResult => {
    if (filterState.serviceDropdownList.length === 0) return '';
    return filterState.serviceDropdownList.find((i) => i.name === id)?.label || '';
};
const handleSelectLabelsItem = async (value: SelectDropdownMenuItem[]) => {
    await alertPageStore.setSelectedLabels(value[0]?.name);
    await replaceUrlQuery('labels', value[0]?.name);
    fetchAlertsList();
};
const handleSelectServiceDropdownItem = async (id: string) => {
    await alertPageStore.setSelectedServiceId(id);
    await replaceUrlQuery('serviceId', id);
    await fetchAlertsList();
};
const handleSelectFilter = async (type: 'status' | 'urgency', value: string) => {
    if (type === 'status') {
        await alertPageStore.setSelectedStatus(value);
        await replaceUrlQuery('status', value);
    } else {
        await alertPageStore.setSelectedUrgency(value);
        await replaceUrlQuery('urgency', value);
    }
    await fetchAlertsList();
};
const handleSelectPeriod = async (periodMenuName: AlertPeriodDropdownMenuType) => {
    if (periodMenuName === ALERT_PERIOD_DROPDOWN_MENU.CUSTOM) {
        state.customRangeModalVisible = true;
        return;
    }
    if (periodMenuName === ALERT_PERIOD_DROPDOWN_MENU.ALL) {
        alertPageStore.setSelectedPeriod({ start: undefined, end: undefined });
    }
    const selectedPeriodItem = filterState.periodMenuItems.find((d) => d.name === periodMenuName) || {} as AlertPeriodItemType;
    alertPageStore.setSelectedPeriodRange(periodMenuName);
    alertPageStore.setSelectedPeriod(selectedPeriodItem.relativePeriod ? convertRelativePeriodToPeriod(selectedPeriodItem.relativePeriod) : storeState.period);
    replaceUrlQuery({
        range: periodMenuName,
        period: undefined,
    });

    await fetchAlertsList();
};
const handleChange = async (options: any = {}) => {
    if (options.sortBy !== undefined) alertListApiQueryHelper.setSort(options.sortBy, options.sortDesc);
    if (options.queryTags !== undefined) {
        queryTagHelper.setQueryTags(options.queryTags);
        await replaceUrlQuery('filters', queryTagHelper.getURLQueryStringFilters());
        await alertPageStore.setSelectedSearchFilter(queryTagHelper.getURLQueryStringFilters());
    }
    if (options.pageStart !== undefined) alertListApiQueryHelper.setPageStart(options.pageStart);
    if (options.pageLimit !== undefined) alertListApiQueryHelper.setPageLimit(options.pageLimit);
    await fetchAlertsList();
};
const handleClickSettings = () => {
    state.visibleCustomFieldModal = true;
};
const handleVisibleCustomFieldModal = (visible) => {
    state.visibleCustomFieldModal = visible;
};
const handleCustomFieldUpdate = (fields: DataTableFieldType[]) => {
    state.fields = fields;
};
const handleExportToExcel = async () => {
    const excelQuery = new ApiQueryHelper()
        .setMultiSortV2([{ key: 'created_at', desc: true }])
        .setFilters([...filterQueryHelper.filters]);
    const excelExportFetcher = () => {
        const alertExcelExportParams: ExportParameter = {
            file_name: 'alert_export',
            options: [
                {
                    name: 'Main Table',
                    query_type: QueryType.SEARCH,
                    search_query: {
                        ...excelQuery.data,
                        fields: ALERT_EXCEL_FIELDS,
                    },
                },
            ],
            timezone: state.timezone,
        };
        return SpaceConnector.clientV2.alertManager.alert.export(alertExcelExportParams);
    };
    await downloadExcelByExportFetcher(excelExportFetcher);
};
const handleCustomRangeModalConfirm = (start: string, end: string) => {
    alertPageStore.setSelectedPeriodRange(ALERT_PERIOD_DROPDOWN_MENU.CUSTOM);
    alertPageStore.setSelectedPeriod({ start, end });
    state.customRangeModalVisible = false;
    replaceUrlQuery('period', `start=${start}&end=${end}`);
    replaceUrlQuery('range', ALERT_PERIOD_DROPDOWN_MENU.CUSTOM);
    fetchAlertsList();
};
const createRouteParams = (params: {
    provider: string;
    group: string;
    name: string;
    id: string;
}): RawLocation => {
    const queryHelper = new QueryHelper();
    return {
        name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
        params: {
            provider: params.provider,
            group: params.group,
            name: params.name,
            workspaceId: storeState.currentWorkspaceId || '',
        },
        query: {
            filters: queryHelper.setFilters([
                { k: 'cloud_service_id', v: params.id, o: '=' },
            ]).rawQueryStrings,
        },
    };
};

const handleRouteViewButton = async (id: string, type?: string) => {
    const [provider, group, name] = type?.split('.') || [];

    if (!type && !id) {
        console.warn('Invalid parameters: both id and type are missing');
        return;
    }

    try {
        const routeParams = type ? {
            provider, group, name, id,
        } : await (async () => {
            const response = await SpaceConnector.clientV2.inventory.cloudService.get<CloudServiceGetParameters, CloudServiceModel>({
                cloud_service_id: id,
            });
            return {
                provider: response.provider,
                group: response.cloud_service_group,
                name: response.cloud_service_type,
                id: response.cloud_service_id,
            };
        })();

        window.open(router.resolve(createRouteParams(routeParams)).href, '_blank');
    } catch (e) {
        if (!type) {
            ErrorHandler.handleError(e, true);
            return;
        }
        window.open(router.resolve(createRouteParams({
            provider, group, name, id,
        })).href, '_blank');
    }
};
const fetchAlertsList = async () => {
    state.loading = true;
    try {
        filterQueryHelper.setFilters([]);
        if (storeState.selectedUrgency !== 'ALL') {
            filterQueryHelper.addFilter({ k: 'urgency', v: storeState.selectedUrgency, o: '=' });
        }
        if (storeState.selectedStatus === ALERT_STATUS_FILTERS.OPEN) {
            filterQueryHelper.addFilter({ k: 'status', v: [ALERT_STATUS_FILTERS.TRIGGERED, ALERT_STATUS_FILTERS.ACKNOWLEDGED], o: '=' });
        } else if (storeState.selectedStatus !== 'ALL') {
            filterQueryHelper.addFilter({ k: 'status', v: storeState.selectedStatus, o: '=' });
        }
        if (storeState.selectedLabels?.length > 0) {
            filterQueryHelper.addFilter({ k: 'labels', v: storeState.selectedLabels.map((i) => i.name), o: '=' });
        }

        if (storeState.period.start && storeState.period.end && (storeState.period.start === storeState.period.end)) {
            filterQueryHelper.addFilter({ k: 'created_at', v: storeState.period.start, o: '>=' });
        } else {
            if (storeState.period.start) {
                filterQueryHelper.addFilter({ k: 'created_at', v: storeState.period.start, o: '>=' });
            }
            if (storeState.period.end) {
                filterQueryHelper.addFilter({ k: 'created_at', v: storeState.period.end, o: '<=' });
            }
        }

        if (state.isServicePage) {
            filterQueryHelper.addFilter({ k: 'service_id', v: storeState.serviceId, o: '=' });
        } else if (storeState.selectedServiceId) {
            filterQueryHelper.addFilter({ k: 'service_id', v: storeState.selectedServiceId, o: '=' });
        }

        alertListApiQueryHelper.setFilters([
            ...queryTagHelper.filters.value,
            ...filterQueryHelper.filters,
        ]);

        const params = {
            query: alertListApiQueryHelper.data,
        };
        await alertPageStore.setAlertListQuery(alertListApiQueryHelper.data);
        await alertPageStore.fetchAlertsList(params);
    } catch (e) {
        ErrorHandler.handleError(e, true);
    } finally {
        state.loading = false;
    }
};

watch(() => storeState.serviceId, async (serviceId) => {
    if (state.isServicePage && serviceId) {
        await alertPageStore.setSelectedServiceId(serviceId);
        await fetchAlertsList();
    }
});

(async () => {
    const {
        serviceId, status, urgency, filters, labels, period, range,
    } = route.query;
    if (!state.isServicePage) {
        await alertPageStore.setSelectedServiceId(serviceId as string);
    }
    await alertPageStore.setSelectedStatus(status as string || 'OPEN');
    await alertPageStore.setSelectedUrgency(urgency as string || 'ALL');
    await alertPageStore.setSelectedLabels(labels as string);

    const params = new URLSearchParams(period as string);

    alertPageStore.setSelectedPeriodRange(range as string || ALERT_PERIOD_DROPDOWN_MENU.ALL);
    if (range === ALERT_PERIOD_DROPDOWN_MENU.CUSTOM) {
        await alertPageStore.setSelectedPeriod({
            start: params.get('start') || undefined,
            end: params.get('end') || undefined,
        });
    } else {
        const selectedPeriodItem = filterState.periodMenuItems.find((d) => d.name === range) || {} as AlertPeriodItemType;
        alertPageStore.setSelectedPeriod(selectedPeriodItem.relativePeriod ? convertRelativePeriodToPeriod(selectedPeriodItem.relativePeriod) : storeState.period);
    }

    if (filters) {
        await queryTagHelper.setURLQueryStringFilters(route.query.filters);
    }

    await fetchAlertsList();
})();
</script>

<template>
    <div class="alert-data-table">
        <p-toolbox-table searchable
                         sortable
                         exportable
                         search-type="query"
                         sort-by="created_at"
                         class="toolbox pb-10"
                         :class="{'is-service-page': state.isServicePage}"
                         :sort-desc="true"
                         :query-tags="queryTags"
                         :loading="state.loading"
                         :total-count="storeState.totalCount"
                         :fields="state.fields"
                         :items="state.refinedAlertList"
                         :key-item-sets="ALERT_MANAGEMENT_TABLE_HANDLER.keyItemSets"
                         :value-handler-map="state.tableHandler"
                         settings-visible
                         @change="handleChange"
                         @click-settings="handleClickSettings"
                         @refresh="fetchAlertsList"
                         @export="handleExportToExcel"
        >
            <template v-if="!state.isServicePage"
                      #toolbox-top
            >
                <div class="filter-wrapper flex items-center gap-2 mt-6 ml-4">
                    <p-select-dropdown :menu="filterState.urgencyFields"
                                       :selection-label="$t('ALERT_MANAGER.ALERTS.LABEL_URGENCY')"
                                       style-type="rounded"
                                       use-fixed-menu-style
                                       :selected="storeState.selectedUrgency"
                                       class="service-dropdown"
                                       @update:selected="handleSelectFilter('urgency', $event)"
                    >
                        <template #menu-item--format="{ item }">
                            <p-i v-if="item.name !== 'ALL'"
                                 :name="item.name === ALERT_URGENCY.HIGH ? 'ic_error-filled' : 'ic_warning-filled'"
                                 width="1em"
                                 height="1em"
                                 class="mr-1"
                                 :color="item.name === ALERT_URGENCY.HIGH ? red[400] : gray[200]"
                            />
                            <span>{{ item.label }}</span>
                        </template>
                    </p-select-dropdown>
                    <div>
                        <p-select-dropdown :menu="filterState.periodMenuItems"
                                           :selection-label="$t('ALERT_MANAGER.ALERTS.PERIOD')"
                                           disable-proxy
                                           style-type="rounded"
                                           use-fixed-menu-style
                                           :selected="storeState.selectedPeriodRange"
                                           :invalid="filterState.isPeriodInvalid"
                                           @select="handleSelectPeriod"
                        />
                        <p-badge v-if="filterState.showPeriodBadge"
                                 badge-type="subtle"
                                 style-type="gray200"
                                 class="ml-2"
                        >
                            {{ `${dayjs.utc(storeState.period.start).format('MMM D, YYYY')} ~ ${dayjs.utc(storeState.period.end).format('MMM D, YYYY')}` }}
                        </p-badge>
                    </div>
                    <p-divider vertical
                               class="divider"
                    />
                    <p-select-dropdown :menu="filterState.serviceDropdownList"
                                       :selection-label="$t('ALERT_MANAGER.ALERTS.SERVICE')"
                                       style-type="rounded"
                                       show-delete-all-button
                                       selection-highlight
                                       use-fixed-menu-style
                                       :selected="storeState.selectedServiceId"
                                       class="service-dropdown"
                                       @update:selected="handleSelectServiceDropdownItem"
                    />
                    <p-select-dropdown :selection-label="$t('ALERT_MANAGER.ALERTS.LABEL')"
                                       :handler="labelMenuItemsHandler()"
                                       style-type="rounded"
                                       show-delete-all-button
                                       selection-highlight
                                       use-fixed-menu-style
                                       :selected="storeState.selectedLabels"
                                       class="service-dropdown"
                                       @update:selected="handleSelectLabelsItem"
                    />
                </div>
            </template>
            <template #toolbox-bottom>
                <div class="quick-filter-wrapper flex flex-col mr-4 mb-4 ml-4 gap-2">
                    <div class="status-filter-wrapper">
                        <span class="label">{{ $t('ALERT_MANAGER.STATUS') }}</span>
                        <p-divider class="divider"
                                   vertical
                        />
                        <p-select-status v-for="(item, idx) in filterState.statusFields"
                                         :key="idx"
                                         :selected="storeState.selectedStatus"
                                         :value="item.name"
                                         class="status"
                                         @change="handleSelectFilter('status', item.name)"
                        >
                            {{ item.label }}
                        </p-select-status>
                    </div>
                </div>
            </template>
            <template #col-service_id-format="{ value }">
                <template v-if="value">
                    <span>{{ getServiceName(value) }}</span>
                </template>
            </template>
            <template #col-title-format="{ value, item }">
                <template v-if="value">
                    <p-link highlight
                            :to="{
                                name: ALERT_MANAGER_ROUTE.ALERTS.DETAIL._NAME,
                                params: {
                                    alertId: item.alert_id,
                                    serviceId: state.isServicePage ? storeState.serviceId : undefined,
                                }
                            }"
                    >
                        <span class="title-link">{{ value }}</span>
                    </p-link>
                </template>
            </template>
            <template #col-status-format="{ value }">
                <p-badge :style-type="alertStatusBadgeStyleTypeFormatter(value)"
                         :badge-type="value === ALERT_STATUS.TRIGGERED ? 'solid' : 'subtle'"
                >
                    {{ state.alertStateLabels[value] }}
                </p-badge>
            </template>
            <template #col-urgency-format="{ value }">
                <p-i :name="value === ALERT_URGENCY.HIGH ? 'ic_error-filled' : 'ic_warning-filled'"
                     width="1em"
                     height="1em"
                     class="mr-1"
                     :color="value === ALERT_URGENCY.HIGH ? red[400] : gray[200]"
                />
                <span>{{ state.urgencyLabels[value] }}</span>
            </template>
            <template #col-labels-format="{ value }">
                <div class="flex gap-2">
                    <p-badge v-for="(item, idx) in value?.slice(0, 3)"
                             :key="`labels-${idx}`"
                             badge-type="subtle"
                             style-type="gray200"
                             shape="square"
                             class="label-item"
                    >
                        <span>{{ item }}</span>
                    </p-badge>
                    <p-badge v-if="value?.length > 3"
                             badge-type="subtle"
                             style-type="blue200"
                    >
                        <span>+ {{ value?.length - 3 }}</span>
                    </p-badge>
                </div>
            </template>
            <template #col-triggered_by-format="{ value }">
                <span>{{ getCreatedByNames(value) }}</span>
            </template>
            <template #col-resources-format="{ value }">
                <div v-for="(item, idx) in value"
                     :key="`resource-item-${idx}`"
                >
                    <component :is="item.asset_id ? PLink : 'p'"
                               class="resource-item"
                               :class="{ 'link': item.asset_id }"
                               @click="item.asset_id ? handleRouteViewButton(item.asset_id, item.asset_type) : null"
                    >
                        <span class="flex items-center">
                            <span class="text inline-block truncate">{{ item?.name }}</span>
                            <p-i v-if="item.asset_id"
                                 name="ic_arrow-right-up"
                                 class="ml-0.5"
                                 height="0.875rem"
                                 width="0.875rem"
                                 color="inherit"
                            />
                        </span>
                    </component>
                </div>
            </template>
        </p-toolbox-table>
        <custom-field-modal :visible="state.visibleCustomFieldModal"
                            :resource-type="state.isServicePage ? 'service.alert' : 'alertManager.alert'"
                            :default-field="state.defaultFields"
                            @update:visible="handleVisibleCustomFieldModal"
                            @complete="fetchAlertsList"
                            @custom-field-loaded="handleCustomFieldUpdate"
        />
        <custom-date-modal :visible.sync="state.customRangeModalVisible"
                           :start="storeState.period?.start"
                           :end="storeState.period?.end"
                           :datetime-picker-data-type="'yearToDate'"
                           use-restricted-mode
                           @confirm="handleCustomRangeModalConfirm"
        />
    </div>
</template>

<style scoped lang="postcss">
.alert-data-table {
    .toolbox {
        border-radius: 0.375rem;
        &.is-service-page {
            border: none;
        }
    }
    .label-item {
        @apply truncate;
        max-width: 9.875rem;
    }
    .filter-wrapper {
        .divider {
            height: 1.375rem;
        }
        .service-dropdown {
            width: max-content;
        }
    }
    .quick-filter-wrapper {
        .status-filter-wrapper {
            @apply flex items-center flex-wrap text-label-sm;
            gap: 0.75rem;
            padding-top: 0.125rem;
            padding-bottom: 0.125rem;
            .label {
                @apply font-bold;
            }
            .divider {
                height: 1rem;
                padding-top: 0.25rem;
                padding-bottom: 0.25rem;
            }
            .status {
                @apply text-label-md;
            }
        }

        @screen mobile {
            gap: 1rem;
            .status-filter-wrapper {
                margin-top: 0;
                .divider {
                    padding-top: 0;
                    padding-bottom: 0;
                }
            }
        }
    }
    .resource-item {
        .text {
            max-width: 20rem;
        }
        &.link {
            @apply text-secondary truncate cursor-pointer;
        }
    }
}
</style>
