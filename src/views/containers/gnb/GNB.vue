<template>
    <div class="menu-container">
        <div class="left">
            <div class="site-map-lap">
                <site-map :is-domain-owner="isDomainOwner" :visible.sync="sitemapVisible" />
            </div>
            <div class="logo-lap">
                <router-link to="/dashboard">
                    <img class="brand-logo" src="@/assets/images/brand/brand_logo.svg">
                    <img class="brand-logo-text hidden md:inline-block lg:inline-block"
                         src="@/assets/images/brand/SpaceONE_logoTypeA.svg"
                    >
                </router-link>
            </div>
            <div v-for="(dItem, idx) in defaultMenuList"
                 :key="idx"
                 class="menu-lap hidden md:inline-block lg:inline-block"
            >
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
                    <router-link v-else :to="dItem.link">
                        <span>{{ dItem.key }}</span>
                    </router-link>
                </div>
                <p-context-menu
                    v-if="openedMenu === dItem.key && dItem.menu.length > 0"
                    v-click-outside="hideMenu"
                    :menu="dItem.menu" theme="white"
                >
                    <template #item-plugin>
                        <div v-if="!isDomainOwner" class="empty" />
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
            </div>
        </div>

        <div class="right">
            <div class="menu-lap">
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
            <div class="menu-lap account ml-6">
                <div class="menu-button account"
                     @click.stop="toggleMenu('account')"
                >
                    <div class="menu-icon"
                         :class="[{opened: openedMenu === 'account'}, isDomainOwner ? 'admin' : 'member']"
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
                            <p-i v-if="isDomainOwner" class="icon" name="admin" />
                            <p-i v-else class="icon" name="user" />
                            <span class="value">{{ email }}</span>
                        </div>
                        <div class="context-info">
                            <span class="label">Role</span>
                            <span v-if="isDomainOwner" class="value">Root Admin</span>
                            <span v-else class="value">Domain Admin</span>
                        </div>
                        <div class="context-info">
                            <span class="label">Time zone</span>
                            <span class="value">{{ storeTimezone }}</span>
                        </div>
                        <div class="context-info">
                            <span class="label">Language</span>
                            <span class="value">{{ storeLanguage }}</span>
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
                            <div @click="logOutAction">
                                {{ item.label }}
                            </div>
                        </div>
                    </template>
                </p-context-menu>
            </div>
        </div>
        <profile-modal v-if="profileVisible"
                       :visible.sync="profileVisible"
                       :user-id="userId"
        />
    </div>
</template>

<script lang="ts">
import vClickOutside from 'v-click-outside';

import {
    reactive, toRefs, getCurrentInstance, computed, ComponentRenderProxy,
} from '@vue/composition-api';

import ProfileModal from '@/views/common/profile/ProfileModal.vue';
import SiteMap from '@/views/containers/gnb/modules/SiteMap.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PContextMenu from '@/components/organisms/context-menu/PContextMenu.vue';

import { fluentApi } from '@/lib/fluent-api';
import { useStore } from '@/store/toolset';

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
        const { user, logout } = useStore();
        const userState = reactive({
            name: '',
            email: '',
            language: '',
            timezone: '',
        });
        const state = reactive({
            openedMenu: null,
            sitemapVisible: false,
            defaultMenuList: [
                {
                    key: 'project',
                    link: '/project',
                    parentRoutes: ['project'],
                    menu: [],
                },
                {
                    key: 'inventory',
                    link: '/inventory',
                    parentRoutes: ['inventory'],
                    menu: [
                        {
                            type: 'item', label: 'Server', name: 'server', link: '/inventory/server',
                        },
                        {
                            type: 'item', label: 'Cloud Service', name: 'cloud-service', link: '/inventory/cloud-service',
                        },
                    ],
                },
                {
                    key: 'identity',
                    link: '/identity',
                    parentRoutes: ['identity'],
                    menu: [
                        {
                            type: 'item', label: 'Service Account', name: 'service-account', link: '/identity/service-account',
                        },
                        {
                            type: 'item', label: 'User', name: 'user', link: '/identity/user',
                        },
                        {
                            type: 'item', label: 'Role', name: 'role', disabled: true, link: '',
                        },
                    ],
                },
                {
                    key: 'plugin',
                    link: '/plugin',
                    parentRoutes: ['plugin'],
                    menu: [
                        {
                            type: 'item', label: 'Collector', name: 'collector', link: '/plugin/collector',
                        },
                    ],
                },
                {
                    key: 'management',
                    link: '/management/collector-history',
                    parentRoutes: ['management'],
                    menu: [
                        {
                            type: 'item', label: 'Plugin (admin)', name: 'plugin', link: '/management/supervisor/plugins',
                        },
                        {
                            type: 'item', label: 'Collector History', name: 'collector-history', link: '/management/collector-history', isNew: true,
                        },
                        // {
                        //     type: 'item', label: 'Power Scheduler', name: 'power-scheduler', link: '/management/power-scheduler', isNew: true,
                        // },
                    ],
                },
            ],
            supportMenu: [
                {
                    type: 'item',
                    label: 'User Guide',
                    name: 'user-guide',
                    link: 'https://spaceone-dev.gitbook.io/user-guide/',
                    target: '_blank',
                },
                {
                    type: 'item',
                    label: 'API Guide',
                    name: 'api-guide',
                    link: 'https://spaceone-dev.gitbook.io/spaceone-apis',
                    target: '_blank',
                },
                {
                    type: 'item',
                    label: 'GitHub',
                    name: 'github',
                    link: 'https://github.com/spaceone-dev',
                    target: '_blank',
                },
            ],
            accountMenu: [
                {
                    type: 'info',
                },
                {
                    type: 'divider',
                },
                {
                    type: 'item', label: 'Profile', name: 'profile',
                },
                {
                    type: 'item', label: 'Log out', name: 'logout',
                },
            ],
            // account
            profileVisible: false,
            userId: computed(() => user.state.userId),
            isDomainOwner: computed(() => user.state.isDomainOwner),
        });
        const selectedMenu = computed(() => {
            const pathRegex = vm.$route.path.match(/\/(\w+)/);
            return pathRegex ? pathRegex[1] : null;
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
        const getUser = async () => {
            let api;
            if (state.userId && state.isDomainOwner) {
                api = fluentApi.identity().domainOwner().get().setId(state.userId);
            } else if (state.userId) {
                api = fluentApi.identity().user().get().setId(state.userId);
            }
            try {
                const res = await api.execute();
                userState.name = res.data.name;
                userState.email = res.data.email;
                userState.language = res.data.language;
                userState.timezone = res.data.timezone;
                vm.$i18n.locale = res.data.language;
                user.sync(userState);
            } catch (e) {
                console.error(e);
            }
        };
        const openProfile = () => {
            state.profileVisible = true;
        };
        const logOutAction = async () => {
            await vm.$store.dispatch('user/signOut');
            logout(vm);
        };

        const init = async () => {
            await getUser();
        };
        init();

        return {
            ...toRefs(state),
            ...toRefs(userState),
            selectedMenu,
            hideMenu,
            toggleMenu,
            openProfile,
            logOutAction,
            storeTimezone: computed(() => user.state.timezone),
            storeLanguage: computed(() => user.state.language),
        };
    },
};
</script>

<style lang="postcss" scoped>
.menu-container {
    @apply bg-white;
    display: flex !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);

    .left, .right {
        line-height: 3rem;
    }

    .right {
        position: absolute;
        display: inline-flex;
        right: 0;
        padding-right: 1.5rem;
    }

    .site-map-lap {
        display: inline-block;
        margin: 0 1rem;
    }
    .menu-lap {
        position: relative;

        &.account {
            .p-context-menu {
                min-width: 15.125rem;
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

            &.account {
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
    .logo-lap {
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
</style>
