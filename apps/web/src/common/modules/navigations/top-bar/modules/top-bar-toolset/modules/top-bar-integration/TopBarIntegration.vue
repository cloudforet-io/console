<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components';
import {
    computed, reactive,
} from 'vue';

import {
    PI, PTooltip,
} from '@cloudforet/mirinae';

import { store } from '@/store';

import TopBarIntegrationContextMenu
    from '@/common/modules/navigations/top-bar/modules/top-bar-toolset/modules/top-bar-integration/modules/TopBarIntegrationContextMenu.vue';

interface Props {
    visible: boolean
    menu: string
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    menu: '',
});

const emit = defineEmits<{(e: 'update:visible', value: boolean): void}>();

const state = reactive({
    isNoRoleUser: computed<boolean>(() => store.getters['user/isNoRoleUser']),
});

/* Util */
const setVisible = (visible: boolean) => {
    emit('update:visible', visible);
};
const showIntegrationMenu = () => {
    if (!props.visible) setVisible(true);
};
const hideIntegrationMenu = () => {
    if (props.visible) setVisible(false);
};

/* Event */
const handleIntegrationButtonClick = () => {
    if (state.isNoRoleUser) return;
    setVisible(!props.visible);
};

</script>

<template>
    <div v-on-click-outside="hideIntegrationMenu"
         class="top-bar-integration"
         @click.stop
         @keydown.esc="hideIntegrationMenu"
    >
        <p-tooltip :contents="props.menu"
                   position="bottom"
        >
            <span :class="{'menu-button': true, 'opened': props.visible}"
                  tabindex="0"
                  role="button"
                  @click.stop="handleIntegrationButtonClick"
                  @keydown.enter="showIntegrationMenu"
            >
                <p-i class="menu-icon"
                     :class="{ disabled: state.isNoRoleUser }"
                     name="ic_gnb_intigration"
                     color="inherit"
                     width="1.375rem"
                     height="1.375rem"
                />
            </span>
        </p-tooltip>
        <div v-show="props.visible"
             class="integration-content"
        >
            <top-bar-integration-context-menu @close="hideIntegrationMenu" />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.top-bar-integration {
    position: relative;

    .menu-button {
        @apply inline-flex items-center justify-center text-gray-500 rounded-full;
        width: 2rem;
        height: 2rem;
        line-height: $top-bar-height;
        cursor: pointer;

        &:hover {
            @apply text-blue-600 bg-blue-100;
        }

        &.opened {
            @apply text-blue-600 bg-blue-200;
        }

        .disabled {
            cursor: not-allowed;
        }
    }

    .integration-content {
        @apply absolute bg-white rounded-xs border border-gray-200;
        display: flex;
        flex-direction: column;
        width: 20rem;
        max-width: 27.5rem;
        min-height: auto;
        top: 100%;
        right: 0;
        box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.08);
        margin-right: -0.5rem;
        z-index: 1000;
    }
}
</style>
