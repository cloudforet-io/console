<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import { isEqual } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    getTextHighlightRegex, PAvatar, PSelectDropdown, PTag,
} from '@cloudforet/mirinae';
import type {
    AutocompleteHandler,
    SelectDropdownMenuItem,
} from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ServiceChannelListParameters } from '@/schema/alert-manager/service-channel/api-verbs/list';
import type { ServiceChannelModel } from '@/schema/alert-manager/service-channel/model';
import type { UserGroupChannelListParameters } from '@/schema/alert-manager/user-group-channel/api-verbs/list';
import type { UserGroupChannelModel } from '@/schema/alert-manager/user-group-channel/model';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { UserGroupReferenceMap } from '@/store/reference/user-group-reference-store';
import type { UserReferenceMap } from '@/store/reference/user-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { indigo } from '@/styles/colors';

import { useServiceDetailPageStore } from '@/services/alert-manager-v2/stores/service-detail-page-store';

interface DropdownItem extends SelectDropdownMenuItem {
    name: string;
    label: string;
    members?: number;
    userName?: string;
}
type DropdownCategoriesType = {
    key: string;
    title: string;
};

const props = withDefaults(defineProps<{
     selectedIds?: string[];
}>(), {
    selectedIds: undefined,
});

const emit = defineEmits<{(event: 'update:selected-ids', value: string[]): void;
}>();

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageGetters = serviceDetailPageStore.getters;

const storeState = reactive({
    userReferenceMap: computed<UserReferenceMap>(() => allReferenceGetters.user),
    userGroupReferenceMap: computed<UserGroupReferenceMap>(() => allReferenceGetters.user_group),
    serviceId: computed<string>(() => serviceDetailPageGetters.serviceInfo.service_id),
});
const state = reactive({
    loading: false,
    serviceChannelList: [] as DropdownItem[],
    userGroupChannelList: [] as DropdownItem[],
    dropdownCategories: computed<DropdownCategoriesType[]>(() => {
        const result: DropdownCategoriesType[] = [];
        if (state.serviceChannelList.length > 0) {
            result.push({
                key: 'service_channel',
                title: i18n.t('ALERT_MANAGER.ESCALATION_POLICY.CHANNEL') as string,
            });
        }
        if (state.userGroupChannelList.length > 0) {
            result.push({
                key: 'user_group_channel',
                title: i18n.t('ALERT_MANAGER.ESCALATION_POLICY.USER_GROUP') as string,
            });
        }
        return result;
    }),
    selectedItems: [] as SelectDropdownMenuItem[],
});

const menuItemsHandler = (): AutocompleteHandler => async (keyword: string, pageStart = 1, pageLimit = 10, filters, resultIndex) => {
    const _totalCount = pageStart - 1 + pageLimit;
    const filterItems = (items: DropdownItem[]) => items.filter((item) => getTextHighlightRegex(keyword).test(item.name)).slice(pageStart - 1, _totalCount);

    if (resultIndex === undefined) {
        return state.dropdownCategories.map((c, idx) => {
            const items: DropdownItem[] = [
                { type: 'header', label: c.title, name: 'header' },
            ];
            if (c.key === 'service_channel') items.push(...state.serviceChannelList);
            else if (c.key === 'user_group_channel') items.push(...state.userGroupChannelList);

            const _slicedItems = filterItems(items);
            _slicedItems.unshift();
            if (idx !== 0) {
                _slicedItems.unshift({ type: 'divider', label: '', name: '' });
            }
            return {
                results: _slicedItems,
                more: _totalCount < items.length,
            };
        });
    }

    return state.dropdownCategories.map((c, i) => {
        const items: DropdownItem[] = [];
        if (c.key === 'service_channel') items.push(...state.serviceChannelList);
        else if (c.key === 'user_group_channel') items.push(...state.userGroupChannelList);
        const _slicedItems = filterItems(items);
        if (i !== resultIndex) return { results: [], title: c.title };
        return {
            results: _slicedItems,
            more: _totalCount < items.length,
        };
    });
};

const currentChannelIds = computed<string[]>(() => state.selectedItems.map((item) => item.name));

const handleUpdateSelectedUserItems = (selectedUsers: SelectDropdownMenuItem[]) => {
    if (isEqual(selectedUsers, state.selectedItems)) return; // prevent unnecessary update
    state.selectedItems = selectedUsers; // it updates currentChannelIds automatically
    if (isEqual(currentChannelIds.value, props.selectedIds)) return; // prevent unnecessary update
    emit('update:selected-ids', currentChannelIds.value);
};
const handleTagDelete = (idx: number) => {
    state.selectedItems.splice(idx, 1);
    emit('update:selected-ids', currentChannelIds.value);
};
const initMultipleType = (_channelIds?: string[]) => {
    if (!Array.isArray(_channelIds)) return;
    if (!isEqual(currentChannelIds.value, _channelIds)) {
        state.selectedItems = _channelIds.map((channelId) => ({
            name: channelId,
            label: storeState.userReferenceMap[channelId]?.label ?? channelId,
        }));
    }
};
const checkUserGroup = (id: string): boolean => state.userGroupChannelList.some((i) => i.name === id);

const fetchServiceChannelList = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.alertManager.serviceChannel.list<ServiceChannelListParameters, ListResponse<ServiceChannelModel>>({
            service_id: storeState.serviceId,
        });
        state.serviceChannelList = (results || []).map((item) => ({
            name: item.channel_id,
            label: item.name,
        })).sort((a, b) => a.label.localeCompare(b.label));
    } catch (e) {
        ErrorHandler.handleError(e, true);
        state.serviceChannelList = [];
    }
};
const fetchUserGroupChannelList = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.alertManager.userGroupChannel.list<UserGroupChannelListParameters, ListResponse<UserGroupChannelModel>>();
        state.userGroupChannelList = (results || []).map((item) => ({
            name: item.channel_id,
            label: item.name,
        })).sort((a, b) => a.label.localeCompare(b.label));
    } catch (e) {
        ErrorHandler.handleError(e, true);
        state.userGroupChannelList = [];
    }
};

watch(() => storeState.serviceId, async (serviceId) => {
    if (!serviceId) return;
    await fetchServiceChannelList();
    await fetchUserGroupChannelList();
}, { immediate: true });
watch(() => props.selectedIds, (newChannelId) => {
    if (isEqual(currentChannelIds.value, newChannelId)) return; // prevent infinite loop
    initMultipleType(newChannelId);
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
            <div class="flex flex-wrap py-1 gap-y-2">
                <p-tag v-for="(item, idx) in state.selectedItems"
                       :key="item.name"
                       :outline="!checkUserGroup(item.name)"
                       class="tag border-none"
                       selected
                       @delete="handleTagDelete(idx)"
                >
                    <div class="member-menu-item h-4">
                        <p-avatar v-if="checkUserGroup(item.name)"
                                  icon="ic_member"
                                  :color="indigo[300]"
                                  size="xs"
                        />
                        <p-avatar v-else
                                  icon="ic_my-page_notifications-channel"
                                  size="xs"
                        />
                        <span class="leading-4">{{ item.label }}</span>
                    </div>
                </p-tag>
            </div>
        </template>
        <template #menu-item--format="{ item }">
            <div class="member-menu-item">
                <div>
                    <p-avatar v-if="checkUserGroup(item.name)"
                              class="menu-icon"
                              icon="ic_member"
                              :color="indigo[300]"
                              size="xs"
                    />
                    <p-avatar v-else
                              class="menu-icon"
                              icon="ic_my-page_notifications-channel"
                              size="xs"
                    />
                </div>
                <span>{{ item.label }}</span>
                <span class="text-gray-500">
                    <span v-if="checkUserGroup(item.name)">({{ item?.members || 0 }} {{ $t('ALERT_MANAGER.ALERTS.MEMBERS') }})</span>
                </span>
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
