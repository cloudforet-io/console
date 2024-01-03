<script setup lang="ts">
import {
    computed, onActivated, reactive,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import type { Location } from 'vue-router';
import { useRoute } from 'vue-router/composables';

import {
    PDivider, PI, PEmpty, PPaneLayout, PLazyImg, PDataLoader,
} from '@spaceone/design-system';
import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { Tags } from '@/schema/_common/model';
import type { ProjectChannelListParameters } from '@/schema/notification/project-channel/api-verbs/list';
import type { ProjectChannelModel } from '@/schema/notification/project-channel/model';
import type { ProtocolListParameters } from '@/schema/notification/protocol/api-verbs/list';
import type { ProtocolModel } from '@/schema/notification/protocol/model';
import type { UserChannelListParameters } from '@/schema/notification/user-channel/api-verbs/list';
import type { UserChannelModel } from '@/schema/notification/user-channel/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import type { PluginReferenceMap } from '@/store/modules/reference/plugin/type';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import NotificationChannelItem from '@/services/my-page/components/NotificationChannelItem.vue';
import { MY_PAGE_ROUTE } from '@/services/my-page/routes/route-constant';
import type { NotiChannelItem } from '@/services/my-page/types/notification-channel-item-type';
import type { UserNotificationAddPageUrlQuery } from '@/services/my-page/types/user-notification-add-page-url-query-type';
import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';
import type { ProjectNotificationAddPageUrlQuery } from '@/services/project/types/project-notification-add-page-url-query-type';


interface EnrichedProtocolItem extends ProtocolModel {
    label: TranslateResult;
    link: Partial<Location>;
    protocolType: string;
    tags: Tags;
    icon: any;
}

const props = withDefaults(defineProps<{
    projectId?: string;
    manageDisabled?: boolean;
}>(), {
    projectId: '',
    manageDisabled: false,
});
const route = useRoute();
const state = reactive({
    loading: true,
    channelLoading: true,
    userId: computed<string>(() => (route.params.userId ? decodeURIComponent(route.params.userId) : store.state.user.userId)),
    channelList: [] as NotiChannelItem[],
    protocolResp: [] as ProtocolModel[],
    protocolList: computed<EnrichedProtocolItem[]>(() => state.protocolResp.map((d) => {
        const query: ProjectNotificationAddPageUrlQuery|UserNotificationAddPageUrlQuery = {
            protocolLabel: d.name,
            protocolType: d.protocol_type,
        };
        return {
            label: i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ADD_CHANNEL', { type: d.name }),
            link: {
                name: props.projectId ? PROJECT_ROUTE.DETAIL.TAB.NOTIFICATIONS.ADD._NAME : MY_PAGE_ROUTE.NOTIFICATION.ADD._NAME,
                params: {
                    protocolId: d.protocol_id,
                },
                query,
            },
            protocolType: d.protocol_type,
            tags: d.tags,
            plugin_info: d.plugin_info,
            icon: state.plugins[d.plugin_info?.plugin_id]?.icon || '',
            name: d.name,
        };
    })),
    plugins: computed<PluginReferenceMap>(() => store.getters['reference/pluginItems']),
});


const apiQuery = new ApiQueryHelper();
const listProtocol = async () => {
    try {
        state.loading = true;
        if (props.projectId) {
            apiQuery.setFilters([])
                .setSort('protocol_type');
        } else {
            apiQuery.setFilters([{ k: 'protocol_type', o: '=', v: 'EXTERNAL' }]);
        }
        const res = await SpaceConnector.clientV2.notification.protocol.list<ProtocolListParameters, ListResponse<ProtocolModel>>({
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

const injectProtocolName = (channel: UserChannelModel|ProjectChannelModel): string => {
    const protocolInfoOfChannel = state.protocolResp.find((i) => i.protocol_id === channel.protocol_id);
    if (protocolInfoOfChannel) return protocolInfoOfChannel.name;
    return channel.name;
};
const injectProtocolSchema = (channel: UserChannelModel|ProjectChannelModel): JsonSchema => {
    const protocolInfoOfChannel = state.protocolResp.find((i) => i.protocol_id === channel.protocol_id);
    if (protocolInfoOfChannel?.plugin_info.metadata.data === undefined) return {};
    return protocolInfoOfChannel.plugin_info.metadata.data.schema;
};

const channelApiQuery = new ApiQueryHelper();
const listUserChannel = async () => {
    try {
        state.channelLoading = true;
        channelApiQuery.setFilters([{ k: 'user_id', v: state.userId, o: '=' }]);
        const res = await SpaceConnector.clientV2.notification.userChannel.list<UserChannelListParameters, ListResponse<UserChannelModel>>({
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
    if (props.projectId) await listProjectChannel();
    else await listUserChannel();
};

const onChangeChannelItem = async () => {
    await listChannel();
};

(async () => {
    await store.dispatch('reference/plugin/load');
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
                            <li class="channel-item">
                                <p-lazy-img v-if="item.protocolType === 'INTERNAL'"
                                            :src="assetUrlConverter('https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/notifications_member.svg')"
                                            width="2.25rem"
                                            height="2.25rem"
                                            class="service-img"
                                />
                                <p-lazy-img v-else
                                            :src="assetUrlConverter(item.icon)"
                                            width="2.25rem"
                                            height="2.25rem"
                                            class="service-img"
                                />
                                <span class="text"
                                      :class="{disabled: props.manageDisabled}"
                                >
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
                <p v-if="projectId"
                   class="spaceone-desc"
                >
                    <p-i name="ic_users"
                         width="1.125rem"
                         class="mr-2"
                    />
                    <b>SpaceOne User:</b> {{ $t('MY_PAGE.NOTIFICATION.SPACEONE_USER_DESC') }}
                </p>
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
.spaceone-desc {
    @apply bg-gray-100 text-gray-700;
    min-height: 2.125rem;
    width: 100%;
    margin-top: 0.5rem;
    padding: 0.5rem 0.75rem;
    line-height: 150%;
    font-size: 0.75rem;
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
    .text {
        @apply text-primaryDark font-bold;
        text-align: center;
        line-height: 160%;
        &.disabled {
            @apply text-gray-300;
        }
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
