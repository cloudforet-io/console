<script setup lang="ts">
import {
    computed, onActivated, reactive,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import type { Location } from 'vue-router';
import { useRoute } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PDivider, PI, PEmpty, PPaneLayout, PLazyImg, PDataLoader,
} from '@cloudforet/mirinae';
import type { JsonSchema } from '@cloudforet/mirinae/types/controls/forms/json-schema-form/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { Tags } from '@/api-clients/_common/schema/model';
import type { NotificationProtocolListParameters } from '@/schema/alert-manager/notification-protocol/api-verbs/list';
import type { NotificationProtocolModel } from '@/schema/alert-manager/notification-protocol/model';
import type { UserChannelListParameters } from '@/schema/alert-manager/user-channel/api-verbs/list';
import type { UserChannelModel } from '@/schema/alert-manager/user-channel/model';
import type { ProjectChannelListParameters } from '@/schema/notification/project-channel/api-verbs/list';
import type { ProjectChannelModel } from '@/schema/notification/project-channel/model';
import type { ProtocolListParameters } from '@/schema/notification/protocol/api-verbs/list';
import type { ProtocolModel } from '@/schema/notification/protocol/model';
import type { UserChannelListParameters as UserChannelListParametersV1 } from '@/schema/notification/user-channel/api-verbs/list';
import type { UserChannelModel as UserChannelModelV1 } from '@/schema/notification/user-channel/model';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { useGlobalConfigUiAffectsSchema } from '@/lib/config/global-config/composables/use-global-config-ui-affects-schema';
import { assetUrlConverter } from '@/lib/helper/asset-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import NotificationChannelItem from '@/services/my-page/components/NotificationChannelItem.vue';
import { MY_PAGE_ROUTE } from '@/services/my-page/routes/route-constant';
import type { NotiChannelItem, NotiChannelItemV1 } from '@/services/my-page/types/notification-channel-item-type';
import { PROJECT_ROUTE_V1 } from '@/services/project/v1/routes/route-constant';

interface EnrichedProtocolItem extends ProtocolModel {
    label: TranslateResult;
    link: Partial<Location>;
    protocolType: string;
    tags: Tags;
    icon: any;
    id: string;
}
const allReferenceStore = useAllReferenceStore();
const userStore = useUserStore();
const alertManagerUiAffectsSchema = useGlobalConfigUiAffectsSchema('ALERT_MANAGER');


const props = withDefaults(defineProps<{
    projectId?: string;
    manageDisabled?: boolean;
}>(), {
    projectId: '',
    manageDisabled: false,
});
const route = useRoute();
const state = reactive({
    visibleUserNotification: computed<boolean>(() => alertManagerUiAffectsSchema.value?.visibleUserNotification ?? false),
    loading: true,
    channelLoading: true,
    userId: computed<string|undefined>(() => (route.params.userId ? decodeURIComponent(route.params.userId) : userStore.state.userId)),
    channelList: [] as NotiChannelItemV1[]|NotiChannelItem[],
    protocolResp: [] as ProtocolModel[],
    defaultProtocolResp: computed<ProtocolModel[]>(() => state.protocolResp.filter((d) => d.protocol_type !== 'INTERNAL')),
    associatedMemberProtocol: computed<EnrichedProtocolItem>(() => (
        state.protocolResp.filter((d) => d.protocol_type === 'INTERNAL').map((d) => createProtocolItem(d))
    )),
    protocolList: computed<EnrichedProtocolItem[]>(() => (
        state.defaultProtocolResp.map((d) => createProtocolItem(d))
    )),
    plugins: computed<PluginReferenceMap>(() => allReferenceStore.getters.plugin),
});

const createProtocolItem = (d) => {
    const query = {
        protocolLabel: d.name,
        protocolType: d.protocol_type,
    };
    return {
        label: d.protocol_type === 'INTERNAL' ? i18n.t('IAM.USER.NOTIFICATION.ASSOCIATED_MEMBER') : i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ADD_CHANNEL', { type: d.name }),
        link: {
            name: props.projectId ? PROJECT_ROUTE_V1.DETAIL.TAB.NOTIFICATIONS.ADD._NAME : MY_PAGE_ROUTE.NOTIFICATION.ADD._NAME,
            params: { protocolId: d.protocol_id },
            query,
        },
        protocolType: d.protocol_type,
        tags: d.tags,
        plugin_info: d.plugin_info,
        icon: state.plugins[d.plugin_info?.plugin_id]?.icon || '',
        name: d.name,
    };
};

const apiQuery = new ApiQueryHelper();

const listProtocol = async () => {
    try {
        state.loading = true;
        if (!state.visibleUserNotification && props.projectId) {
            apiQuery.setFilters([])
                .setSort('protocol_type');
        } else if (!state.visibleUserNotification) {
            apiQuery.setFilters([{ k: 'protocol_type', o: '=', v: 'EXTERNAL' }]);
        }
        const fetcher = state.visibleUserNotification
            ? SpaceConnector.clientV2.alertManager.notificationProtocol.list<NotificationProtocolListParameters, ListResponse<NotificationProtocolModel>>
            : SpaceConnector.clientV2.notification.protocol.list<ProtocolListParameters, ListResponse<ProtocolModel>>;
        const res = await fetcher({
            query: apiQuery.data,
        });
        state.protocolResp = res.results ?? [];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.protocolResp = [];
    } finally {
        state.loading = false;
    }
};

const injectProtocolName = (channel: UserChannelModel|UserChannelModelV1|ProjectChannelModel): string => {
    const protocolInfoOfChannel = state.protocolResp.find((i) => i.protocol_id === channel.protocol_id);
    if (protocolInfoOfChannel) return protocolInfoOfChannel.name;
    return channel.name;
};
const injectProtocolSchema = (channel: UserChannelModel|UserChannelModelV1|ProjectChannelModel): JsonSchema => {
    const protocolInfoOfChannel = state.protocolResp.find((i) => i.protocol_id === channel.protocol_id);
    if (protocolInfoOfChannel?.plugin_info.metadata.data === undefined) return {};
    return protocolInfoOfChannel.plugin_info.metadata.data.schema;
};

const channelApiQuery = new ApiQueryHelper();
const listUserChannel = async () => {
    try {
        state.channelLoading = true;
        channelApiQuery.setFilters([{ k: 'user_id', v: state.userId, o: '=' }]);
        const fetcher = state.visibleUserNotification
            ? SpaceConnector.clientV2.alertManager.userChannel.list<UserChannelListParameters, ListResponse<UserChannelModel>>
            : SpaceConnector.clientV2.notification.userChannel.list<UserChannelListParametersV1, ListResponse<UserChannelModelV1>>;
        const res = await fetcher({
            query: channelApiQuery.data,
        });
        state.channelList = res.results?.map((d) => ({
            ...d,
            protocol_name: injectProtocolName(d),
            schema: injectProtocolSchema(d),
        })) ?? [];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.channelList = [];
    } finally {
        state.channelLoading = false;
    }
};

const listProjectChannel = async () => {
    try {
        state.channelLoading = true;
        channelApiQuery.setFilters([{ k: 'project_id', v: props.projectId, o: '=' }]).setSort('notification_level', false);
        const res = await SpaceConnector.clientV2.notification.projectChannel.list<ProjectChannelListParameters, ListResponse<ProjectChannelModel>>({
            query: channelApiQuery.data,
        });
        state.channelList = res.results?.map((d) => ({
            ...d,
            protocol_name: injectProtocolName(d),
            schema: injectProtocolSchema(d),
        })) ?? [];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.channelList = [];
    } finally {
        state.channelLoading = false;
    }
};

const listChannel = async () => {
    if (!state.visibleUserNotification && props.projectId) await listProjectChannel();
    else await listUserChannel();
};

const onChangeChannelItem = async () => {
    await listChannel();
};

(async () => {
    await listProtocol();
    await listChannel();
})();

onActivated(async () => {
    await listProtocol();
    await listChannel();
});
</script>

<template>
    <section class="notification-wrapper">
        <p-pane-layout class="noti-channel-wrapper">
            <h3 class="sub-title">
                {{ $t('MY_PAGE.NOTIFICATION.NOTIFICATION_CHANNEL') }}
            </h3>
            <p-data-loader :data="state.protocolList"
                           :loading="state.loading"
            >
                <div class="channel-list-wrapper">
                    <ul v-for="item in state.protocolList"
                        :key="item.protocol_id"
                        class="channel-item-wrapper"
                        :class="{disabled: props.manageDisabled}"
                    >
                        <router-link :to="item.link">
                            <li class="channel-item"
                                :class="{disabled: props.manageDisabled}"
                            >
                                <p-lazy-img :src="assetUrlConverter(item.icon)"
                                            width="2.25rem"
                                            height="2.25rem"
                                            class="service-img"
                                />
                                <span class="text">
                                    <p-i name="ic_plus_bold"
                                         width="1rem"
                                         height="1rem"
                                         color="inherit transparent"
                                    />
                                    {{ item.label }}
                                </span>
                            </li>
                        </router-link>
                    </ul>
                </div>
                <div v-if="!state.visibleUserNotification"
                     class="associated-member-item-wrapper"
                >
                    <ul v-for="item in state.associatedMemberProtocol"
                        :key="item.protocol_id"
                        class="associated-member-item"
                        :class="{disabled: props.manageDisabled}"
                    >
                        <router-link :to="item.link">
                            <li class="channel-item"
                                :class="{disabled: props.manageDisabled}"
                            >
                                <p-lazy-img :src="assetUrlConverter('https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/notifications_member.svg')"
                                            width="2.25rem"
                                            height="2.25rem"
                                            class="service-img"
                                />
                                <span class="text">
                                    <p-i name="ic_plus_bold"
                                         width="1rem"
                                         height="1rem"
                                         color="inherit transparent"
                                    />
                                    {{ item.label }}
                                </span>
                                <span class="description">
                                    {{ $t('IAM.USER.NOTIFICATION.ASSOCIATED_MEMBER_DESC') }}
                                </span>
                            </li>
                        </router-link>
                    </ul>
                </div>
                <template #no-data>
                    <p-empty class="empty-msg protocol">
                        {{ $t('MY_PAGE.NOTIFICATION.NO_PROTOCOL') }}
                    </p-empty>
                </template>
            </p-data-loader>
            <p-divider class="divider" />
            <p-data-loader class="flex-grow"
                           :data="state.channelList"
                           :loading="state.channelLoading"
            >
                <div style="min-height: 6.5rem;">
                    <ul v-for="item in state.channelList"
                        :key="`${item.name}-${item.created_at}`"
                    >
                        <li class="mb-4">
                            <notification-channel-item :channel-data="item"
                                                       :project-id="props.projectId"
                                                       :manage-disabled="props.manageDisabled"
                                                       :visible-user-notification="state.visibleUserNotification"
                                                       @change="onChangeChannelItem"
                                                       @confirm="listChannel"
                            />
                        </li>
                    </ul>
                </div>
                <template #no-data>
                    <p-empty class="empty-msg">
                        {{ $t('MY_PAGE.NOTIFICATION.NO_NOTI_CHANNEL') }}
                    </p-empty>
                </template>
            </p-data-loader>
        </p-pane-layout>
    </section>
</template>

<style lang="postcss" scoped>
.noti-channel-wrapper {
    @apply border-none;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    width: 100%;
    height: 100%;
    padding: 2rem 1rem 0.375rem 1rem;
}
.sub-title {
    font-size: 1.375rem;
    line-height: 145%;
}

/* custom design-system component - p-data-loader */
:deep(.p-data-loader) {
    .data-wrapper {
        overflow-y: hidden;
    }
}
.channel-list-wrapper {
    display: grid;
    row-gap: 0.5rem;
    column-gap: 0.5rem;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    margin-top: 1.125rem;
    gap: 0.5rem;
    overflow-y: hidden;
}
.associated-member-item-wrapper {
    @apply bg-gray-100;
    margin-top: 0.75rem;
    padding: 0.5rem;
    border-radius: 0.375rem;
    .associated-member-item {
        @apply bg-white;
    }
}
.channel-item-wrapper {
    &.hide {
        display: none;
    }
    &.disabled {
        @apply bg-gray-100 text-gray-700;
        pointer-events: none;
    }
}
.channel-item {
    @apply border border-gray-300 rounded-lg;
    display: flex;
    flex-direction: column;
    place-content: center;
    align-items: center;
    height: 8.625rem;
    min-height: 8.625rem;
    &.disabled {
        .text, .description {
            @apply text-gray-300;
        }
    }
    .text {
        @apply text-primaryDark font-bold;
        text-align: center;
        line-height: 160%;
    }
    .description {
        @apply text-violet-800 text-label-sm text-center;
    }
    .item-desc {
        @apply text-violet-800;
        font-size: 0.75rem;
        line-height: 150%;
        text-align: center;
        max-width: 12.5rem;
    }
    &:hover {
        @apply bg-blue-100;
    }
}
.service-img {
    margin-bottom: 1rem;
}
.divider {
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
}
.empty-msg {
    margin-top: 0.75rem;
    margin-bottom: 2.5rem;
    &.protocol {
        margin-bottom: 2.5rem;
    }
}
</style>
