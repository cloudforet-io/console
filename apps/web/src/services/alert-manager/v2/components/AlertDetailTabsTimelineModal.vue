<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PI,
    PButtonModal, PCodeEditor, PButton, PDataTable, PLazyImg, PSelectDropdown, PDivider, PSelectStatus,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import {
    ALERT_HISTORY_ACTION,
    ALERT_HISTORY_NOTIFICATION_STATE,
} from '@/schema/alert-manager/alert/constants';
import type { AlertHistoryModel, AlertModel } from '@/schema/alert-manager/alert/model';
import type { AlertHistoryActionType, AlertHistoryNotificationInfoType, AlertHistoryNotificationChannelInfoType } from '@/schema/alert-manager/alert/type';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';
import type { ServiceReferenceMap } from '@/store/reference/service-reference-store';
import type { UserGroupReferenceMap } from '@/store/reference/user-group-reference-store';
import type { UserReferenceMap } from '@/store/reference/user-reference-store';

import { assetUrlConverter } from '@/lib/helper/asset-helper';
import { copyAnyData } from '@/lib/helper/copy-helper';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import { useProxyValue } from '@/common/composables/proxy-state';

import { green, red } from '@/styles/colors';

import { ALERT_CHANNEL_TABLE_FIELDS } from '@/services/alert-manager/v2/constants/alert-table-constant';
import { useAlertDetailPageStore } from '@/services/alert-manager/v2/stores/alert-detail-page-store';
import type { AlertHistoryNotificationItemType } from '@/services/alert-manager/v2/types/alert-manager-type';

interface Props {
    visible: boolean;
    type: AlertHistoryActionType;
    history?: AlertHistoryModel;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    type: ALERT_HISTORY_ACTION.EVENT_PUSHED,
    history: undefined,
});

const TYPE = {
    SERVICE: 'service_channels',
    USER_GROUP: 'user_group_channels',
    USER: 'user_channels',
} as const;

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const alertDetailPageStore = useAlertDetailPageStore();
const alertDetailPageState = alertDetailPageStore.state;

const emit = defineEmits<{(event: 'update:visible', visible: boolean): void;
}>();

const storeState = reactive({
    pluginInfo: computed<PluginReferenceMap>(() => allReferenceGetters.plugin),
    service: computed<ServiceReferenceMap>(() => allReferenceGetters.service),
    userGroup: computed<UserGroupReferenceMap>(() => allReferenceGetters.user_group),
    user: computed<UserReferenceMap>(() => allReferenceGetters.user),
    alertInfo: computed<AlertModel>(() => alertDetailPageState.alertInfo),
});
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    typeFields: computed<SelectDropdownMenuItem[]>(() => ([
        { label: i18n.t('ALERT_MANAGER.ALERTS.ALL'), name: 'all' },
        { label: i18n.t('ALERT_MANAGER.SERVICE.TITLE'), name: TYPE.SERVICE },
        { label: i18n.t('ALERT_MANAGER.SERVICE.USER_GROUP'), name: TYPE.USER_GROUP },
        { label: i18n.t('ALERT_MANAGER.SERVICE.USER'), name: TYPE.USER },
    ])),
    selectedType: 'all',
    statusFields: computed<SelectDropdownMenuItem[]>(() => ([
        { label: i18n.t('ALERT_MANAGER.ALERTS.ALL'), name: 'all' },
        { label: i18n.t('COMMON.SUCCESS'), name: ALERT_HISTORY_NOTIFICATION_STATE.SUCCESS },
        { label: i18n.t('COMMON.FAILURE'), name: ALERT_HISTORY_NOTIFICATION_STATE.FAILURE },
    ])),
    selectedStatus: 'all',
    channelItem: computed<AlertHistoryNotificationItemType[]>(() => {
        const data = props.history?.notification_info as AlertHistoryNotificationInfoType;
        const channelTypes = [TYPE.SERVICE, TYPE.USER_GROUP, TYPE.USER];

        if (!data) return [];

        const refinedData = channelTypes.flatMap((type) => Object.entries(data[type] || {}).map(([name, channelInfo]) => {
            const info = channelInfo as AlertHistoryNotificationChannelInfoType;
            let target = '';
            if (type === TYPE.SERVICE) {
                target = storeState.service[storeState.alertInfo.service_id]?.label || storeState.alertInfo.service_id;
            } else if (type === TYPE.USER_GROUP) {
                target = storeState.userGroup[info.user_group_id || '']?.label || info.user_group_id;
            } else if (type === TYPE.USER) {
                target = storeState.user[info.user_id || '']?.label || info.user_id;
            }
            return {
                type,
                id: name,
                name: info.name || '',
                state: info.state || '',
                error_message: info.error_message,
                plugin_id: info.plugin_id,
                target,
            };
        }));
        return refinedData.filter((item) => {
            const matchesType = state.selectedType === 'all' || item.type === state.selectedType;
            const matchesStatus = state.selectedStatus === 'all' || item.state === state.selectedStatus;
            return matchesType && matchesStatus;
        });
    }),
});

const getFormattedErrorMessage = (message: string): string => message?.replace('. ', '.<br>');
const getChannelTypeName = (type: string) => {
    if (type === TYPE.SERVICE) return i18n.t('ALERT_MANAGER.SERVICE.TITLE');
    if (type === TYPE.USER_GROUP) return i18n.t('ALERT_MANAGER.SERVICE.USER_GROUP');
    if (type === TYPE.USER) return i18n.t('ALERT_MANAGER.SERVICE.USER');
    return '';
};

const handleSelectFilter = (value: string) => {
    state.selectedStatus = value;
};
const handleCloseModal = () => {
    state.proxyVisible = false;
};
const handleClickCopy = () => {
    copyAnyData(props.history);
    showSuccessMessage(i18n.t('ALERT_MANAGER.COPIED'), '');
};
</script>

<template>
    <p-button-modal :header-title="$t('ALERT_MANAGER.ALERTS.NOTIFICATION_RESULTS')"
                    size="lg"
                    hide-footer-close-button
                    :visible.sync="state.proxyVisible"
                    class="alert-detail-tabs-timeline-modal"
                    @confirm="handleCloseModal"
    >
        <template #body>
            <div>
                <div v-if="props.type === ALERT_HISTORY_ACTION.EVENT_PUSHED"
                     class="data-content"
                >
                    <p-code-editor :code="props.history"
                                   class="code-block"
                                   read-only
                                   folded
                    />
                </div>
                <div v-else>
                    <div class="filter-wrapper pb-4">
                        <p-select-dropdown :menu="state.typeFields"
                                           :selection-label="$t('ALERT_MANAGER.ALERTS.TYPE')"
                                           style-type="rounded"
                                           :selected.sync="state.selectedType"
                                           class="service-dropdown"
                        />
                        <p-divider class="divider"
                                   vertical
                        />
                        <div class="action-filter-wrapper">
                            <span class="font-bold">{{ $t('ALERT_MANAGER.ALERTS.LABEL_STATUS') }}</span>
                            <p-divider class="divider"
                                       vertical
                            />
                            <p-select-status v-for="(item, idx) in state.statusFields"
                                             :key="idx"
                                             :selected="state.selectedStatus"
                                             :value="item.name"
                                             class="text-gray-600"
                                             @change="handleSelectFilter(item.name)"
                            >
                                {{ item.label }}
                            </p-select-status>
                        </div>
                    </div>
                    <p-data-table :fields="ALERT_CHANNEL_TABLE_FIELDS"
                                  :items="state.channelItem"
                    >
                        <template #col-type-format="{value}">
                            {{ getChannelTypeName(value) }}
                        </template>
                        <template #col-name-format="{value, item}">
                            <div class="flex items-center gap-1">
                                <p-lazy-img :src="assetUrlConverter(storeState.pluginInfo[item.plugin_id]?.icon || '')"
                                            width="1rem"
                                            height="1rem"
                                />
                                <span>{{ value }}</span>
                            </div>
                        </template>
                        <template #col-state-format="{value}">
                            <p class="flex items-center gap-1">
                                <p-i v-if="value === ALERT_HISTORY_NOTIFICATION_STATE.FAILURE"
                                     name="ic_error-filled"
                                     :color="red[400]"
                                     width="1rem"
                                     height="1rem"
                                />
                                <p-i v-else
                                     name="ic_check"
                                     :color="green[600]"
                                     width="1rem"
                                     height="1rem"
                                />
                                <span>
                                    {{ value === ALERT_HISTORY_NOTIFICATION_STATE.FAILURE
                                        ? $t('ALERT_MANAGER.NOTIFICATIONS.FAILURE')
                                        : $t('COMMON.SUCCESS') }}
                                </span>
                            </p>
                        </template>
                        <template #col-error_message-format="{value}">
                            <p class="flex items-center gap-1 whitespace-pre-wrap"
                               v-html="getFormattedErrorMessage(value)"
                            />
                        </template>
                    </p-data-table>
                </div>
            </div>
        </template>
        <template v-if="props.type === ALERT_HISTORY_ACTION.EVENT_PUSHED"
                  #footer-extra
        >
            <div class="footer-extra">
                <p-button style-type="tertiary"
                          icon-left="ic_copy"
                          @click="handleClickCopy"
                >
                    {{ $t('ALERT_MANAGER.COPY_ALL') }}
                </p-button>
            </div>
        </template>
        <template #confirm-button>
            {{ $t('ALERT_MANAGER.OK') }}
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.alert-detail-tabs-timeline-modal {
    .filter-wrapper {
        @apply flex items-center gap-2;
        .divider {
            height: 1rem;
        }
        .action-filter-wrapper {
            @apply flex items-center flex-wrap text-label-sm;
            gap: 0.75rem;
            .divider {
                padding-top: 0.25rem;
                padding-bottom: 0.25rem;
            }
        }
    }
    .data-content {
        max-height: 20.68rem;
        .code-block {
            min-height: 100%;
        }
    }
}
</style>
