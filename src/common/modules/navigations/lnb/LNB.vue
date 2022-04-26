<template>
    <nav class="lnb">
        <div class="header">
            {{ header }}
        </div>
        <p-divider class="divider" />
        <div class="menu-wrapper">
            <router-link v-if="backLink.label" class="back-link"
                         :to="backLink.to"
            >
                <p-i name="ic_arrow_left" width="1rem" height="1rem"
                     color="inherit transparent"
                />
                {{ backLink.label }}
            </router-link>
            <slot />
            <div v-if="topTitle.label" class="top-title">
                <div class="icon-label-wrapper">
                    <p-lazy-img
                        v-if="topTitle.icon"
                        :src="assetUrlConverter(topTitle.icon)"
                        width="1.5rem" height="1.5rem"
                        class="icon"
                    />
                    <span :class="{'icon-label': topTitle.icon}" class="label">{{ topTitle.label }}</span>
                </div>
                <router-link v-if="topTitle.visibleAddButton" :to="topTitle.addButtonLink">
                    <p-i name="ic_plus" width="1rem"
                         height="1rem" class="add-button"
                    />
                </router-link>
            </div>
            <l-n-b-menu-item v-for="(menuData, idx) in menuSet" :key="`${idx}-${getUUID()}`" :menu-data="menuData"
                             :current-route="currentRoute"
                             :depth="Array.isArray(menuData) ? 2 : 1"
            >
                <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                    <slot :name="slot" v-bind="scope" />
                </template>
            </l-n-b-menu-item>
        </div>
    </nav>
</template>

<script lang="ts">
import LNBMenuItem from '@/common/modules/navigations/lnb/modules/LNBMenuItem.vue';
import {
    PDivider, PI, PLazyImg,
} from '@spaceone/design-system';
import { assetUrlConverter } from '@/lib/helper/asset-helper';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import {
    BackLink, LNBMenu, TopTitle,
} from '@/common/modules/navigations/lnb/type';
import { getUUID } from '@/lib/component-util/getUUID';

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
        menuSet: {
            type: Array as () => LNBMenu[],
            default: () => [],
        },
    },

    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            currentRoute: computed(() => ({ name: vm.$route.name, params: vm.$route.params })),
        });

        return {
            ...toRefs(state),
            assetUrlConverter,
            getUUID,
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
        padding-left: 0.75rem;
        padding-right: 0.75rem;
        padding-bottom: 2rem;
    }
    .divider {
        margin-bottom: 1.25rem;
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
    .top-title {
        @apply text-gray-800 font-bold flex justify-between items-center;
        font-size: 0.75rem;
        padding-left: 0.5rem;
        .icon-label-wrapper {
            @apply flex items-center;
            height: 2.5rem;
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
