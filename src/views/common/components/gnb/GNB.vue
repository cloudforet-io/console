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
                        <div v-if="openedMenu === dItem.key && dItem.menu.length > 0"
                             v-click-outside="hideMenu"
                             class="sub-menu-wrapper"
                        >
                            <template v-for="(item, index) in dItem.menu" @click.native="hideMenu">
                                <router-link :key="index" :to="item.link">
                                    <div class="sub-menu">
                                        <span>{{ item.label }}</span>
                                        <span v-if="item.isNew" class="new-text">new</span>
                                    </div>
                                </router-link>
                            </template>
                        </div>
                    </div>
                </template>
            </div>
        </div>

        <div class="right-part">
            <div class="menu-wrapper support">
                <div class="menu-button opacity"
                     :class="{opened: openedMenu === 'support'}"
                     @click.stop="toggleMenu('support')"
                >
                    <p-i class="menu-icon"
                         name="ic_support"
                         color="inherit transparent"
                    />
                </div>
                <div v-if="openedMenu === 'support'"
                     v-click-outside="hideMenu"
                     class="sub-menu-wrapper right-align"
                >
                    <p-anchor v-for="(item, index) in supportMenu" :key="index"
                              :href="item.link" target="_blank"
                              :show-icon="false"
                              class="sub-menu"
                    >
                        <span>{{ item.label }}</span>
                        <p-i class="external-link-icon" name="ic_external-link"
                             width="0.875rem" height="0.875rem"
                        />
                    </p-anchor>
                </div>
            </div>
            <div class="menu-wrapper account ml-6">
                <div class="menu-button account"
                     @click.stop="toggleMenu('account')"
                >
                    <div class="menu-icon"
                         :class="[{opened: openedMenu === 'account'}, userState.isDomainOwner ? 'admin' : 'member']"
                    />
                </div>
                <div v-if="openedMenu === 'account'"
                     v-click-outside="hideMenu"
                     class="sub-menu-wrapper right-align account"
                >
                    <div class="info-wrapper">
                        <div class="info-row">
                            <p-i v-if="userState.isDomainOwner" class="icon" name="admin" />
                            <p-i v-else class="icon" name="user" />
                            <span class="value">{{ userState.email }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">{{ $t('COMMON.GNB.ACCOUNT.LABEL_ROLE') }}</span>
                            <span v-if="userState.isDomainOwner" class="value">{{ $t('COMMON.GNB.ACCOUNT.ROLE_ROOT_ADMIN') }}</span>
                            <span v-else class="value">{{ $t('COMMON.GNB.ACCOUNT.ROLE_DOMAIN_ADMIN') }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">{{ $t('COMMON.GNB.ACCOUNT.LABEL_TIMEZONE') }}</span>
                            <span class="value">{{ userState.timezone }}</span>
                        </div>
                        <div class="info-row language"
                             @click="toggleLanguageMenu"
                        >
                            <span class="label">{{ $t('COMMON.GNB.ACCOUNT.LABEL_LANGUAGE') }}</span>
                            <span class="value">{{ userState.language }}</span>
                            <p-i name="ic_arrow_bottom"
                                 width="1rem" height="1rem"
                            />
                            <div v-if="showLanguageMenu" class="sub-menu-wrapper">
                                <template v-for="(item, index) in languageMenu" @click.native="hideMenu">
                                    <div :key="index" class="sub-menu" @click="changeLanguage(item.name)">
                                        <span>{{ item.label }}</span>
                                    </div>
                                </template>
                            </div>
                        </div>
                        <p-hr />
                    </div>
                    <div class="sub-menu" @click="openProfile">
                        <span>{{ $t('COMMON.GNB.ACCOUNT.LABEL_PROFILE') }}</span>
                    </div>
                    <div class="sub-menu" @click="signOut">
                        <span>{{ $t('COMMON.GNB.ACCOUNT.LABEL_SIGN_OUT') }}</span>
                    </div>
                </div>
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
import PAnchor from '@/components/molecules/anchors/PAnchor.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PHr from '@/components/atoms/hr/PHr.vue';

import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import { Location } from 'vue-router';
import { store } from '@/store';
import { languages } from '@/store/modules/user/config';
import router from '@/routes/index';

export default {
    name: 'GNB',
    components: {
        PHr,
        PAnchor,
        PI,
        ProfileModal,
        SiteMap,
    },
    directives: {
        clickOutside: vClickOutside.directive,
    },
    setup(props, { root }) {
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
            showLanguageMenu: false,
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
                        { label: vm.$t('MENU.INVENTORY.SERVER'), link: '/inventory/server' },
                        { label: vm.$t('MENU.INVENTORY.CLOUD_SERVICE'), link: '/inventory/cloud-service' },
                    ],
                },
                {
                    key: vm.$t('MENU.IDENTITY.IDENTITY'),
                    link: '/identity',
                    parentRoutes: ['identity'],
                    menu: [
                        { label: vm.$t('MENU.IDENTITY.SERVICE_ACCOUNT'), link: '/identity/service-account' },
                        { label: vm.$t('MENU.IDENTITY.USER'), link: '/identity/user' },
                    ],
                },
                {
                    key: vm.$t('MENU.AUTOMATION.AUTOMATION'),
                    show: state.showAutomation,
                    link: '/automation',
                    parentRoutes: ['automation'],
                    menu: [
                        { label: vm.$t('MENU.AUTOMATION.POWER_SCHEDULER'), link: '/automation/power-scheduler', isNew: true },
                    ],
                },
                {
                    key: vm.$t('MENU.PLUGIN.PLUGIN'),
                    link: '/plugin',
                    parentRoutes: ['plugin'],
                    menu: [
                        { label: vm.$t('MENU.PLUGIN.COLLECTOR'), link: '/plugin/collector' },
                    ],
                },
                {
                    key: vm.$t('MENU.MANAGEMENT.MANAGEMENT'),
                    link: '/management/collector-history',
                    parentRoutes: ['management'],
                    menu: [
                        { label: vm.$t('MENU.MANAGEMENT.PLUGIN'), link: '/management/supervisor/plugins' },
                        { label: vm.$t('MENU.MANAGEMENT.COLLECTOR_HISTORY'), link: '/management/collector-history', isNew: true },
                    ],
                },
            ]),
            supportMenu: computed(() => [
                { label: vm.$t('COMMON.GNB.SUPPORT.LABEL_USER_GUIDE'), link: 'https://spaceone-dev.gitbook.io/user-guide/' },
                { label: vm.$t('COMMON.GNB.SUPPORT.LABEL_API_GUIDE'), link: 'https://spaceone-dev.gitbook.io/spaceone-apis' },
                { label: vm.$t('COMMON.GNB.SUPPORT.LABEL_GITHUB'), link: 'https://github.com/spaceone-dev' },
            ]),
            selectedMenu: computed(() => {
                const pathRegex = vm.$route.path.match(/\/(\w+)/);
                return pathRegex ? pathRegex[1] : null;
            }),
            languageMenu: computed(() => Object.entries(languages).map(([k, v]) => ({
                label: v, name: k,
            }))),
        });

        /* event */
        const hideMenu = () => {
            state.openedMenu = null;
            state.showLanguageMenu = false;
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
        const toggleLanguageMenu = () => {
            state.showLanguageMenu = !state.showLanguageMenu;
        };
        const openProfile = () => {
            state.profileVisible = true;
        };

        /* action */
        const signOut = async () => {
            const res: Location = {
                name: 'SignOut',
            };
            await router.push(res);
        };
        const changeLanguage = async (language) => {
            try {
                await store.dispatch('user/setUser', { language });
                showSuccessMessage(vm.$t('COMMON.GNB.ACCOUNT.ALT_S_UPDATE'), '', root);
                state.showLanguageMenu = false;
            } catch (e) {
                showErrorMessage(vm.$t('COMMON.GNB.ACCOUNT.ALT_E_UPDATE'), e, root);
            }
        };

        return {
            ...toRefs(state),
            userState,
            hideMenu,
            toggleMenu,
            toggleLanguageMenu,
            openProfile,
            changeLanguage,
            signOut,
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

        .menu-button {
            @apply text-gray-900;
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
        .sub-menu-wrapper {
            @apply bg-white border border-gray-200;
            position: absolute;
            top: 2.5rem;
            left: -1.125rem;
            min-width: 10rem;
            box-shadow: 0 0 0.875rem rgba(0, 0, 0, 0.1);
            border-radius: 0.125rem;
            padding: 0.5rem;
            margin: 3px 0;
            &.right-align {
                right: 0;
                left: auto;
                line-height: 1rem;
            }
            &.account {
                min-width: 15.125rem;
            }
            .sub-menu {
                @apply text-gray-900;
                position: relative;
                width: 100%;
                height: 2rem;
                font-size: 0.875rem;
                line-height: 1rem;
                text-decoration: none;
                white-space: nowrap;
                cursor: pointer;
                border-radius: 0.25rem;
                padding: 0.5rem;
                &:hover, &:focus {
                    @apply bg-primary4 text-primary;
                }
                &:active {
                    @apply bg-white;
                }
                .external-link-icon {
                    position: absolute;
                    top: 0.5rem;
                    right: 1rem;
                }
            }
            .info-wrapper {
                padding: 1rem 0.5rem 0.5rem 0.5rem;
                .info-row {
                    position: relative;
                    line-height: 1.5rem;
                    font-size: 0.75rem;

                    &:first-child {
                        @apply text-primary;
                        font-size: 0.875rem;
                        padding-bottom: 1rem;
                    }
                    &.language {
                        cursor: pointer;
                        &:hover, &:focus {
                            @apply bg-primary4 text-primary;
                            border-radius: 0.125rem;
                            .p-i-icon {
                                display: inline-block;
                            }
                        }
                        .p-i-icon {
                            display: none;
                        }
                        .sub-menu-wrapper {
                            top: 1.5rem;
                            left: 4rem;
                            min-width: 9.25rem;
                            max-height: 21rem;
                            overflow-y: auto;
                            z-index: 10;
                        }
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
                .p-hr {
                    margin-top: 1rem;
                }
            }
            .new-text {
                font-size: 0.75rem;
                background: linear-gradient(to right, theme('colors.primary'), theme('colors.secondary'));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                vertical-align: text-top;
                cursor: default;
                margin-left: 0.25rem;
            }
        }
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
    }
}
</style>
