<template>
    <div class="sitemap-container" :class="{'disabled': disabled}">
        <div class="sitemap-button" :class="visible ? 'visible' : ''" @click="toggleMenu">
            <p-i class="sitemap-icon" :name="visible ? 'ic_delete' : 'ic_gnb_menu'"
                 color="inherit"
                 width="2rem" height="2rem"
            />
        </div>
        <div v-if="visible" v-click-outside="hideMenu" class="sitemap">
            <ul v-for="(menu, aIdx) in siteMapMenuList"
                :key="aIdx"
            >
                <template v-if="menu.show !== false">
                    <router-link :to="menu.to">
                        <li class="menu" @click="hideMenu">
                            <p-i :name="menu.icon"
                                 color="inherit inherit"
                                 height="1.5rem" width="1.5rem"
                            /> {{ menu.label }}
                        </li>
                    </router-link>
                    <div v-if="menu.subMenuList && menu.subMenuList.length > 0">
                        <div v-for="(subMenu, sIdx) in menu.subMenuList"
                             :key="sIdx"
                        >
                            <div v-if="subMenu.show !== false">
                                <router-link v-if="subMenu" :to="subMenu.to">
                                    <li class="submenu" @click="hideMenu">
                                        {{ subMenu.label }}
                                        <new-mark v-if="subMenu.isNew" />
                                        <beta-mark v-if="subMenu.isBeta" />
                                    </li>
                                </router-link>
                            </div>
                        </div>
                    </div>
                </template>
            </ul>
        </div>
    </div>
</template>

<script lang="ts">

import {
    reactive, toRefs, computed, getCurrentInstance, ComponentRenderProxy, PropType,
} from '@vue/composition-api';

import { PI } from '@spaceone/design-system';
import vClickOutside from 'v-click-outside';

import { GNBMenu } from '@/store/modules/display/type';

import BetaMark from '@/common/components/marks/BetaMark.vue';
import NewMark from '@/common/components/marks/NewMark.vue';

import { DASHBOARD_ROUTE } from '@/services/dashboard/route-config';

export default {
    name: 'SiteMap',
    components: {
        BetaMark,
        NewMark,
        PI,
    },
    directives: {
        clickOutside: vClickOutside.directive,
    },
    props: {
        disabled: {
            type: Boolean,
            default: false,
        },
        visible: {
            type: Boolean,
            default: false,
        },
        menuList: {
            type: Array as PropType<GNBMenu[]>,
            default: () => ([]),
        },
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance()?.proxy as ComponentRenderProxy;
        const state = reactive({
            siteMapMenuList: computed<GNBMenu[]>(() => ([
                {
                    id: DASHBOARD_ROUTE._NAME,
                    label: vm.$t('MENU.DASHBOARD'),
                    to: { name: DASHBOARD_ROUTE._NAME },
                    subMenuList: [],
                },
                ...props.menuList,
            ])),
        });

        const hideMenu = () => {
            emit('update:visible', false);
        };
        const toggleMenu = () => {
            if (!props.disabled) {
                emit('update:visible', !props.visible);
            }
        };

        return {
            ...toRefs(state),
            hideMenu,
            toggleMenu,
        };
    },
};
</script>

<style lang="postcss" scoped>
.sitemap-container {
    @apply relative;

    .sitemap-button {
        @apply text-gray-900;
        position: relative;
        cursor: pointer;
        text-decoration: none;
        &:hover, &.visible {
            @apply text-violet-600;
            .sitemap-icon {
                @apply bg-violet-200;
            }
        }
        .sitemap-icon {
            @apply rounded-full;
        }
    }
    .sitemap {
        @apply bg-white border border-gray-200 text-gray-900;
        position: absolute;
        top: 100%;
        left: 0;
        max-height: calc(100vh - 4rem);
        width: 15rem;
        font-size: 0.875rem;
        box-shadow: 0 0 14px rgba(0, 0, 0, 0.1);
        overflow-y: auto;
        z-index: 999;
        padding: 1.5rem 0;
        margin-left: -0.5rem;
        ul:first-child .menu {
            margin-top: 0;
        }
        li {
            @apply cursor-pointer;
            display: block;
            font-size: 0.875rem;
            &:hover {
                @apply text-violet-600;
                transition: color ease 0.4s;
                &.menu .p-i-icon {
                    @apply text-violet-600;
                    transition: color ease 0.4s;
                }
            }
            &.menu {
                @apply font-bold;
                line-height: 2rem;
                padding-left: 1.5rem;
                margin-top: 1.5rem;
                .p-i-icon {
                    @apply text-primary-dark;
                    margin-right: 0.25rem;
                }
            }
            &.submenu {
                @apply text-gray-500;
                line-height: 1.75rem;
                padding-left: 3.5rem;
                &:hover {
                    @apply text-violet-500;
                    transition: color ease 0.4s;
                }
            }
        }
    }

    &.disabled {
        .sitemap-button {
            cursor: not-allowed;
            opacity: 0.2;
            &:hover {
                @apply text-gray-900;
                opacity: 0.2;
            }
        }
    }
}
</style>
