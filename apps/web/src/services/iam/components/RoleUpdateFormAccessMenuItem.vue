<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { PIconButton, PI, PToggleButton } from '@spaceone/design-system';

import type { PageAccessMenuItem, UpdateFormDataType } from '@/services/iam/types/role-type';

interface Props {
    menu: PageAccessMenuItem;
    isSubMenu?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    menu: undefined,
    isSubMenu: false,
});

const emit = defineEmits<{(e: 'update', value: UpdateFormDataType): void,
}>();

const state = reactive({
    toggleState: false,
    isDisabled: computed(() => ((props.menu?.id === 'all') ? false : !props.menu?.subMenuList?.length)),
});

/* Components */
const handleToggleMenuVisible = () => {
    const isHideMenu = !props.menu.hideMenu;
    emit('update', { id: props.menu.id, val: props.menu.isAccessible, isHideMenu });
};
const handleChangeToggle = () => {
    const val = !props.menu.isAccessible;
    emit('update', { id: props.menu.id, val });
};

/* Watcher */
watch(() => props.menu.isAccessible, (isAccessible) => {
    state.toggleState = isAccessible;
}, { immediate: true });
</script>

<template>
    <div class="role-create-page-access-menu-item"
         :class="[menu.isParent ? 'parent' : '', menu.id]"
    >
        <div class="left-part"
             :class="{ 'is-only-main-menu': props.menu.id !== 'all' && props.menu.subMenuList?.length === 0}"
        >
            <p-icon-button v-if="props.menu.id === 'all' || props.menu.subMenuList?.length > 0"
                           :name="menu.hideMenu ? 'ic_caret-right' : 'ic_caret-down-filled-alt'"
                           size="sm"
                           :disabled="state.isDisabled"
                           @click="handleToggleMenuVisible"
            />
            <template v-for="(translationId, lIdx) in menu.translationIds">
                {{ $t(translationId) }}
                <p-i v-if="lIdx < menu.translationIds.length - 1"
                     :key="`label-${menu.translationIds.join('.')}-${lIdx}`"
                     name="ic_chevron-right-thin"
                     width="1rem"
                     height="1rem"
                />
            </template>
        </div>
        <div class="right-part"
             :class="props.isSubMenu ? 'sub-menu' : 'menu'"
        >
            <p-toggle-button :value="state.toggleState"
                             @change-toggle="handleChangeToggle"
            />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.role-create-page-access-menu-item {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;

    &.parent {
        padding: 0.75rem 0.5rem;
        .right-part {
            margin-right: 1rem;
        }
    }
    &.all {
        .right-part {
            margin-right: 0.5rem;
        }
    }
    .left-part {
        flex-grow: 1;
        &.is-only-main-menu {
            margin-left: 1.5rem;
        }
    }
    .right-part {
        display: flex;
        align-items: center;
    }
}
</style>
