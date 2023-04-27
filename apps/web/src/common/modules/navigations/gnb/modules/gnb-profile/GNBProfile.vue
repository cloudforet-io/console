<template>
    <div ref="profileMenuRef"
         v-click-outside="hideProfileMenu"
         class="gnb-profile"
         @keydown.esc="hideProfileMenu"
    >
        <span class="menu-button"
              role="button"
              tabindex="0"
              @click.stop="handleProfileButtonClick"
              @keydown.enter="openProfileMenu"
        >
            <p-i :name="userIcon"
                 class="menu-icon"
            />
        </span>
        <div v-if="visible"
             class="profile-menu-wrapper"
        >
            <div class="user-info">
                <p-i :name="userIcon" />
                <span class="value">{{ userId }}</span>
            </div>
            <div class="info-wrapper">
                <div class="info-menu">
                    <span class="label">{{ $t('IDENTITY.USER.MAIN.DOMAIN_ID') }}</span>
                    <span class="value">{{ domainId }}</span>
                </div>
                <div class="info-menu">
                    <span class="label">{{ $t('COMMON.GNB.ACCOUNT.LABEL_ROLE') }}</span>
                    <span class="value">{{ role }}</span>
                </div>
                <div v-click-outside="handleClickOutsideLanguageMenu"
                     class="info-menu language"
                     @click.stop="handleLanguageDropdownClick"
                >
                    <span class="label">{{ $t('COMMON.GNB.ACCOUNT.LABEL_LANGUAGE') }}</span>
                    <div class="value">
                        <span>{{ language }}</span>
                        <div v-if="languageMenuVisible"
                             class="language-menu-wrapper"
                        >
                            <div class="sub-menu-wrapper">
                                <div v-for="(item, index) in languageMenu"
                                     :key="index"
                                     class="sub-menu"
                                     @click.stop="handleLanguageClick(item.name)"
                                >
                                    <span>{{ item.label }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p-i :name="languageMenuVisible ? 'ic_chevron-up' : 'ic_chevron-down'"
                         class="arrow-icon"
                         width="1rem"
                         height="1rem"
                    />
                </div>
                <div v-click-outside="handleClickOutsideCurrencyMenu"
                     class="info-menu currency"
                     @click.stop="handleCurrencyDropdownClick"
                >
                    <span class="label">{{ $t('COMMON.GNB.ACCOUNT.LABEL_CURRENCY') }}</span>
                    <div class="value">
                        <span>{{ currency }}</span>
                        <div v-if="currencyMenuVisible"
                             class="currency-menu-wrapper"
                        >
                            <div class="sub-menu-wrapper">
                                <div v-for="(item, index) in currencyMenuItems"
                                     :key="index"
                                     class="sub-menu"
                                     @click.stop="handleCurrencyClick(item.name)"
                                >
                                    <span>{{ item.label }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p-i :name="currencyMenuVisible ? 'ic_chevron-up' : 'ic_chevron-down'"
                         class="arrow-icon"
                         width="1rem"
                         height="1rem"
                    />
                </div>
                <div class="info-menu">
                    <span class="label">{{ $t('COMMON.PROFILE.TIMEZONE') }}</span>
                    <span class="value">{{ timezone }}</span>
                </div>
                <div class="info-menu">
                    <router-link :to="{name: MY_PAGE_ROUTE._NAME }"
                                 @click.native="hideProfileMenu"
                    >
                        <p-button style-type="secondary"
                                  size="sm"
                                  class="my-page-button"
                        >
                            {{ $t('COMMON.GNB.ACCOUNT.GO_TO_MYPAGE') }}
                        </p-button>
                    </router-link>
                </div>
            </div>
            <template v-if="hasPermission">
                <p-divider />
                <div class="sub-menu-wrapper">
                    <router-link class="sub-menu"
                                 :to="{name: INFO_ROUTE.NOTICE._NAME}"
                                 @click.native="hideProfileMenu"
                    >
                        {{ $t('MENU.INFO_NOTICE') }}
                    </router-link>
                </div>
            </template>
            <template v-if="hasPermission && !isDomainOwner">
                <p-divider />
                <div class="sub-menu-wrapper">
                    <router-link class="sub-menu"
                                 :to="{name: MY_PAGE_ROUTE.MY_ACCOUNT.API_KEY._NAME}"
                                 @click.native="hideProfileMenu"
                    >
                        {{ $t('MENU.MY_PAGE_API_KEY') }}
                    </router-link>
                </div>
            </template>
            <p-divider />
            <div class="sub-menu-wrapper">
                <a v-for="{ link, label } in supportedMenu"
                   :key="label"
                   class="sub-menu support-menu"
                   :href="link"
                   target="_blank"
                   @click="hideProfileMenu"
                >
                    <span>{{ label }}</span>
                    <p-i name="ic_external-link"
                         height="1em"
                         width="1em"
                         color="inherit"
                         class="external-icon"
                    />
                </a>
            </div>
            <p-divider />
            <div class="sub-menu-wrapper">
                <div class="sub-menu"
                     @click="handleClickSignOut"
                >
                    {{ $t('COMMON.GNB.ACCOUNT.LABEL_SIGN_OUT') }}
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">

import { vOnClickOutside } from '@vueuse/components';
import {
    computed,
    defineComponent, getCurrentInstance, reactive, toRefs,
} from 'vue';
import type { DirectiveFunction, SetupContext } from 'vue';
import type { Location } from 'vue-router';
import type { Vue } from 'vue/types/vue';

import {
    PI, PDivider, PButton,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import ejs from 'ejs';

import { store } from '@/store';
import { i18n } from '@/translations';

import { CURRENCY_SYMBOL } from '@/store/modules/display/config';
import { languages } from '@/store/modules/user/config';

import config from '@/lib/config';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { AUTH_ROUTE } from '@/services/auth/route-config';
import { INFO_ROUTE } from '@/services/info/route-config';
import { MY_PAGE_ROUTE } from '@/services/my-page/route-config';

interface Props {
    visible: boolean
}
export default defineComponent<Props>({
    name: 'GNBProfile',
    components: {
        PDivider,
        PI,
        PButton,
    },
    directives: {
        clickOutside: vOnClickOutside as DirectiveFunction,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }: SetupContext) {
        const vm = getCurrentInstance()?.proxy as Vue;

        const state = reactive({
            userIcon: computed(() => {
                if (state.isDomainOwner) return 'img_avatar_root-account';
                if (state.hasDomainRole) return 'img_avatar_admin';
                return 'img_avatar_user';
            }),
            name: computed(() => store.state.user.name),
            email: computed(() => store.state.user.email),
            role: computed(() => {
                const roleArray = store.getters['user/roleNames'];
                return roleArray.join(', ');
            }),
            language: computed(() => store.getters['user/languageLabel']),
            currency: computed(() => store.state.display.currency),
            timezone: computed(() => store.state.user.timezone),
            domainId: computed(() => store.state.domain.domainId),
            userId: computed(() => store.state.user.userId),
            hasDomainRole: computed((() => store.getters['user/hasDomainRole'])),
            isDomainOwner: computed(() => store.getters['user/isDomainOwner']),
            hasPermission: computed(() => store.getters['user/hasPermission']),
            languageMenuVisible: false,
            currencyMenuVisible: false,
            supportedMenu: computed(() => {
                const docsList = config.get('DOCS') ?? [];
                const data = { lang: store.state.user.language };
                return docsList.map((d) => ({
                    label: ejs.render(d?.label ?? '', data),
                    link: ejs.render(d?.link ?? '', data),
                }));
            }),
            languageMenu: computed(() => Object.entries(languages).map(([k, v]) => ({
                label: v, name: k,
            }))),
            currencyMenuItems: computed<MenuItem[]>(() => Object.keys(store.state.display.currencyRates).map((currency) => ({
                name: currency,
                label: `${CURRENCY_SYMBOL[currency]}${currency}`,
            }))),
            profileMenuRef: null as null|HTMLElement,
        });

        const setVisible = (visible: boolean) => {
            emit('update:visible', visible);
        };
        const openProfileMenu = () => {
            setVisible(true);
        };
        const hideProfileMenu = () => {
            if (state.languageMenuVisible) state.languageMenuVisible = false;
            setVisible(false);
        };
        const setLanguageMenuVisible = (visible: boolean) => {
            state.languageMenuVisible = visible;
        };
        const setCurrencyMenuVisible = (visible: boolean) => {
            state.currencyMenuVisible = visible;
        };
        const handleProfileButtonClick = () => {
            setVisible(!props.visible);
        };
        const handleClickOutsideLanguageMenu = (e: PointerEvent) => {
            const profileMenuRef = state.profileMenuRef;
            if (!profileMenuRef) return;
            const target = e.target as HTMLElement;
            setLanguageMenuVisible(false);
            /*
                v-on-click-outside directive stops click event bubbling.
                So when this function is called, hideProfileMenu function will never be called which is bound to profileMenuRef's v-on-click-outside directive.
                The code below closes the profile menu when the user clicks outside the profileMenuRef.
             */
            if (!profileMenuRef.contains(target)) hideProfileMenu();
        };
        const handleClickOutsideCurrencyMenu = (e: PointerEvent) => {
            const profileMenuRef = state.profileMenuRef;
            if (!profileMenuRef) return;
            const target = e.target as HTMLElement;
            setCurrencyMenuVisible(false);
            if (!profileMenuRef.contains(target)) hideProfileMenu();
        };

        const handleLanguageDropdownClick = () => {
            setLanguageMenuVisible(!state.languageMenuVisible);
        };
        const handleCurrencyDropdownClick = () => {
            setCurrencyMenuVisible(!state.currencyMenuVisible);
        };

        const handleLanguageClick = async (language) => {
            try {
                if (store.state.user.language === language) return;

                await store.dispatch('user/setUser', {
                    language,
                    timezone: state.timezone,
                });

                setLanguageMenuVisible(false);
                showSuccessMessage(i18n.t('COMMON.GNB.ACCOUNT.ALT_S_UPDATE'), '');
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('COMMON.GNB.ACCOUNT.ALT_E_UPDATE'));
            }
        };
        const handleCurrencyClick = async (currency) => {
            await store.commit('display/setCurrency', currency);
            setCurrencyMenuVisible(false);
            showSuccessMessage(i18n.t('COMMON.GNB.ACCOUNT.ALT_S_UPDATE_CURRENCY'), '');
        };
        const handleClickGoToMyPage = () => {
            hideProfileMenu();
            vm.$router.push({ name: MY_PAGE_ROUTE.MY_ACCOUNT.ACCOUNT._NAME });
        };
        const handleClickSignOut = async () => {
            const res: Location = {
                name: AUTH_ROUTE.SIGN_OUT._NAME,
                query: { nextPath: vm.$route.fullPath },
            };
            await vm.$router.push(res);
        };

        return {
            ...toRefs(state),
            openProfileMenu,
            hideProfileMenu,
            handleProfileButtonClick,
            handleClickOutsideLanguageMenu,
            handleClickOutsideCurrencyMenu,
            handleLanguageDropdownClick,
            handleCurrencyDropdownClick,
            handleClickGoToMyPage,
            handleLanguageClick,
            handleCurrencyClick,
            handleClickSignOut,
            MY_PAGE_ROUTE,
            INFO_ROUTE,
        };
    },
});
</script>

<style lang="postcss" scoped>
.gnb-profile {
    position: relative;
    margin-left: 1.5rem;
    outline: none;

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

        .menu-icon {
            @apply rounded-xl;
        }

        @media (hover: hover) {
            &:hover {
                @apply text-violet-400;
            }
        }
    }

    @define-mixin menu-dropdown {
        @apply bg-white border border-gray-200 rounded-xs;
        position: absolute;
        top: 100%;
        right: -0.5rem;
        left: auto;
        margin-top: -0.5rem;
        box-shadow: 0 0 0.875rem rgba(0, 0, 0, 0.1);
    }
    .profile-menu-wrapper {
        @mixin menu-dropdown;
        min-width: 19.5rem;

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

                &.language, &.currency {
                    display: inline-flex;
                    cursor: pointer;
                    &:hover, &:focus {
                        @apply bg-violet-100 text-violet-600 rounded-xs;
                    }
                    .arrow-icon {
                        display: inline-block;
                        margin-top: 0.25rem;
                    }
                    .value {
                        position: relative;
                        .language-menu-wrapper, .currency-menu-wrapper {
                            @mixin menu-dropdown;
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

        .sub-menu-wrapper {
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

                /* custom design-system component - p-anchor */
                :deep(&.p-anchor:hover .text) {
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

    @screen laptop {
        margin-left: 1.25rem;
    }

    @screen tablet {
        .profile-menu-wrapper {
            width: 13.1875rem;
        }
    }
}

</style>
