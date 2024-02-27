<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PI, PLazyImg,
} from '@spaceone/design-system';

import { assetUrlConverter } from '@/lib/helper/asset-helper';
import getRandomId from '@/lib/random-id-generator';

import LSBMenuItem from '@/common/modules/navigations/lsb/modules/LSBMenuItem.vue';
import type {
    BackLink, LSBMenu, TopTitle,
} from '@/common/modules/navigations/lsb/type';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lsb/type';

interface Props {
    backLink?: BackLink;
    topTitle?: TopTitle;
    menuSet: LSBMenu[];
    hideHeader?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    backLink: () => ({}) as BackLink,
    topTitle: () => ({}) as TopTitle,
    menuSet: () => [],
});
const emit = defineEmits<{(e: 'select', id: string, selected: string|number): void;
}>();
const route = useRoute();
const state = reactive({
    currentPath: computed(() => route.fullPath),
});
const handleSelect = (id: string, selected: string) => {
    emit('select', id, selected);
};

</script>

<template>
    <aside class="l-s-b">
        <div class="menu-wrapper">
            <router-link v-if="props.backLink.label"
                         class="back-link"
                         :to="props.backLink.to"
            >
                <p-i name="ic_chevron-left"
                     width="1rem"
                     height="1rem"
                     color="inherit transparent"
                />
                {{ props.backLink.label }}
            </router-link>
            <slot />
            <div v-if="props.topTitle.label"
                 class="top-title"
            >
                <div class="icon-label-wrapper">
                    <p-lazy-img
                        v-if="props.topTitle.icon"
                        :src="assetUrlConverter(props.topTitle.icon)"
                        width="1.5rem"
                        height="1.5rem"
                        class="icon"
                    />
                    <span :class="{'icon-label': props.topTitle.icon}"
                          class="label"
                    >{{ props.topTitle.label }}</span>
                </div>
                <router-link v-if="props.topTitle.visibleAddButton"
                             :to="props.topTitle.addButtonLink"
                >
                    <p-i name="ic_plus"
                         width="1rem"
                         height="1rem"
                         class="add-button"
                    />
                </router-link>
            </div>
            <template v-for="(menuData, idx) in props.menuSet">
                <div v-if="menuData.type === MENU_ITEM_TYPE.SLOT"
                     :key="`${idx}-${getRandomId()}`"
                     class="slot-menu-wrapper"
                >
                    <slot :name="`slot-${menuData.id}`"
                          v-bind="menuData"
                    />
                </div>
                <l-s-b-menu-item v-else
                                 :key="`${idx}-${getRandomId()}`"
                                 :menu-data="menuData"
                                 :current-path="state.currentPath"
                                 :depth="Array.isArray(menuData) ? 2 : 1"
                                 @select="handleSelect"
                >
                    <template v-for="(_, slot) of $scopedSlots"
                              #[slot]="scope"
                    >
                        <slot :name="slot"
                              v-bind="scope"
                        />
                    </template>
                </l-s-b-menu-item>
            </template>
        </div>
    </aside>
</template>

<style lang="postcss" scoped>
.l-s-b {
    .menu-wrapper {
        padding: 1.25rem 0.5rem 2rem;
    }
    .back-link {
        @apply flex text-gray-500;
        font-size: 0.75rem;
        line-height: 125%;
        margin-top: 1.25rem;
        height: 1.75rem;
        &:hover {
            @apply text-gray-800 cursor-pointer;
            text-decoration: underline;
        }
    }
    .slot-menu-wrapper {
        @apply flex items-center;
        height: 2rem;
        margin-bottom: 0.5rem;
    }
    .top-title {
        @apply text-gray-800 font-bold flex justify-between items-center;
        font-size: 0.75rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        padding-left: 0.5rem;
        .icon-label-wrapper {
            @apply flex items-center;
            height: 2rem;
            .icon {
                @apply rounded flex-shrink-0;
                margin-right: 0.375rem;
            }
            .label {
                &.icon-label {
                    font-size: 0.875rem;
                }
            }
        }
        .add-button {
            @apply cursor-pointer;
            height: 2rem;
        }
    }
}
</style>
