<template>
    <div class="right-side-menu" @click.stop>
        <g-n-b-search v-click-outside="hideMenu"
                      :visible-suggestion="openedMenu === 'search'"
                      @update:visibleSuggestion="toggleMenu('search')"
        />
        <g-n-b-recent-favorite v-if="!userState.isDomainOwner"
                               v-click-outside="hideMenu"
                               :visible-dropdown="openedMenu === 'recentFavorite'"
                               @update:visibleDropdown="toggleMenu('recentFavorite')"
        />
        <div v-if="!userState.isDomainOwner" class="menu-wrapper">
            <div class="menu-button notifications"
                 :class="{opened: openedMenu === 'notifications'}"
                 @click.stop="toggleMenu('notifications')"
            >
                <p-i class="menu-icon"
                     :name="hasNotifications ? 'ic_bell_noti' : 'ic_bell'"
                     :color="hasNotifications ? undefined : 'inherit'"
                />
            </div>
            <g-n-b-notifications v-if="openedMenu === 'notifications'"
                                 v-click-outside="hideMenu"
                                 @click-settings="hideMenu"
            />
        </div>
        <div class="menu-wrapper account">
            <div class="menu-button account"
                 @click.stop="toggleMenu('account')"
            >
                <p-i v-if="userState.isDomainOwner" name="root-account" class="menu-icon" />
                <p-i v-else-if="!userState.isDomainOwner && userState.hasDomainRole" name="admin" class="menu-icon"
                     width="1.75rem" height="1.75rem"
                />
                <p-i v-else name="user" class="menu-icon" />
            </div>
            <div v-if="openedMenu === 'account'"
                 v-click-outside="hideMenu"
                 class="sub-menu-wrapper right-align account"
            >
                <div class="user-info">
                    <p-i v-if="userState.isDomainOwner" name="root-account" />
                    <p-i v-else-if="!userState.isDomainOwner && userState.hasDomainRole" name="admin" />
                    <p-i v-else name="user" />
                    <span class="value">{{ userState.userId }}</span>
                </div>
                <div class="info-wrapper">
                    <div class="info-menu">
                        <span class="label">{{ $t('COMMON.GNB.ACCOUNT.LABEL_ROLE') }}</span>
                        <span class="value">{{ userState.role }}</span>
                    </div>
                    <div class="info-menu language"
                         @click.stop="toggleLanguageMenu"
                    >
                        <span class="label">{{ $t('COMMON.GNB.ACCOUNT.LABEL_LANGUAGE') }}</span>
                        <div class="value">
                            <span>{{ userState.language }}</span>
                            <div v-if="showLanguageMenu" class="sub-menu-wrapper">
                                <div class="sub-menu-list">
                                    <template v-for="(item, index) in languageMenu" @click.native="hideMenu">
                                        <div :key="index" class="sub-menu" @click="changeLanguage(item.name)">
                                            <span>{{ item.label }}</span>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>
                        <p-i :name="showLanguageMenu ? 'ic_arrow_top' : 'ic_arrow_bottom'"
                             width="1rem" height="1rem"
                        />
                    </div>
                    <div class="info-menu">
                        <span class="label">{{ $t('COMMON.PROFILE.TIMEZONE') }}</span>
                        <span class="value">{{ userState.timezone }}</span>
                    </div>
                    <div class="info-menu">
                        <router-link :to="{name: MY_PAGE_ROUTE._NAME }">
                            <p-button style-type="primary" :outline="true" size="sm"
                                      class="my-page-button"
                            >
                                {{ $t('COMMON.GNB.ACCOUNT.GO_TO_MYPAGE') }}
                            </p-button>
                        </router-link>
                    </div>
                </div>
                <p-divider class="divider" />
                <div class="sub-menu-list">
                    <div class="sub-menu">
                        <router-link :to="{name: MY_PAGE_ROUTE.MY_ACCOUNT.API_KEY._NAME}">
                            Access with API & CLI
                        </router-link>
                    </div>
                </div>
                <p-divider class="divider" />
                <div class="sub-menu-list">
                    <div v-for="{ link, label} in supportMenu" :key="label" class="sub-menu">
                        <a :href="link" target="_blank" class="support-menu">
                            <span>{{ label }}</span>
                            <p-i name="ic_external-link"
                                 height="1em" width="1em"
                                 color="inherit"
                                 class="external-icon"
                            />
                        </a>
                    </div>
                </div>
                <p-divider class="divider" />
                <div class="sub-menu-list">
                    <div class="sub-menu" @click="signOut">
                        <span>{{ $t('COMMON.GNB.ACCOUNT.LABEL_SIGN_OUT') }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, onMounted, onUnmounted, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PI, PDivider, PButton,
} from '@spaceone/design-system';
import ejs from 'ejs';
import vClickOutside from 'v-click-outside';
import { Location } from 'vue-router';


import { SpaceRouter } from '@/router';
import { store } from '@/store';

import { languages } from '@/store/modules/user/config';

import config from '@/lib/config';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import GNBNotifications from '@/common/modules/navigations/gnb/modules/gnb-notification/GNBNotifications.vue';
import GNBRecentFavorite from '@/common/modules/navigations/gnb/modules/gnb-recent-favorite/GNBRecentFavorite.vue';
import GNBSearch from '@/common/modules/navigations/gnb/modules/gnb-search/GNBSearch.vue';


import { AUTH_ROUTE } from '@/services/auth/route-config';
import { MY_PAGE_ROUTE } from '@/services/my-page/route-config';


export default {
    name: 'RightSideMenu',
    components: {
        GNBRecentFavorite,
        GNBSearch,
        GNBNotifications,
        PDivider,
        PI,
        PButton,
    },
    directives: {
        clickOutside: vClickOutside.directive,
    },
    props: {
        openedMenu: {
            type: String,
            default: null,
        },
    },
    setup(props, { root, emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            showLanguageMenu: false,
            supportMenu: computed(() => {
                const docsList = config.get('DOCS') ?? [];
                const data = { lang: store.state.user.language };
                return docsList.map(d => ({
                    label: ejs.render(d?.label ?? '', data),
                    link: ejs.render(d?.link ?? '', data),
                }));
            }),
            languageMenu: computed(() => Object.entries(languages).map(([k, v]) => ({
                label: v, name: k,
            }))),
            isNewIconHidden: store.getters['settings/getItem']('hide_new_icon', '/gnb'),
            hasNotifications: computed(() => store.getters['display/hasUncheckedNotifications']),
        });
        const userState = reactive({
            name: computed(() => store.state.user.name),
            email: computed(() => store.state.user.email),
            role: computed(() => {
                const roleArray = store.getters['user/roleNames'];
                return roleArray.join(', ');
            }),
            language: computed(() => store.getters['user/languageLabel']),
            timezone: computed(() => store.state.user.timezone),
            userId: computed(() => store.state.user.userId),
            hasDomainRole: computed((() => store.getters['user/hasDomainRole'])),
            isDomainOwner: computed(() => store.getters['user/isDomainOwner']),
        });

        /* event */
        const hideMenu = () => {
            if (props.openedMenu === 'notifications') {
                store.dispatch('display/startCheckNotification');
            } else if (props.openedMenu === 'account') {
                state.showLanguageMenu = false;
            }

            emit('hide-menu');
        };
        const toggleMenu = (menu) => {
            if (menu === 'notifications') {
                store.dispatch('display/stopCheckNotification');
            }
            emit('toggle-menu', menu);
        };
        const openProfile = () => {
            emit('hide-menu');
            SpaceRouter.router.push({ name: MY_PAGE_ROUTE.MY_ACCOUNT.ACCOUNT._NAME });
        };
        const toggleLanguageMenu = () => {
            state.showLanguageMenu = !state.showLanguageMenu;
        };
        const hideNewIcon = () => {
            if (!state.isNewIconHidden) {
                state.isNewIconHidden = true;
                store.dispatch('settings/setItem', {
                    key: 'hide_new_icon',
                    value: true,
                    path: '/gnb',
                });
            }
        };


        /* action */
        const signOut = async () => {
            const res: Location = {
                name: AUTH_ROUTE.SIGN_OUT._NAME,
                query: { nextPath: vm.$route.fullPath },
            };
            await vm.$router.push(res);
        };
        const changeLanguage = async (language) => {
            try {
                await store.dispatch('user/setUser', {
                    language,
                    timezone: userState.timezone,
                });
                vm.$nextTick(() => {
                    showSuccessMessage(vm.$t('COMMON.GNB.ACCOUNT.ALT_S_UPDATE'), '', root);
                });
                emit('hide-menu');
            } catch (e) {
                ErrorHandler.handleRequestError(e, vm.$t('COMMON.GNB.ACCOUNT.ALT_E_UPDATE'));
            }
        };

        onMounted(() => {
            store.dispatch('display/startCheckNotification');
        });

        onUnmounted(() => {
            store.dispatch('display/stopCheckNotification');
        });

        watch(() => vm.$store.state.user.isSessionExpired, (isSessionExpired) => {
            if (isSessionExpired) store.dispatch('display/stopCheckNotification');
        });

        return {
            ...toRefs(state),
            userState,
            MY_PAGE_ROUTE,
            signOut,
            changeLanguage,
            hideMenu,
            toggleMenu,
            openProfile,
            toggleLanguageMenu,
            hideNewIcon,
        };
    },
};
</script>

<style lang="postcss" scoped>
.right-side-menu {
    .menu-wrapper {
        position: relative;
        margin-left: 1.5rem;

        &:first-of-type {
            margin-left: 0;
        }

        .menu-button {
            @apply text-gray-500;
            cursor: pointer;
            line-height: $gnb-height;

            &.opened {
                @apply text-violet-400;
            }

            &.account {
                .menu-icon {
                    @apply rounded-xl;
                }
            }

            @media (hover: hover) {
                &:hover {
                    @apply text-violet-400;
                }
            }
        }
    }

    .sub-menu-wrapper {
        @apply bg-white border border-gray-200 rounded-xs;
        position: absolute;
        top: 100%;
        right: -0.5rem;
        left: auto;
        margin-top: -0.5rem;
        max-width: 17.5rem;
        box-shadow: 0 0 0.875rem rgba(0, 0, 0, 0.1);

        &.account {
            min-width: 15.125rem;
        }

        .user-info {
            @apply flex items-center;
            padding: 1.25rem 1rem 0.25rem;

            .p-i-icon {
                @apply rounded-lg flex-shrink-0;
            }

            .value {
                @apply font-bold break-all;
                margin-left: 0.5rem;
                font-size: 0.875rem;
                line-height: 125%;
            }
        }

        .info-wrapper {
            padding: 0.5rem;

            .info-menu {
                position: relative;
                width: 100%;
                padding: 0 0.5rem;
                line-height: 1.5rem;
                font-size: 0.75rem;
                letter-spacing: 0.02em;

                .label {
                    @apply text-gray-500 font-bold;
                    padding-right: 0.5rem;
                }

                .my-page-button {
                    @apply w-full;
                    margin-top: 0.75rem;
                    margin-bottom: 0.5rem;
                }

                &.language {
                    display: inline-flex;
                    cursor: pointer;
                    &:hover, &:focus {
                        @apply bg-violet-100 text-violet-600 rounded-xs;
                    }
                    .p-i-icon {
                        display: inline-block;
                        margin-top: 0.25rem;
                    }
                    .value {
                        position: relative;
                        .sub-menu-wrapper {
                            left: -1rem;
                            min-width: 9.25rem;
                            max-height: 21rem;
                            margin-top: -0.125rem;
                            overflow-y: auto;
                            z-index: 10;
                        }
                    }
                }
            }
        }

        .sub-menu-list {
            padding: 0.5rem;

            .sub-menu {
                @apply text-gray-900 rounded;
                position: relative;
                display: inline-flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
                height: 2rem;
                padding: 0 0.5rem;
                font-size: 0.875rem;
                text-decoration: none;
                white-space: nowrap;
                cursor: pointer;

                &:hover, &:focus {
                    @apply bg-violet-100 text-violet-600;
                }

                &:active {
                    @apply bg-white;
                }

                &.p-anchor::v-deep:hover .text {
                    text-decoration: none;
                }

                .support-menu {
                    @apply justify-between;
                    display: flex;
                    width: 100%;
                }
            }
        }
    }

    .gnb-notifications {
        position: absolute;
        right: 0;
        left: auto;
        margin-top: -0.5rem;
    }

    @screen laptop {
        .menu-wrapper {
            margin-left: 1.25rem;
        }
    }

    @screen tablet {
        .sub-menu-wrapper.accout {
            width: 13.1875rem;
        }
    }

    @screen mobile {
        .gnb-notifications {
            position: fixed;
            z-index: 200;
        }
    }
}
</style>
