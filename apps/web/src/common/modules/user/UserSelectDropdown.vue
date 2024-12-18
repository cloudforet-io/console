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

import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { UserGroupReferenceMap } from '@/store/reference/user-group-reference-store';
import type { UserReferenceMap } from '@/store/reference/user-reference-store';

import type { SelectedUserDropdownIdsType } from '@/common/modules/user/typte';

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
     selectedId?: SelectedUserDropdownIdsType;
     selectedIds?: SelectedUserDropdownIdsType[];
     selectionType?: 'single'|'multiple';
     useFixedMenuStyle?: boolean;
     invalid?: boolean;
     disabled?: boolean;
     readonly?: boolean;
     userPool?: string[];
     appearanceType?: 'badge'|'stack';
     showUserList?: boolean;
     showUserGroupList?: boolean;
     showCategoryTitle?: boolean;
}>(), {
    selectedId: undefined,
    selectedIds: undefined,
    selectionType: 'single',
    useFixedMenuStyle: false,
    invalid: false,
    disabled: false,
    userPool: undefined,
    appearanceType: 'badge',
    showUserList: true,
    showUserGroupList: true,
    showCategoryTitle: true,
});

const emit = defineEmits<{(event: 'update:selected-ids', value: SelectedUserDropdownIdsType[]): void;
    (event: 'update:selected-id', value?: SelectedUserDropdownIdsType): void;
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
        if (props.userPool && props.userPool.length > 0) {
            return props.userPool.map((userId) => ({
                name: userId,
                label: storeState.userReferenceMap[userId]?.label ?? userId,
            }));
        }
        return Object.values(storeState.userReferenceMap).map((u: UserReferenceMap[string]) => ({
            name: u.key,
            label: u.key,
            userName: u.name,
        }));
    }),
    allUserGroupItems: computed<DropdownItem[]>(() => {
        if (!props.showUserGroupList) return [];
        return Object.values(storeState.userGroupReferenceMap).map((u: UserGroupReferenceMap[string]) => ({
            name: u.key,
            label: u.label,
            members: u.data.users?.length,
        }));
    }),
    selectedItems: [] as SelectDropdownMenuItem[],
});

const menuItemsHandler = (): AutocompleteHandler => async (keyword: string, pageStart = 1, pageLimit = 10, filters, resultIndex) => {
    const _totalCount = pageStart - 1 + pageLimit;
    const filterItems = (items: DropdownItem[]) => items.filter((item) => getTextHighlightRegex(keyword).test(item.name)).slice(pageStart - 1, _totalCount);

    if (resultIndex === undefined) {
        return state.dropdownCategories.map((c, idx) => {
            const items = c.key === 'user' ? state.allUserItems : state.allUserGroupItems;
            const _slicedItems = filterItems(items);
            if (props.showCategoryTitle) {
                _slicedItems.unshift({ type: 'header', label: c.title, name: 'header' });
            }
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
        const items = c.key === 'user' ? state.allUserItems : state.allUserGroupItems;
        const _slicedItems = filterItems(items);
        if (i !== resultIndex) return { results: [], title: c.title };
        return {
            results: _slicedItems,
            more: _totalCount < items.length,
        };
    });
};

const currentUserIds = computed<SelectedUserDropdownIdsType[]>(() => state.selectedItems.map((item) => ({ value: item.name, type: checkUserGroup(item.name) ? 'USER_GROUP' : 'USER' })));
const currentUserId = computed<SelectedUserDropdownIdsType|undefined>(() => ({ value: state.selectedItems[0]?.name, type: checkUserGroup(state.selectedItems[0]?.name) ? 'USER_GROUP' : 'USER' }));

const handleUpdateSelectedUserItems = (selectedUsers: SelectDropdownMenuItem[]) => {
    if (isEqual(selectedUsers, state.selectedItems)) return; // prevent unnecessary update
    state.selectedItems = selectedUsers; // it updates currentUserId and currentUserIds automatically
    if (props.selectionType === 'single') {
        if (currentUserId?.value === props.selectedId) return; // prevent unnecessary update
        emit('update:selected-id', currentUserId?.value);
    } else {
        if (isEqual(currentUserIds.value, props.selectedIds)) return; // prevent unnecessary update
        emit('update:selected-ids', currentUserIds.value);
    }
};
const handleTagDelete = (idx: number) => {
    state.selectedItems.splice(idx, 1);
    emit('update:selected-ids', currentUserIds.value);
};
const initSingleType = (_userId?: SelectedUserDropdownIdsType) => {
    if (currentUserId?.value !== _userId?.value) {
        state.selectedItems = _userId?.value
            ? [{ name: _userId?.value, label: storeState.userReferenceMap[_userId?.value]?.label ?? _userId?.value }]
            : [];
    }
};
const initMultipleType = (_userIds?: SelectedUserDropdownIdsType[]) => {
    if (!Array.isArray(_userIds)) throw new Error('userIds should be an array');
    if (!isEqual(currentUserIds.value, _userIds)) {
        state.selectedItems = _userIds.map((userId) => ({
            name: userId.value,
            label: storeState.userReferenceMap[userId.value]?.label ?? userId.value,
        }));
    }
};
const checkUserGroup = (id: string): boolean => state.allUserGroupItems.some((i) => i.name === id);

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
    <p-select-dropdown show-select-marker
                       class="user-select-dropdown"
                       :selected="state.selectedItems"
                       :handler="menuItemsHandler()"
                       is-filterable
                       :invalid="props.invalid"
                       :disabled="props.disabled"
                       :readonly="props.readonly"
                       page-size="10"
                       :use-fixed-menu-style="props.useFixedMenuStyle"
                       show-delete-all-button
                       :multi-selectable="props.selectionType === 'multiple'"
                       :appearance-type="props.appearanceType"
                       @update:selected="handleUpdateSelectedUserItems"
    >
        <template v-if="props.appearanceType === 'stack'"
                  #dropdown-button
        >
            <div class="flex flex-wrap py-1 gap-y-2">
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
                <span>{{ item.label }}</span>
                <span class="text-gray-500">
                    <span v-if="checkUserGroup(item.name)">({{ item?.members || 0 }} {{ $t('ALERT_MANAGER.ALERTS.MEMBERS') }})</span>
                    <span v-else-if="item?.userName">({{ item?.userName }})</span>
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
