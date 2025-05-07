<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components';
import {
    computed, reactive, ref, watch,
} from 'vue';
import type { Location } from 'vue-router';
import { useRoute, useRouter } from 'vue-router/composables';

import ejs from 'ejs';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PI, PDivider, PButton, PCopyButton, PTooltip, PAvatar, PLazyImg,
} from '@cloudforet/mirinae';

import type { RoleBindingModel } from '@/api-clients/identity/role-binding/schema/model';
import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import DomainAdminImage from '@/assets/images/role/img_avatar_admin.png';
import UserImage from '@/assets/images/role/img_avatar_no-role.png';
import SystemAdminImage from '@/assets/images/role/img_avatar_system-admin.png';
import WorkspaceMemberImage from '@/assets/images/role/img_avatar_workspace-member.png';
import WorkspaceOwnerImage from '@/assets/images/role/img_avatar_workspace-owner.png';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import { useDomainStore } from '@/store/domain/domain-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { RoleReferenceMap } from '@/store/reference/role-reference-store';
import { languages } from '@/store/user/constant';
import { useUserStore } from '@/store/user/user-store';

import config from '@/lib/config';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { AUTH_ROUTE } from '@/services/auth/routes/route-constant';
import { LANDING_ROUTE } from '@/services/landing/routes/route-constant';
import { MY_PAGE_ROUTE } from '@/services/my-page/routes/route-constant';

interface Props {
    visible: boolean
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
});
const appContextStore = useAppContextStore();
const domainStore = useDomainStore();
const userStore = useUserStore();
const authorizationStore = useAuthorizationStore();

const emit = defineEmits<{(e: 'update:visible', visible: boolean): void; }>();

const route = useRoute();
const router = useRouter();
const allReferenceStore = useAllReferenceStore();

const state = reactive({
    roles: computed<RoleReferenceMap>(() => allReferenceStore.getters.role),
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    isUserMode: computed(() => appContextStore.getters.isUserMode),
    userIcon: computed<string>(() => {
        if (userStore.getters.isSystemAdmin) return SystemAdminImage;
        if (userStore.getters.isDomainAdmin) return DomainAdminImage;
        const currentRoleType = state.currentRoleType;
        if (currentRoleType === ROLE_TYPE.WORKSPACE_OWNER) return WorkspaceOwnerImage;
        if (currentRoleType === ROLE_TYPE.WORKSPACE_MEMBER) return WorkspaceMemberImage;
        return UserImage;
    }),
    baseRoleType: computed(() => userStore.state.roleType),
    currentRoleType: computed(() => authorizationStore.state.currentRoleInfo?.roleType),
    visibleRoleType: computed(() => {
        if (state.baseRoleType === ROLE_TYPE.DOMAIN_ADMIN) return 'Admin';
        if (state.currentRoleType === ROLE_TYPE.WORKSPACE_OWNER) return 'Workspace Owner';
        if (state.currentRoleType === ROLE_TYPE.WORKSPACE_MEMBER) return 'Workspace Member';
        return 'User';
    }),
    userRoles: [] as RoleBindingModel[],
    currentWorkspaceRole: computed<RoleBindingModel>(() => state.userRoles?.[0]),
    name: computed(() => userStore.state.name),
    email: computed(() => userStore.state.email),
    language: computed(() => userStore.getters.languageLabel),
    timezone: computed(() => userStore.state.timezone),
    domainId: computed(() => domainStore.state.domainId),
    userId: computed(() => userStore.state.userId),
    isMyPage: computed(() => route.matched.some((item) => item.name === MY_PAGE_ROUTE._NAME)),
    languageMenuVisible: false,
    supportedMenu: computed(() => {
        const docsList = config.get('DOCS') ?? [];
        const data = { lang: userStore.state.language };
        return docsList.map((d) => ({
            label: ejs.render(d?.label ?? '', data),
            link: ejs.render(d?.link ?? '', data),
        }));
    }),
    languageMenu: computed(() => Object.entries(languages).map(([k, v]) => ({
        label: v, name: k,
    }))),
    visibleAvatar: computed(() => route.matched.some((item) => {
        switch (item.name) {
        case MY_PAGE_ROUTE._NAME:
        case LANDING_ROUTE.WORKSPACE._NAME:
        case LANDING_ROUTE.DOMAIN._NAME:
            return true;
        default:
            return false;
        }
    })),
});

const profileMenuRef = ref<HTMLElement|null>(null);

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
const handleProfileButtonClick = () => {
    setVisible(!props.visible);
};
const handleClickOutsideLanguageMenu = (e: PointerEvent) => {
    if (!profileMenuRef.value) return;
    const target = e.target as HTMLElement;
    setLanguageMenuVisible(false);
    /*
                v-on-click-outside directive stops click event bubbling.
                So when this function is called, hideProfileMenu function will never be called which is bound to profileMenuRef's v-on-click-outside directive.
                The code below closes the profile menu when the user clicks outside the profileMenuRef.
             */
    if (!profileMenuRef.value.contains(target)) hideProfileMenu();
};
const handleLanguageDropdownClick = () => {
    setLanguageMenuVisible(!state.languageMenuVisible);
};

const handleClickGoToMyPage = () => {
    appContextStore.setGlobalGrantLoading(true);
    let currentWorkspace:string|undefined;
    if (route.name === LANDING_ROUTE.DOMAIN._NAME || route.name === LANDING_ROUTE.WORKSPACE._NAME) {
        currentWorkspace = 'landing';
    } else currentWorkspace = route.params?.workspaceId ?? 'admin';
    router.push({
        name: MY_PAGE_ROUTE._NAME,
        ...(currentWorkspace && {
            query: {
                beforeWorkspace: currentWorkspace,
            },
        }),
    }).catch(() => {});
    hideProfileMenu();
};
const handleClickGoToConsoleHome = () => {
    appContextStore.setGlobalGrantLoading(true);
    router.push({ name: LANDING_ROUTE.DOMAIN._NAME }).catch(() => {});
    hideProfileMenu();
};

const handleLanguageClick = async (language) => {
    try {
        if (userStore.state.language === language) return;

        await userStore.updateUser({
            language,
            timezone: state.timezone,
        });

        setLanguageMenuVisible(false);
        showSuccessMessage(i18n.t('COMMON.GNB.ACCOUNT.ALT_S_UPDATE'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('COMMON.GNB.ACCOUNT.ALT_E_UPDATE'));
    }
};

const handleClickSignOut = async () => {
    if (state.isAdminMode) appContextStore.exitAdminMode();
    const res: Location = {
        name: AUTH_ROUTE.SIGN_OUT._NAME,
        query: { previousPath: route.fullPath },
    };
    await router.push(res);
};
const fetchUserRoles = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.identity.roleBinding.list({
            query: {
                filter: [
                    {
                        k: 'user_id',
                        o: 'eq',
                        v: userStore.state.userId,
                    },
                ],
            },
        });
        state.userRoles = results;
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

watch(() => props.visible, (value) => {
    if (value && !state.isUserMode) {
        fetchUserRoles();
    }
}, { immediate: true });
</script>

<template>
    <div ref="profileMenuRef"
         v-on-click-outside="hideProfileMenu"
         class="top-bar-profile"
         @keydown.esc="hideProfileMenu"
    >
        <p-tooltip :contents="$t('COMMON.GNB.TOOLTIP.PROFILE')"
                   position="bottom"
        >
            <span :class="{'menu-button': true, 'opened': visible}"
                  role="button"
                  tabindex="0"
                  @click.stop="handleProfileButtonClick"
                  @keydown.enter="openProfileMenu"
            >
                <p-avatar v-if="state.visibleRoleType !== 'Admin' && state.visibleAvatar"
                          class="menu-icon"
                          size="md"
                />
                <p-lazy-img v-else
                            :src="state.userIcon"
                            class="menu-icon"
                            width="1.75rem"
                            height="1.75rem"
                />
            </span>
        </p-tooltip>
        <div v-if="visible"
             class="profile-menu-wrapper"
        >
            <div class="user-info">
                <p-avatar v-if="state.visibleRoleType !== 'Admin' && state.visibleAvatar"
                          size="sm"
                />
                <p-lazy-img v-else
                            :src="state.userIcon"
                />
                <span class="value">{{ state.userId }}</span>
            </div>
            <div class="info-wrapper">
                <div class="info-menu">
                    <span class="label">{{ $t('IDENTITY.USER.MAIN.DOMAIN_ID') }}</span>
                    <span class="value">
                        <p-copy-button size="sm"
                                       style="vertical-align: unset; display: inline-flex; align-items: center;"
                        >
                            {{ state.domainId }}
                        </p-copy-button>
                    </span>
                </div>
                <div v-if="state.isAdminMode"
                     class="info-menu"
                >
                    <span class="label">{{ $t('COMMON.GNB.ACCOUNT.LABEL_ROLE_TYPE') }}</span>
                    <span class="value">{{ state.visibleRoleType }}</span>
                </div>
                <div v-else-if="state.currentWorkspaceRole?.role_id"
                     class="info-menu"
                >
                    <span class="label">{{ $t('COMMON.GNB.ACCOUNT.LABEL_ROLE') }}</span>
                    <span class="value">{{ state.roles[state.currentWorkspaceRole?.role_id]?.label ?? 'User' }}</span>
                </div>
                <div v-on-click-outside="handleClickOutsideLanguageMenu"
                     class="info-menu language"
                     @click.stop="handleLanguageDropdownClick"
                >
                    <span class="label">{{ $t('COMMON.GNB.ACCOUNT.LABEL_LANGUAGE') }}</span>
                    <div class="value">
                        <span>{{ state.language }}</span>
                        <div v-if="state.languageMenuVisible"
                             class="language-menu-wrapper"
                        >
                            <div class="sub-menu-wrapper">
                                <div v-for="(item, index) in state.languageMenu"
                                     :key="index"
                                     class="sub-menu"
                                     @click.stop="handleLanguageClick(item.name)"
                                >
                                    <span>{{ item.label }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p-i :name="state.languageMenuVisible ? 'ic_chevron-up' : 'ic_chevron-down'"
                         class="arrow-icon"
                         width="1rem"
                         height="1rem"
                    />
                </div>
                <!-- HACK: This code might need recovery in version 1.13.-->
                <!--                <div v-on-click-outside="handleClickOutsideCurrencyMenu"-->
                <!--                     class="info-menu currency"-->
                <!--                     @click.stop="handleCurrencyDropdownClick"-->
                <!--                >-->
                <!--                    <span class="label">{{ $t('COMMON.GNB.ACCOUNT.LABEL_CURRENCY') }}</span>-->
                <!--                    <div class="value">-->
                <!--                        <span>{{ state.currency }}</span>-->
                <!--                        <div v-if="state.currencyMenuVisible"-->
                <!--                             class="currency-menu-wrapper"-->
                <!--                        >-->
                <!--                            <div class="sub-menu-wrapper">-->
                <!--                                <div v-for="(item, index) in state.currencyMenuItems"-->
                <!--                                     :key="index"-->
                <!--                                     class="sub-menu"-->
                <!--                                     @click.stop="handleCurrencyClick(item.name)"-->
                <!--                                >-->
                <!--                                    <span>{{ item.label }}</span>-->
                <!--                                </div>-->
                <!--                            </div>-->
                <!--                        </div>-->
                <!--                    </div>-->
                <!--                    <p-i :name="state.currencyMenuVisible ? 'ic_chevron-up' : 'ic_chevron-down'"-->
                <!--                         class="arrow-icon"-->
                <!--                         width="1rem"-->
                <!--                         height="1rem"-->
                <!--                    />-->
                <!--                </div>-->
                <div class="info-menu">
                    <span class="label">{{ $t('COMMON.PROFILE.TIMEZONE') }}</span>
                    <span class="value">{{ state.timezone }}</span>
                </div>
                <div v-if="!route.path.includes('landing')"
                     class="info-menu"
                >
                    <p-button style-type="tertiary"
                              size="sm"
                              class="console-home-button"
                              @click="handleClickGoToConsoleHome"
                    >
                        {{ $t('COMMON.GNB.ACCOUNT.GO_TO_CONSOLE_HOME') }}
                    </p-button>
                </div>
                <div v-if="!route.path.includes('my-page')"
                     class="info-menu"
                >
                    <p-button style-type="secondary"
                              size="sm"
                              class="my-page-button"
                              @click="handleClickGoToMyPage"
                    >
                        {{ $t('COMMON.GNB.ACCOUNT.GO_TO_MYPAGE') }}
                    </p-button>
                </div>
            </div>
            <p-divider class="divider" />
            <div class="sub-menu-wrapper">
                <a v-for="{ link, label } in state.supportedMenu"
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

<style lang="postcss" scoped>
.top-bar-profile {
    position: relative;
    outline: none;

    &:first-of-type {
        margin-left: 0;
    }

    .menu-button {
        @apply inline-flex items-center justify-center text-gray-500 rounded-full;
        width: 2rem;
        height: 2rem;
        cursor: pointer;
        line-height: $top-bar-height;

        &:hover {
            @apply text-blue-600 bg-blue-100;
        }

        &.opened {
            @apply text-blue-600 bg-blue-200;
        }

        .menu-icon {
            @apply rounded-full;
        }
    }

    .profile-menu-wrapper {
        @apply bg-white border border-gray-200 rounded-xs;
        position: absolute;
        top: 100%;
        right: -0.5rem;
        left: auto;
        z-index: 1000;
        box-shadow: 0 0 0.875rem rgba(0, 0, 0, 0.1);

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

                .console-home-button {
                    @apply w-full;
                    margin-top: 0.75rem;
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
                            @apply bg-white border border-gray-200 rounded-xs;
                            position: absolute;
                            top: 100%;
                            right: -0.5rem;
                            box-shadow: 0 0 0.875rem rgba(0, 0, 0, 0.1);

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

        .divider {
            height: 0.125rem;
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

                .support-menu {
                    @apply justify-between;
                    display: flex;
                    width: 100%;
                }
            }
        }
    }

    @screen tablet {
        .profile-menu-wrapper {
            width: 13.1875rem;
        }
    }
}

/* custom design-system component - p-lazy-img */
:deep(.p-lazy-img .img-container) {
    @apply rounded-full;
}
</style>
