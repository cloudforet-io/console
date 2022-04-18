<template>
    <nav class="lnb">
        <div class="header">
            {{ header }}
        </div>
        <p-divider class="divider" />
        <div class="menu-wrapper">
            <div v-if="backLink.label" class="back-link">
                <p-i name="ic_arrow_left" width="1rem" height="1rem"
                     color="inherit transparent"
                />
                {{ backLink.label }}
            </div>
            <slot />
            <div v-if="topTitle" class="top-title">
                <div class="icon-label-wrapper">
                    <p-lazy-img
                        v-if="topTitle.icon"
                        :src="assetUrlConverter(topTitle.icon)"
                        width="1.5rem" height="1.5rem"
                        class="icon"
                    />
                    <span :class="{'icon-label': topTitle.icon}" class="label">{{ topTitle.label }}</span>
                </div>
                <p-i v-if="topTitle.visibleAddButton" name="ic_plus" width="1rem"
                     height="1rem" class="add-button"
                />
            </div>
            <template v-for="(menuData, idx) in SampleData.menuItems">
                <l-n-b-menu-item :key="menuData[idx].id" :has-top-title="!!topTitle" :menu-data="menuData"
                                 :selected-item="selectedItem"
                                 @click-menu="setSelectedItem"
                >
                    <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                        <slot :name="slot" v-bind="scope" />
                    </template>
                </l-n-b-menu-item>
            </template>
        </div>
    </nav>
</template>

<script lang="ts">
import LNBMenuItem from '@/common/modules/navigations/lnb/modules/LNBMenuItem.vue';
import {
    PDivider, PI, PLazyImg,
} from '@spaceone/design-system';
import { assetUrlConverter } from '@/lib/helper/asset-helper';
import { reactive, toRefs } from '@vue/composition-api';
import {
    BackLink, LNBItemList, LNBItem, TopTitle,
} from '@/common/modules/navigations/lnb/type';

const SampleData = {
    menuItems: [
        [
            {
                type: 'title', label: 'Public', id: 'public', foldable: false,
            },
            {
                type: 'item',
                id: 'monthlyCostSummary',
                label: 'Monthly Cost Summary',
                to: { name: 'route..' },
            },
            {
                type: 'item', label: 'Budget Summary', id: 'budgetSummary', to: { name: 'route..' },
            },
            { type: 'divider' },
        ],
        [
            {
                type: 'title', label: 'My Dashboard', id: 'myDashboard', foldable: true,
            },
            {
                type: 'item',
                id: 'myProject',
                label: 'My Project',
                to: { name: 'route..' },
            },
            {
                type: 'item', label: 'Megazone Cloud', id: 'megazone', to: { name: 'route..' },
            },
        ],
    ],
};

export default {
    name: 'LNB',
    components: {
        LNBMenuItem, PDivider, PI, PLazyImg,
    },
    props: {
        header: {
            type: String,
            default: '',
        },
        backLink: {
            type: Object as () => BackLink,
            default: () => ({}),
        },
        topTitle: {
            type: Object as () => TopTitle,
            default: () => ({}),
        },
        menu: {
            type: Array as () => LNBItemList[],
            default: () => [],
        },
    },

    setup() {
        const state = reactive({
            selectedItem: {} as LNBItem,
        });
        const setSelectedItem = (item: LNBItem) => {
            state.selectedItem = item;
        };
        return {
            ...toRefs(state),
            setSelectedItem,
            SampleData,
            assetUrlConverter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.lnb {
    .header {
        @apply font-bold;
        padding-left: 1.25rem;
        padding-top: 1.5rem;
        padding-bottom: 1.5rem;
        font-size: 1rem;
        line-height: 125%;
    }
    .menu-wrapper {
        padding-left: 1.25rem;
        padding-right: 1.25rem;
    }
    .divider {
        margin-bottom: 1.25rem;
    }
    .back-link {
        @apply flex text-gray-500;
        font-size: 0.75rem;
        line-height: 125%;
        padding-left: 0.875rem;
        &:hover {
            @apply text-gray-800 cursor-pointer;
            text-decoration: underline;
        }
    }
    .top-title {
        @apply text-gray-800 font-bold flex justify-between items-center;
        font-size: 0.75rem;
        line-height: 125%;
        margin-bottom: 0.75rem;
        .icon-label-wrapper {
            @apply flex items-center;
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
        }
    }
}
</style>
