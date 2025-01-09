<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PI,
    PButtonModal, PCodeEditor, PButton, PDataTable, PLazyImg,
} from '@cloudforet/mirinae';

import { ALERT_HISTORY_ACTION, ALERT_HISTORY_NOTIFICATION_STATE } from '@/schema/alert-manager/alert/constants';
import type { AlertHistoryModel } from '@/schema/alert-manager/alert/model';
import type { AlertHistoryActionType, AlertHistoryNotificationInfoType, AlertHistoryNotificationChannelInfoType } from '@/schema/alert-manager/alert/type';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';

import { assetUrlConverter } from '@/lib/helper/asset-helper';
import { copyAnyData } from '@/lib/helper/copy-helper';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import { useProxyValue } from '@/common/composables/proxy-state';

import { green } from '@/styles/colors';

import { ALERT_CHANNEL_TABLE_FIELDS } from '@/services/alert-manager/constants/alert-table-constant';
import type { AlertHistoryNotificationItemType } from '@/services/alert-manager/types/alert-manager-type';

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

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;

const emit = defineEmits<{(event: 'update:visible', visible: boolean): void;
}>();

const storeState = reactive({
    pluginInfo: computed<PluginReferenceMap>(() => allReferenceGetters.plugin),
});
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    channelItem: computed<AlertHistoryNotificationItemType[]>(() => {
        const data = props.history?.notification_info as AlertHistoryNotificationInfoType;
        const channelTypes = ['service_channels', 'user_group_channels', 'user_channels'];

        if (!data) return [];

        return channelTypes.flatMap((type) => Object.entries(data[type] || {}).map(([name, channelInfo]) => {
            const info = channelInfo as AlertHistoryNotificationChannelInfoType;
            return {
                type,
                name,
                state: info.state || '',
                error_message: info.error_message,
            };
        }));
    }),
});

const getChannelTypeName = (type: string) => {
    if (type === 'service_channels') return i18n.t('ALERT_MANAGER.SERVICE.TITLE');
    if (type === 'user_group_channels') return i18n.t('ALERT_MANAGER.SERVICE.USER_GROUP');
    if (type === 'user_channels') return i18n.t('ALERT_MANAGER.SERVICE.USER');
    return '';
};

const handleCloseModal = () => {
    state.proxyVisible = false;
};
const handleClickCopy = () => {
    copyAnyData(props.history);
    showSuccessMessage(i18n.t('ALERT_MANAGER.ALERTS.COPIED'), '');
};
</script>

<template>
    <p-button-modal :header-title="$t('ALERT_MANAGER.ALERTS.EVENT_DETAILS')"
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
                <p-data-table v-else
                              :fields="ALERT_CHANNEL_TABLE_FIELDS"
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
                                        class="service-img"
                            />
                            <span>{{ value }}</span>
                        </div>
                    </template>
                    <template #col-state-format="{value}">
                        <p class="flex items-center gap-1">
                            <p-i v-if="value !== ALERT_HISTORY_NOTIFICATION_STATE.FAILURE"
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
                </p-data-table>
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
                    {{ $t('ALERT_MANAGER.ALERTS.COPY_ALL') }}
                </p-button>
            </div>
        </template>
        <template #confirm-button>
            {{ $t('ALERT_MANAGER.ALERTS.OK') }}
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.alert-detail-tabs-timeline-modal {
    .data-content {
        max-height: 20.68rem;
        .code-block {
            min-height: 100%;
        }
    }
}
</style>
