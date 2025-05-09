<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import { isEqual } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    getTextHighlightRegex, PSelectDropdown, PTag, PI, PLazyImg,
} from '@cloudforet/mirinae';
import type {
    AutocompleteHandler,
    SelectDropdownMenuItem,
} from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { ServiceChannelListParameters } from '@/schema/alert-manager/service-channel/api-verbs/list';
import { SERVICE_CHANNEL_TYPE } from '@/schema/alert-manager/service-channel/constants';
import type { ServiceChannelModel } from '@/schema/alert-manager/service-channel/model';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';
import type { ProtocolCardItemType, ProtocolInfo } from '@/services/alert-manager/v2/types/alert-manager-type';

interface DropdownItem extends SelectDropdownMenuItem {
    name: string;
    label: string;
    members?: number;
}

const props = withDefaults(defineProps<{
     selectedIds?: string[];
}>(), {
    selectedIds: undefined,
});

const emit = defineEmits<{(event: 'update:selected-ids', value: string[]): void;
}>();

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageGetters = serviceDetailPageStore.getters;

const storeState = reactive({
    serviceId: computed<string>(() => serviceDetailPageGetters.serviceInfo.service_id),
    notificationProtocolList: computed<ProtocolCardItemType[]>(() => serviceDetailPageGetters.notificationProtocolList),
});
const state = reactive({
    loading: false,
    serviceChannelList: [] as ServiceChannelModel[],
    serviceChannelDropdownList: computed<SelectDropdownMenuItem[]>(() => state.serviceChannelList.map((item) => ({
        name: item.channel_id,
        label: item.name,
    })).sort((a, b) => a.label.localeCompare(b.label))),
    selectedItems: [] as SelectDropdownMenuItem[],
});

const getProtocolInfo = (id: string): ProtocolInfo => {
    const channel = state.serviceChannelList.find((item) => item.channel_id === id);
    const protocol = storeState.notificationProtocolList.find((item) => item.protocol_id === channel.protocol_id);
    return {
        name: channel?.name || '',
        icon: channel.channel_type === SERVICE_CHANNEL_TYPE.FORWARD ? '' : protocol?.icon || '',
    };
};

const menuItemsHandler = (): AutocompleteHandler => async (keyword: string, pageStart = 1, pageLimit = 10) => {
    const _totalCount = pageStart - 1 + pageLimit;
    const filterItems = (items: DropdownItem[]): DropdownItem[] => items.filter((item) => getTextHighlightRegex(keyword).test(item.name)).slice(pageStart - 1, _totalCount);

    const _slicedItems = filterItems(state.serviceChannelDropdownList);
    return {
        results: _slicedItems,
        more: _totalCount < state.serviceChannelDropdownList.length,
    };
};

const currentChannelIds = computed<string[]>(() => state.selectedItems.map((item) => item.name));

const handleUpdateSelectedUserItems = (selectedUsers: SelectDropdownMenuItem[]) => {
    if (isEqual(selectedUsers, state.selectedItems)) return;
    state.selectedItems = selectedUsers;
    if (isEqual(currentChannelIds.value, props.selectedIds)) return;
    emit('update:selected-ids', currentChannelIds.value);
};
const handleTagDelete = (idx: number) => {
    state.selectedItems.splice(idx, 1);
    emit('update:selected-ids', currentChannelIds.value);
};
const initMultipleType = (_channelIds?: string[]) => {
    if (!Array.isArray(_channelIds)) return;
    state.selectedItems = _channelIds.map((channelId) => {
        const channel = state.serviceChannelList.find((item) => item.name === channelId);
        return {
            name: channelId,
            label: channel?.label ?? channelId,
        };
    });
};

const fetchServiceChannelList = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.alertManager.serviceChannel.list<ServiceChannelListParameters, ListResponse<ServiceChannelModel>>({
            service_id: storeState.serviceId,
        });
        state.serviceChannelList = results || [];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.serviceChannelList = [];
    }
};

watch([() => props.selectedIds, () => state.serviceChannelList], async ([selectedIds, serviceChannelList]) => {
    if (serviceChannelList.length > 0 && selectedIds) {
        await initMultipleType(selectedIds);
    }
}, { immediate: true });
watch(() => storeState.serviceId, async (serviceId) => {
    if (!serviceId) return;
    await fetchServiceChannelList();
}, { immediate: true });
</script>

<template>
    <p-select-dropdown show-select-marker
                       class="user-select-dropdown"
                       :selected="state.selectedItems"
                       :handler="menuItemsHandler()"
                       is-filterable
                       page-size="10"
                       use-fixed-menu-style
                       show-delete-all-button
                       multi-selectable
                       appearance-type="stack"
                       @update:selected="handleUpdateSelectedUserItems"
    >
        <template #dropdown-button>
            <div>
                <div v-if="state.selectedItems.length > 0"
                     class="flex flex-wrap py-1 gap-y-2"
                >
                    <p-tag v-for="(item, idx) in state.selectedItems"
                           :key="item.name"
                           outline
                           class="tag border-none"
                           selected
                           @delete="handleTagDelete(idx)"
                    >
                        <div class="member-menu-item h-4">
                            <p-i v-if="!getProtocolInfo(item.name).icon"
                                 name="ic_notification-protocol_users"
                                 width="1rem"
                                 height="1rem"
                            />
                            <p-lazy-img v-else
                                        :src="assetUrlConverter(getProtocolInfo(item.name).icon)"
                                        width="1rem"
                                        height="1rem"
                            />
                            <span class="leading-4">{{ getProtocolInfo(item.name).name }}</span>
                        </div>
                    </p-tag>
                </div>
                <span v-else
                      class="text-gray-600"
                >
                    {{ $t('ALERT_MANAGER.ESCALATION_POLICY.SELECT') }}
                </span>
            </div>
        </template>
        <template #menu-item--format="{ item }">
            <div class="member-menu-item">
                <div>
                    <p-i v-if="!getProtocolInfo(item.name).icon"
                         name="ic_notification-protocol_users"
                         width="1rem"
                         height="1rem"
                    />
                    <p-lazy-img v-else
                                :src="assetUrlConverter(getProtocolInfo(item.name).icon)"
                                width="1rem"
                                height="1rem"
                    />
                </div>
                <span>{{ getProtocolInfo(item.name).name }}</span>
            </div>
        </template>
    </p-select-dropdown>
</template>

<style scoped lang="postcss">
.user-select-dropdown {
    .member-menu-item {
        @apply flex items-center;
        gap: 0.25rem;
    }
    .tag {
        padding-top: 0.125rem;
        padding-bottom: 0.125rem;
    }
}
</style>
