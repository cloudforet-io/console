<template>
    <div class="lnb-menu-list">
        <div v-for="(item, idx) in processedMenuData"
             :key="item.id"
             class="lnb-menu-item"
        >
            <p v-if="item.type === MENU_ITEM_TYPE.TITLE"
               class="title-wrapper"
            >
                <span v-if="item.foldable"
                      class="title foldable"
                      @click="handleFoldableToggle"
                >{{ item.label }}</span>
                <span v-else
                      class="title"
                >{{ item.label }}</span>
                <slot name="title-right"
                      v-bind="$props"
                />
                <new-mark v-if="item.isNew" />
                <beta-mark v-if="item.isBeta" />
                <span v-if="item.foldable"
                      class="toggle-button"
                      @click="handleFoldableToggle"
                >
                    <p-i width="1rem"
                         height="1rem"
                         :name="isFolded ? 'ic_chevron-up' : 'ic_chevron-down'"
                         color="inherit transparent"
                    />
                </span>
            </p>
            <p v-else-if="item.type === MENU_ITEM_TYPE.TOP_TITLE"
               class="top-title-wrapper"
            >
                <span class="top-title">{{ item.label }}</span>
            </p>
            <div v-else-if="item.type === MENU_ITEM_TYPE.DROPDOWN"
                 class="select-options-wrapper"
            >
                <p-select-dropdown class="select-options-dropdown"
                                   :items="item.selectOptions.items"
                                   :selected="item.selectOptions.defaultSelected"
                                   @update:selected="handleSelect(item.id, $event)"
                />
            </div>
            <l-n-b-divider-menu-item v-else-if="item.type === MENU_ITEM_TYPE.DIVIDER && showMenu" />
            <l-n-b-router-menu-item v-else-if="item.type === MENU_ITEM_TYPE.ITEM && showMenu"
                                    :item="item"
                                    :depth="depth"
                                    :is-domain-owner="isDomainOwner"
                                    :idx="idx"
                                    :current-path="currentPath"
            >
                <template v-for="(_, slot) of $scopedSlots"
                          #[slot]="scope"
                >
                    <slot :name="slot"
                          v-bind="scope"
                    />
                </template>
            </l-n-b-router-menu-item>
        </div>
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import { PI, PSelectDropdown } from '@spaceone/design-system';

import { store } from '@/store';

import BetaMark from '@/common/components/marks/BetaMark.vue';
import NewMark from '@/common/components/marks/NewMark.vue';
import LNBDividerMenuItem from '@/common/modules/navigations/lnb/modules/LNBDividerMenuItem.vue';
import LNBRouterMenuItem from '@/common/modules/navigations/lnb/modules/LNBRouterMenuItem.vue';
import type { LNBMenu } from '@/common/modules/navigations/lnb/type';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lnb/type';

interface Props {
    menuData: LNBMenu;
    currentPath: string;
}

export default defineComponent<Props>({
    name: 'LNBMenuItem',
    components: {
        PI,
        PSelectDropdown,
        BetaMark,
        NewMark,
        LNBRouterMenuItem,
        LNBDividerMenuItem,
    },
    props: {
        menuData: {
            type: [Object, Array] as PropType<LNBMenu>,
            default: () => ({}),
        },
        currentPath: {
            type: String,
            default: undefined,
        },
        depth: {
            type: Number,
            default: 1,
        },
    },

    setup(props, { emit }) {
        const state = reactive({
            isDomainOwner: computed(() => store.getters['user/isDomainOwner']),
            processedMenuData: computed<LNBMenu>(() => (Array.isArray(props.menuData) ? props.menuData : [props.menuData])),
            isFolded: false,
            isFoldableMenu: computed(() => state.processedMenuData?.some((item) => item.foldable)),
            showMenu: computed(() => (state.isFoldableMenu && !state.isFolded) || !state.isFoldableMenu), // toggle menu
            hoveredItem: '',
        });

        const handleFoldableToggle = () => {
            state.isFolded = !state.isFolded;
        };

        const handleSelect = (id: string, selected: string) => {
            emit('select', id, selected);
        };

        return {
            ...toRefs(state),
            handleFoldableToggle,
            handleSelect,
            MENU_ITEM_TYPE,
        };
    },
});
</script>

<style lang="postcss" scoped>
.lnb-menu-item {
    .title-wrapper {
        @apply text-gray-400 font-bold inline-flex items-center;
        font-size: 0.75rem;
        line-height: 125%;
        padding-left: 0.5rem;
        height: 2rem;
        .title {
            &.foldable {
                &:hover {
                    @apply text-gray-800 cursor-pointer underline;
                }
            }
        }

        .toggle-button {
            &:hover {
                @apply text-gray-800 cursor-pointer;
            }
        }
    }
    .top-title-wrapper {
        @apply font-bold inline-flex items-center;
        font-size: 0.75rem;
        line-height: 125%;
        padding-top: 1.25rem;
        padding-left: 0.5rem;
        padding-bottom: 0.75rem;
    }
}
</style>
