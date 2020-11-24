<template>
    <div class="menu-container">
        <div class="left-part">
            <div class="site-map-wrapper">
                <site-map :is-domain-owner="userState.isDomainOwner" :visible.sync="sitemapVisible" />
            </div>
            <router-link to="/dashboard">
                <div class="logo-wrapper">
                    <img class="brand-logo" src="@/assets/images/brand/brand_logo.svg">
                    <img class="brand-logo-text hidden lg:inline-block"
                         src="@/assets/images/brand/SpaceONE_logoTypeA.svg"
                    >
                </div>
            </router-link>
            <div v-for="(dItem, idx) in defaultMenuList"
                 :key="idx"
                 class="menu-wrapper hidden lg:inline-block"
            >
                <template v-if="dItem.show !== false">
                    <div class="menu-button opacity mr-4 lg:mr-8"
                         :class="[{
                             opened: dItem.menu.length > 0 && openedMenu === dItem.key,
                             selected: dItem.parentRoutes.includes(selectedMenu)
                         }]"
                         @click.stop="toggleMenu(dItem.key)"
                    >
                        <span v-if="dItem.menu.length > 0">
                            <span>{{ dItem.key }}</span>
                            <p-i class="arrow-button"
                                 :name="openedMenu === dItem.key ? 'ic_arrow_top_sm' : 'ic_arrow_bottom_sm'"
                                 width="0.5rem" height="0.5rem"
                                 color="inherit transparent"
                            />
                        </span>
                        <router-link v-else :to="dItem.link" class="block">
                            <span>{{ dItem.key }}</span>
                        </router-link>
                    </div>
                    <p-context-menu
                        v-if="openedMenu === dItem.key && dItem.menu.length > 0"
                        v-click-outside="hideMenu"
                        :menu="dItem.menu" theme="white"
                    >
                        <template #item-plugin>
                            <div v-if="!userState.isDomainOwner" class="empty" />
                        </template>
                        <template #item--format="{item}">
                            <router-link :to="item.link" @click.native="hideMenu">
                                <div>
                                    <span>{{ item.label }}</span>
                                    <span v-if="item.isNew" class="new-text">new</span>
                                </div>
                            </router-link>
                        </template>
                    </p-context-menu>
                </template>
            </div>
        </div>

        <div class="right-part">
            <div class="menu-wrapper">
                <div class="menu-button opacity"
                     :class="{opened: openedMenu === 'support'}"
                     @click.stop="toggleMenu('support')"
                >
                    <p-i class="menu-icon"
                         name="ic_support"
                         color="inherit transparent"
                    />
                </div>
                <p-context-menu
                    v-if="openedMenu === 'support'"
                    v-click-outside="hideMenu"
                    class="right-align"
                    :menu="supportMenu" theme="white"
                >
                    <template #item--format="{item}" />
                </p-context-menu>
            </div>
            <div class="menu-wrapper account ml-6">
                <div class="menu-button account"
                     @click.stop="toggleMenu('account')"
                >
                    <div class="menu-icon"
                         :class="[{opened: openedMenu === 'account'}, userState.isDomainOwner ? 'admin' : 'member']"
                    />
                </div>
                <p-context-menu
                    v-if="openedMenu === 'account'"
                    v-click-outside="hideMenu"
                    class="white right-align"
                    :menu="accountMenu"
                    theme="white"
                >
                    <template #info--format>
                        <div class="context-info">
                            <p-i v-if="userState.isDomainOwner" class="icon" name="admin" />
                            <p-i v-else class="icon" name="user" />
                            <span class="value">{{ userState.email }}</span>
                        </div>
                        <div class="context-info">
                            <span class="label">{{ $t('COMMON.GNB.ACCOUNT.LABEL_ROLE') }}</span>
                            <span v-if="userState.isDomainOwner" class="value">{{ $t('COMMON.GNB.ACCOUNT.ROLE_ROOT_ADMIN') }}</span>
                            <span v-else class="value">{{ $t('COMMON.GNB.ACCOUNT.ROLE_DOMAIN_ADMIN') }}</span>
                        </div>
                        <div class="context-info">
                            <span class="label">{{ $t('COMMON.GNB.ACCOUNT.LABEL_TIMEZONE') }}</span>
                            <span class="value">{{ userState.timezone }}</span>
                        </div>
                        <div class="context-info">
                            <span class="label">{{ $t('COMMON.GNB.ACCOUNT.LABEL_LANGUAGE') }}</span>
                            <span class="value">{{ userState.language }}</span>
                        </div>
                    </template>
                    <template #divider>
                        <div class="border" />
                    </template>
                    <template #item--format="{item}">
                        <div v-if="item.name === 'profile'">
                            <div @click="openProfile">
                                {{ item.label }}
                            </div>
                        </div>
                        <div v-else>
                            <div @click="logOut">
                                {{ item.label }}
                            </div>
                        </div>
                    </template>
                </p-context-menu>
            </div>
        </div>
        <profile-modal v-if="profileVisible"
                       :visible.sync="profileVisible"
                       :user-id="userState.userId"
        />
    </div>
</template>

<script lang="ts">
import vClickOutside from 'v-click-outside';

import {
    reactive, toRefs, computed, getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';

import ProfileModal from '@/views/common/components/profile/ProfileModal.vue';
import SiteMap from '@/views/common/components/gnb/SiteMap.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PContextMenu from '@/components/organisms/context-menu/PContextMenu.vue';

import { store } from '@/store';
import router from '@/routes/index';

export default {
    name: 'GNB',
    components: {
        PI,
        ProfileModal,
        PContextMenu,
        SiteMap,
    },
    directives: {
        clickOutside: vClickOutside.directive,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const userState = reactive({
            name: computed(() => store.state.user.name),
            email: computed(() => store.state.user.email),
            language: computed(() => store.getters['user/languageLabel']),
            timezone: computed(() => store.state.user.timezone),
            userId: computed(() => store.state.user.userId),
            isDomainOwner: computed(() => store.getters['user/isDomainOwner']),
        });
        const state = reactive({
            openedMenu: null,
            sitemapVisible: false,
            profileVisible: false,
            showAutomation: store.state.user.powerSchedulerState,
            defaultMenuList: computed(() => [
                {
                    key: vm.$t('MENU.PROJECT.PROJECT'),
                    link: '/project',
                    parentRoutes: ['project'],
                    menu: [],
                },
                {
                    key: vm.$t('MENU.INVENTORY.INVENTORY'),
                    link: '/inventory',
                    parentRoutes: ['inventory'],
                    menu: [
                        {
                            type: 'item', label: vm.$t('MENU.INVENTORY.SERVER'), name: 'server', link: '/inventory/server',
                        },
                        {
                            type: 'item', label: vm.$t('MENU.INVENTORY.CLOUD_SERVICE'), name: 'cloud-service', link: '/inventory/cloud-service',
                        },
                    ],
                },
                {
                    key: vm.$t('MENU.IDENTITY.IDENTITY'),
                    link: '/identity',
                    parentRoutes: ['identity'],
                    menu: [
                        {
                            type: 'item', label: vm.$t('MENU.IDENTITY.SERVICE_ACCOUNT'), name: 'service-account', link: '/identity/service-account',
                        },
                        {
                            type: 'item', label: vm.$t('MENU.IDENTITY.USER'), name: 'user', link: '/identity/user',
                        },
                        // {
                        //     type: 'item', label: vm.$t('MENU.IDENTITY.ROLE'), name: 'role', disabled: true, link: '',
                        // },
                    ],
                },
                {
                    key: vm.$t('MENU.AUTOMATION.AUTOMATION'),
                    show: state.showAutomation,
                    link: '/automation',
                    parentRoutes: ['automation'],
                    menu: [
                        {
                            type: 'item', label: vm.$t('MENU.AUTOMATION.POWER_SCHEDULER'), name: 'power-scheduler', link: '/automation/power-scheduler', isNew: true,
                        },
                    ],
                },
                {
                    key: vm.$t('MENU.PLUGIN.PLUGIN'),
                    link: '/plugin',
                    parentRoutes: ['plugin'],
                    menu: [
                        {
                            type: 'item', label: vm.$t('MENU.PLUGIN.COLLECTOR'), name: 'collector', link: '/plugin/collector',
                        },
                    ],
                },
                {
                    key: vm.$t('MENU.MANAGEMENT.MANAGEMENT'),
                    link: '/management/collector-history',
                    parentRoutes: ['management'],
                    menu: [
                        {
                            type: 'item', label: vm.$t('MENU.MANAGEMENT.PLUGIN'), name: 'plugin', link: '/management/supervisor/plugins',
                        },
                        {
                            type: 'item', label: vm.$t('MENU.MANAGEMENT.COLLECTOR_HISTORY'), name: 'collector-history', link: '/management/collector-history', isNew: true,
                        },
                    ],
                },
            ]),
            supportMenu: computed(() => [
                {
                    type: 'item',
                    label: vm.$t('COMMON.GNB.SUPPORT.LABEL_USER_GUIDE'),
                    name: 'user-guide',
                    link: 'https://spaceone-dev.gitbook.io/user-guide/',
                    target: '_blank',
                },
                {
                    type: 'item',
                    label: vm.$t('COMMON.GNB.SUPPORT.LABEL_API_GUIDE'),
                    name: 'api-guide',
                    link: 'https://spaceone-dev.gitbook.io/spaceone-apis',
                    target: '_blank',
                },
                {
                    type: 'item',
                    label: vm.$t('COMMON.GNB.SUPPORT.LABEL_GITHUB'),
                    name: 'github',
                    link: 'https://github.com/spaceone-dev',
                    target: '_blank',
                },
            ]),
            accountMenu: computed(() => [
                {
                    type: 'info',
                },
                {
                    type: 'divider',
                },
                {
                    type: 'item', label: vm.$t('COMMON.GNB.ACCOUNT.LABEL_PROFILE'), name: 'profile',
                },
                {
                    type: 'item', label: vm.$t('COMMON.GNB.ACCOUNT.LABEL_LOGOUT'), name: 'logout',
                },
            ]),
            selectedMenu: computed(() => {
                const pathRegex = vm.$route.path.match(/\/(\w+)/);
                return pathRegex ? pathRegex[1] : null;
            }),
        });

        const hideMenu = () => {
            state.openedMenu = null;
        };
        const showMenu = (menu) => {
            state.openedMenu = menu;
            state.sitemapVisible = false;
        };
        const toggleMenu = (menu) => {
            if (state.openedMenu === menu) {
                hideMenu();
            } else {
                showMenu(menu);
            }
        };

        // account
        const openProfile = () => {
            state.profileVisible = true;
        };
        const logOut = () => {
            store.dispatch('user/signOut');
            const routerMeta: any = {
                name: userState.isDomainOwner ? 'AdminLogin' : 'Login',
            };
            if (router && router.currentRoute.path) {
                routerMeta.query = { nextPath: router.currentRoute.path };
            }
            if (router) {
                router.push(routerMeta);
            }
        };

        return {
            ...toRefs(state),
            userState,
            hideMenu,
            toggleMenu,
            openProfile,
            logOut,
        };
    },
};
</script>

<style lang="postcss" scoped>
.menu-container {
    @apply bg-white;
    display: flex !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);

    .left-part, .right-part {
        line-height: 3rem;
    }

    .left-part {
        .site-map-wrapper {
            display: inline-block;
            margin: 0 1rem;
        }
        .logo-wrapper {
            display: inline-block;
            margin-right: 1.5rem;

            .brand-logo {
                display: inline-block;
                width: 2rem;
                height: 2rem;
            }
            .brand-logo-text {
                height: 0.875rem;
                margin-left: 0.5rem;
            }
        }
    }

    .right-part {
        position: absolute;
        display: inline-flex;
        right: 0;
        padding-right: 1.5rem;
    }

    .menu-wrapper {
        position: relative;

        &.account {
            .p-context-menu {
                min-width: 15.125rem;
            }
            .menu-button {
                .menu-icon {
                    width: 2rem;
                    height: 2rem;
                    overflow: hidden;
                    background-size: cover;
                    box-shadow: inset 0 0 0 2px theme('colors.gray.200');
                    margin-top: 0.5rem;

                    &.admin {
                        background: url('~@/assets/icons/admin.svg') no-repeat center center;
                    }
                    &.member {
                        background: url('~@/assets/icons/user.svg') no-repeat center center;
                    }

                    &.opened {
                        box-shadow: inset 0 0 0 2px theme('colors.primary');
                    }
                }
            }
        }
        .menu-button {
            @apply text-gray-900;
            position: relative;
            font-size: .875rem;
            cursor: pointer;
            text-decoration: none;
            text-transform: capitalize;

            &.opacity {
                opacity: 0.5;
            }
            &.opened {
                @apply text-primary;
                opacity: 1;
            }
            &.selected {
                opacity: 1;
            }
            &:hover {
                @apply text-primary;
                opacity: 1;
            }

            .menu-icon {
                border-radius: 0.625rem;
            }
            .arrow-button {
                margin-left: 0.5rem;
            }
        }
        .p-context-menu {
            .border {
                @apply border-gray-200;
                border-top: none;
                margin: 0.5rem;
            }
            .context-info {
                line-height: 1.5rem;
                font-size: 0.75rem;
                padding: 0 0.5rem;

                &:first-child {
                    @apply text-primary;
                    font-size: 0.875rem;
                    padding: 0.75rem 0.5rem;
                }

                .icon {
                    border-radius: 0.625rem;
                    margin-right: 0.5rem;
                }
                .label {
                    @apply text-gray-500 font-bold;
                    padding-right: 0.5rem;
                }
            }
            .new-text {
                font-size: 0.75rem;
                background: linear-gradient(to right, theme('colors.primary'), 50%, theme('colors.secondary'));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                vertical-align: text-top;
                cursor: default;
                margin-left: 0.25rem;
            }
        }
    }
}
</style>
