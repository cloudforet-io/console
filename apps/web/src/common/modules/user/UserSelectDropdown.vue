<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import { isEqual } from 'lodash';

import {
    getTextHighlightRegex, PAvatar, PSelectDropdown, PTag,
} from '@cloudforet/mirinae';
import type {
    AutocompleteHandler,
    SelectDropdownMenuItem,
} from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { MembersType } from '@/schema/alert-manager/service/type';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { UserGroupReferenceMap } from '@/store/reference/user-group-reference-store';
import type { UserReferenceMap } from '@/store/reference/user-reference-store';

import { indigo } from '@/styles/colors';

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
     selectedId?: string;
     selectedIds?: string[];
     selectionType?: 'single'|'multiple';
     appearanceType?: 'badge'|'stack';
     styleType?: string;
     block?: boolean;
     useFixedMenuStyle?: boolean;
     selectionLabel?: string;
     invalid?: boolean;
     disabled?: boolean;
     readonly?: boolean;
     userPool?: string[];
     userGroupPool?: string[];
     showUserList?: boolean;
     showUserGroupList?: boolean;
     showCategoryTitle?: boolean;
     placeholder?: string;
     excludedSelectedIds?: string[];
     size?: 'sm'|'md';
     pageSize?: number;
     showDeleteAllButton?: boolean;
}>(), {
    selectedId: undefined,
    selectedIds: undefined,
    selectionType: 'single',
    appearanceType: 'stack',
    styleType: undefined,
    block: undefined,
    useFixedMenuStyle: false,
    selectionLabel: undefined,
    invalid: false,
    disabled: false,
    readonly: false,
    userPool: undefined,
    userGroupPool: undefined,
    showUserList: true,
    showUserGroupList: true,
    showCategoryTitle: true,
    placeholder: 'Select',
    excludedSelectedIds: undefined,
    size: 'md',
    pageSize: 10,
    showDeleteAllButton: true,
});

const emit = defineEmits<{(event: 'update:selected-id', value?: string): void;
    (event: 'update:selected-ids', value: string[]): void;
    (event: 'formatted-selected-ids', value: Record<MembersType, string[]>): void;
}>();

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;

const storeState = reactive({
    userReferenceMap: computed<UserReferenceMap>(() => allReferenceGetters.user),
    userGroupReferenceMap: computed<UserGroupReferenceMap>(() => allReferenceGetters.user_group),
});
const state = reactive({
    dropdownCategories: computed<DropdownCategoriesType[]>(() => {
        const result: DropdownCategoriesType[] = [];
        if (props.showUserList) {
            result.push({
                key: 'user',
                title: i18n.t('COMMON.USER_SELECT_DROPDOWN.USER') as string,
            });
        }
        if (props.showUserGroupList) {
            result.push({
                key: 'user_group',
                title: i18n.t('COMMON.USER_SELECT_DROPDOWN.USER_GROUP') as string,
            });
        }
        return result;
    }),
    allUserItems: computed<DropdownItem[]>(() => {
        if (!props.showUserList) return [];
        if (props.userPool) {
            return props.userPool?.map((userId) => ({
                name: userId,
                label: storeState.userReferenceMap[userId]?.label || storeState.userReferenceMap[userId]?.name || userId,
            }));
        }
        const list = props.excludedSelectedIds
            ? Object.values(storeState.userReferenceMap).filter((i) => !props.excludedSelectedIds?.includes(i.key))
            : Object.values(storeState.userReferenceMap);
        return list.map((u: UserReferenceMap[string]) => ({
            name: u.key,
            label: u.key,
            userName: u.name,
        })).sort((a, b) => a.label.localeCompare(b.label));
    }),
    allUserGroupItems: computed<DropdownItem[]>(() => {
        if (!props.showUserGroupList) return [];
        if (props.userGroupPool) {
            return props.userGroupPool?.map((userGroupId) => ({
                name: userGroupId,
                label: storeState.userGroupReferenceMap[userGroupId]?.label || storeState.userGroupReferenceMap[userGroupId]?.name || userGroupId,
            }));
        }
        const list = props.excludedSelectedIds
            ? Object.values(storeState.userGroupReferenceMap).filter((i) => !props.excludedSelectedIds?.includes(i.key))
            : Object.values(storeState.userGroupReferenceMap);
        return list.map((u: UserGroupReferenceMap[string]) => ({
            name: u.key,
            label: u.label,
            members: u.data.users?.length,
        }));
    }),
    selectedItems: [] as SelectDropdownMenuItem[],
});

const checkUserGroup = (id: string): boolean => state.allUserGroupItems.some((i) => i.name === id);
const menuItemsHandler = (): AutocompleteHandler => async (keyword: string, pageStart = 1, pageLimit = 10, filters, resultIndex) => {
    const _totalCount = Number((pageStart - 1 || 0) + pageLimit);
    const filterItems = (items: SelectDropdownMenuItem[]) => items.filter((item) => getTextHighlightRegex(keyword).test(item.name)).slice(pageStart - 1, _totalCount);

    if (state.allUserItems.length === 0 && state.allUserGroupItems.length === 0) {
        return {
            results: [],
        };
    }

    if (resultIndex === undefined) {
        return state.dropdownCategories.map((c, idx) => {
            const items = c.key === 'user' ? state.allUserItems : state.allUserGroupItems;
            const _slicedItems = filterItems(items);
            if (_slicedItems.length === 0) {
                return {
                    results: [],
                };
            }
            if (props.showCategoryTitle) {
                _slicedItems.unshift({ type: 'header', label: c.title, name: 'header' });
            }
            if (idx !== 0) {
                _slicedItems.unshift({ type: 'divider', label: '', name: '' });
            }
            return {
                results: _slicedItems,
                more: pageLimit <= _slicedItems.length && _totalCount < items.length,
            };
        });
    }

    return state.dropdownCategories.map((c, i) => {
        const items = c.key === 'user' ? state.allUserItems : state.allUserGroupItems;
        const _slicedItems = filterItems(items);
        if (i !== resultIndex) return { results: [], title: c.title };
        return {
            results: _slicedItems,
            more: pageLimit <= _slicedItems.length && _totalCount < items.length,
        };
    });
};

const currentUserId = computed<string|undefined>(() => state.selectedItems[0]?.name);
const currentUserIds = computed<string[]>(() => state.selectedItems.map((item) => item.name));

const handleUpdateSelectedUserItems = (selectedUsers: SelectDropdownMenuItem[]) => {
    if (isEqual(selectedUsers, state.selectedItems)) return; // prevent unnecessary update
    state.selectedItems = selectedUsers; // it updates currentUserId and currentUserIds automatically
    if (props.selectionType === 'single') {
        if (currentUserId?.value === props.selectedId) return; // prevent unnecessary update
        emit('update:selected-id', currentUserId?.value);
    } else {
        if (isEqual(currentUserIds.value, props.selectedIds)) return; // prevent unnecessary update
        emit('update:selected-ids', currentUserIds.value);
        emit('formatted-selected-ids', {
            USER: currentUserIds.value.filter((i) => !checkUserGroup(i)),
            USER_GROUP: currentUserIds.value.filter((i) => checkUserGroup(i)),
        });
    }
};
const handleTagDelete = (idx: number) => {
    state.selectedItems.splice(idx, 1);
    emit('update:selected-ids', currentUserIds.value);
    emit('formatted-selected-ids', {
        USER: currentUserIds.value.filter((i) => !checkUserGroup(i)),
        USER_GROUP: currentUserIds.value.filter((i) => checkUserGroup(i)),
    });
};

const initSingleType = (_userId?: string) => {
    if (currentUserId?.value !== _userId) {
        const value = _userId || '';
        const label = (() => {
            if (props.showUserList && storeState.userReferenceMap[value]) {
                return storeState.userReferenceMap[value]?.label ?? _userId;
            }
            if (props.showUserGroupList && storeState.userGroupReferenceMap[value]) {
                return storeState.userGroupReferenceMap[value]?.label ?? _userId;
            }
            return _userId;
        })();

        state.selectedItems = _userId
            ? [{ name: _userId, label }]
            : [];
    }
};
const initMultipleType = (_userIds?: string[]) => {
    if (!Array.isArray(_userIds)) throw new Error('userIds should be an array');
    if (!isEqual(currentUserIds.value, _userIds)) {
        state.selectedItems = _userIds.map((userId) => {
            const label = (() => {
                if (props.showUserList && storeState.userReferenceMap[userId]) {
                    return storeState.userReferenceMap[userId]?.label ?? userId;
                }
                if (props.showUserGroupList && storeState.userGroupReferenceMap[userId]) {
                    return storeState.userGroupReferenceMap[userId]?.label ?? userId;
                }
                return userId;
            })();

            return {
                name: userId,
                label,
            };
        });
        emit('formatted-selected-ids', {
            USER: currentUserIds.value.filter((i) => !checkUserGroup(i)),
            USER_GROUP: currentUserIds.value.filter((i) => checkUserGroup(i)),
        });
    }
};

watch([() => props.selectedId, () => props.selectedIds], ([newUserId, newUserIds]) => {
    if (props.selectionType === 'single') {
        if (currentUserId?.value === newUserId) return; // prevent infinite loop
        initSingleType(newUserId);
    } else {
        if (isEqual(currentUserIds.value, newUserIds)) return; // prevent infinite loop
        initMultipleType(newUserIds);
    }
}, { immediate: true });
</script>

<template>
    <p-select-dropdown class="user-select-dropdown"
                       show-select-marker
                       is-filterable
                       :show-delete-all-button="props.showDeleteAllButton"
                       :selected="state.selectedItems"
                       :handler="menuItemsHandler()"
                       :selection-label="props.selectionLabel"
                       :invalid="props.invalid"
                       :disabled="props.disabled"
                       :readonly="props.readonly"
                       :use-fixed-menu-style="props.useFixedMenuStyle"
                       :multi-selectable="props.selectionType === 'multiple'"
                       :appearance-type="props.appearanceType"
                       :style-type="props.styleType"
                       :placeholder="props.placeholder"
                       :block="props.block"
                       :size="props.size"
                       :page-size="props.pageSize"
                       @update:selected="handleUpdateSelectedUserItems"
    >
        <template v-if="props.appearanceType === 'stack'"
                  #dropdown-button
        >
            <div v-if="state.selectedItems.length > 0"
                 class="flex flex-wrap py-1 gap-y-2"
            >
                <p-tag v-for="(item, idx) in state.selectedItems"
                       :key="item.name"
                       :outline="!checkUserGroup(item.name)"
                       class="tag border-none"
                       selected
                       :deletable="!props.disabled"
                       @delete="handleTagDelete(idx)"
                >
                    <div class="member-menu-item h-4">
                        <p-avatar v-if="checkUserGroup(item.name)"
                                  icon="ic_member"
                                  :color="indigo[300]"
                                  size="xs"
                        />
                        <p-avatar v-else
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
                              size="xs"
                    />
                </div>
                <p class="label truncate">
                    {{ item.label }}
                </p>
                <p class="text-gray-500">
                    <span v-if="checkUserGroup(item.name)">({{ item?.members || 0 }} {{ $t('ALERT_MANAGER.ALERTS.MEMBERS') }})</span>
                    <span v-else-if="item?.userName">({{ item?.userName }})</span>
                </p>
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
