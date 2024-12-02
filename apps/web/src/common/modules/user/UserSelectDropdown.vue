<script setup lang="ts">
import type { Ref } from 'vue';
import {
    ref, computed, toRef, watch,
} from 'vue';

import { isEqual } from 'lodash';

import { PSelectDropdown, getTextHighlightRegex } from '@cloudforet/mirinae';
import type { AutocompleteHandler, SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { UserReferenceMap } from '@/store/reference/user-reference-store';
import { useUserReferenceStore } from '@/store/reference/user-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface UserDropdownItem extends SelectDropdownMenuItem {
    name: string;
    label: string;
}

const props = withDefaults(defineProps<{
     userId?: string;
     userIds?: string[];
     selectionType?: 'single'|'multiple';
     useFixedMenuStyle?: boolean;
     invalid?: boolean;
     disabled?: boolean;
     userPool?: string[];
}>(), {
    userId: '',
    userIds: () => [],
    selectionType: 'single',
    useFixedMenuStyle: false,
    invalid: false,
    disabled: false,
    userPool: undefined,
});

const emit = defineEmits<{(event: 'update:user-ids', value: string[]): void;
    (event: 'update:user-id', value: string): void;
}>();

const userReferenceStore = useUserReferenceStore();
const loading = computed(() => userReferenceStore.getters.loading);
const userReferenceMap: Ref<Readonly<UserReferenceMap>> = toRef(userReferenceStore.getters, 'userItems');
const allUserItems = computed<UserDropdownItem[]>(() => {
    if (props.userPool && props.userPool.length > 0) {
        return props.userPool.map((userId) => ({
            name: userId,
            label: userReferenceMap.value[userId]?.label ?? userId,
        }));
    }
    return Object.values(userReferenceMap.value).map((u: UserReferenceMap[string]) => ({
        name: u.key,
        label: u.label,
    }));
});
const selectedUserItems = ref<SelectDropdownMenuItem[]>([]);
const userMenuItemsHandler: AutocompleteHandler = async (keyword: string, pageStart = 1, pageLimit = 10) => {
    const filteredItems = allUserItems.value.filter((item) => getTextHighlightRegex(keyword).test(item.label));
    const _totalCount = pageStart - 1 + pageLimit;
    const _slicedResults = filteredItems.slice(pageStart - 1, _totalCount);
    return {
        results: _slicedResults,
        more: _totalCount < filteredItems.length,
    };
};

const currentUserIds = computed<string[]>(() => selectedUserItems.value.map((item) => item.name));
const currentUserId = computed<string | undefined>(() => currentUserIds.value[0]);

const handleUpdateSelectedUserItems = (selectedUsers: SelectDropdownMenuItem[]) => {
    if (isEqual(selectedUsers, selectedUserItems.value)) return; // prevent unnecessary update
    selectedUserItems.value = selectedUsers; // it updates currentUserId and currentUserIds automatically
    if (props.selectionType === 'single') {
        if (currentUserId.value === props.userId) return; // prevent unnecessary update
        emit('update:user-id', selectedUsers[0]?.name ?? '');
    } else {
        if (isEqual(currentUserIds.value, props.userIds)) return; // prevent unnecessary update
        emit('update:user-ids', currentUserIds.value);
    }
};
const initSingleType = (_userId?: string) => {
    if (currentUserId.value === _userId) {
        return;
    }
    selectedUserItems.value = _userId ? [{
        name: _userId,
        label: userReferenceMap.value[_userId]?.label ?? _userId,
    }] : [];
};
const initMultipleType = (_userIds?: string[]) => {
    try {
        if (!Array.isArray(_userIds)) {
            throw new Error('userIds should be an array');
        }
        if (isEqual(currentUserIds.value, _userIds)) {
            return;
        }
        selectedUserItems.value = _userIds.map((userId) => ({
            name: userId,
            label: userReferenceMap.value[userId]?.label ?? userId,
            selected: true,
        }));
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

watch([loading, () => props.userId, () => props.userIds], ([_loading, newUserId, newUserIds]) => {
    if (_loading) return;
    if (props.selectionType === 'single') {
        if (currentUserId.value === newUserId) return; // prevent infinite loop
        initSingleType(newUserId);
    } else {
        if (isEqual(currentUserIds.value, newUserIds)) return; // prevent infinite loop
        initMultipleType(newUserIds);
    }
}, { immediate: true });
</script>

<template>
    <p-select-dropdown show-select-marker
                       :selected="selectedUserItems"
                       :handler="userMenuItemsHandler"
                       is-filterable
                       :invalid="props.invalid"
                       :disabled="props.disabled"
                       :use-fixed-menu-style="useFixedMenuStyle"
                       show-delete-all-button
                       :multi-selectable="props.selectionType === 'multiple'"
                       appearance-type="badge"
                       @update:selected="handleUpdateSelectedUserItems"
    />
</template>
