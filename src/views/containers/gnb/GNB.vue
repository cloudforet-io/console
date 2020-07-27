<template>
    <div class="menu-container">
        <div class="left">
            <div class="menu-lap mx-4">
                <div class="menu-button all opacity"
                     :class="{opened: openedMenu === 'all'}"
                     @click="showMenu('all')"
                >
                    <p-i class="menu-icon"
                         name="ic_gnb_service_2"
                         color="inherit transparent"
                         width="2rem" height="2rem"
                    />
                </div>
                <p-context-menu
                    v-if="openedMenu === 'all'"
                    class="white"
                    :menu="allMenu"
                >
                    <template #item--format="{item}">
                        <router-link :to="item.link">
                            <div>{{ item.label }}</div>
                        </router-link>
                    </template>
                </p-context-menu>
            </div>
            <div class="menu-lap mr-10">
                <router-link to="/dashboard">
                    <img class="inline-block w-8 h-8 mr-2" src="@/assets/images/brand/brand_logo.png">
                    <img class="h-3 hidden md:inline-block lg:inline-block"
                         src="@/assets/images/brand/SpaceONE_logoTypeA.png"
                         height="2rem"
                    >
                </router-link>
            </div>
            <div v-for="(dItem, idx) in defaultMenuList"
                 :key="idx"
                 class="menu-lap"
            >
                <div class="menu-button opacity mr-4 lg:mr-8"
                     :class="{opened: dItem.menu.length > 0 && openedMenu === dItem.key, selected: selectedMenu === dItem.key}"
                     @click="showMenu(dItem.key)"
                >
                    <span v-if="dItem.menu.length > 0">{{ dItem.key }}</span>
                    <router-link v-else :to="dItem.link">
                        {{ dItem.key }}
                    </router-link>
                    <p-i class="arrow-button"
                         :class="dItem.menu.length > 0 ? 'visible' : 'invisible'"
                         :name="openedMenu === dItem.key ? 'ic_arrow_top' : 'ic_arrow_bottom'"
                         width="1rem" height="1rem"
                    />
                </div>
                <p-context-menu
                    v-if="openedMenu === dItem.key && dItem.menu.length > 0"
                    class="white"
                    :menu="dItem.menu"
                >
                    <template #item--format="{item}">
                        <router-link :to="item.link">
                            <div>{{ item.label }}</div>
                        </router-link>
                    </template>
                </p-context-menu>
            </div>
        </div>

        <div class="right">
            <div class="menu-lap">
                <div class="menu-button support"
                     :class="{opened: openedMenu === 'support'}"
                     @click.stop="showMenu('support')"
                >
                    <p-i class="menu-icon"
                         name="ic_support"
                         color="inherit transparent"
                    />
                </div>
                <p-context-menu
                    v-if="openedMenu === 'support'"
                    class="white right-align"
                    :menu="supportMenu"
                >
                    <template #item--format="{item}" />
                </p-context-menu>
            </div>
            <div class="menu-lap account">
                <div class="menu-button account"
                     @click.stop="showMenu('account')"
                >
                    <div class="menu-icon"
                         :class="{opened: openedMenu === 'account'}"
                    />
                </div>
                <p-context-menu
                    v-if="openedMenu === 'account'"
                    class="white right-align"
                    :menu="accountMenu"
                    @click.prevent.self
                >
                    <template #info--format>
                        <div class="context-info">
                            <p-i v-if="isDomainOwner" class="icon" name="admin" />
                            <p-i v-else class="icon" name="user" />
                            <span class="value">{{ userState.email }}</span>
                        </div>
                        <div class="context-info">
                            <span class="label">Role</span>
                            <span v-if="isDomainOwner" class="value">Project Admin</span>
                            <span v-else class="value">Project Member</span>
                        </div>
                        <div class="context-info">
                            <span class="label">Time zone</span>
                            <span class="value">{{ userState.timezone }}</span>
                        </div>
                        <div class="context-info">
                            <span class="label">Language</span>
                            <span class="value">{{ userState.language }}</span>
                        </div>
                    </template>
                    <template #divider>
                        <div class="border" />
                    </template>
                    <template #item--format="{item}">
                        <div @click="doAction(item.name)">
                            {{ item.label }}
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
import PI from '@/components/atoms/icons/PI.vue';
import PContextMenu from '@/components/organisms/context-menu/PContextMenu.vue';
import ProfileModal from '@/views/common/profile/ProfileModal.vue';
import {
    reactive, onMounted, toRefs, getCurrentInstance, computed,
} from '@vue/composition-api';
import { fluentApi } from '@/lib/fluent-api';

export default {
    name: 'GNB',
    components: {
        PI,
        ProfileModal,
        PContextMenu,
    },
    setup() {
        const vm: any = getCurrentInstance();
        const userState = reactive({
            name: '',
            email: '',
            group: '',
            language: '',
            timezone: '',
        });
        const state = reactive({
            userState,
            openedMenu: null,
            selectedMenu: computed(() => vm?.$route.path.match(/\/(\w+)/)[1]),
            allMenu: [
                {
                    type: 'item', label: 'Dashboard', name: 'profile', link: '/dashboard',
                },
                {
                    type: 'item', label: 'Project', name: 'project', link: '/project',
                },
                {
                    type: 'item', label: 'Inventory', name: 'inventory', link: '/inventory',
                },
            ],
            defaultMenuList: [
                {
                    key: 'project',
                    link: '/project',
                    menu: [],
                },
                {
                    key: 'inventory',
                    link: '/inventory',
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
                    menu: [
                        {
                            type: 'item', label: 'Collector', name: 'collector', link: '/plugin',
                        },
                    ],
                },
            ],
            supportMenu: [
                {
                    type: 'item',
                    label: 'User Guide',
                    name: 'user-guide',
                    href: 'https://spaceone-dev.gitbook.io/user-guide/',
                    target: '_blank',
                },
                {
                    type: 'item',
                    label: 'API Guide',
                    name: 'api-guide',
                    href: 'https://spaceone-dev.gitbook.io/spaceone-apis',
                    target: '_blank',
                },
                {
                    type: 'item',
                    label: 'GitHub',
                    name: 'github',
                    href: 'https://github.com/spaceone-dev/console',
                    target: '_blank',
                },
                {
                    type: 'item', label: 'Send Feedback', name: 'send-feedback',
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
            userId: computed(() => vm.$ls.user.state.userId),
            isDomainOwner: computed(() => vm.$ls.user.state.isDomainOwner),
        });

        const hideMenu = () => {
            state.openedMenu = null;
        };
        const showMenu = (menu) => {
            state.openedMenu = menu;
        };
        // const toggleMenu = () => {
        //
        // }

        // account
        const params: any = {};
        const getUser = async (id) => {
            const res = await fluentApi.identity().user().get().setId(id)
                .execute();
            try {
                state.userState.name = res.data.name;
                state.userState.email = res.data.email;
                state.userState.group = res.data.group;
                state.userState.language = res.data.language;
                state.userState.timezone = res.data.timezone;
            } catch (e) {
                console.error(e);
            }
        };
        const getOwner = async (id) => {
            const res = await fluentApi.identity().domainOwner().get().setId(id)
                .execute();
            try {
                state.userState.name = res.data.name;
                state.userState.email = res.data.email;
                state.userState.group = res.data.group;
                state.userState.language = res.data.language;
                state.userState.timezone = res.data.timezone;
            } catch (e) {
                console.error(e);
            }
        };
        if (state.isDomainOwner) {
            // eslint-disable-next-line camelcase
            params.owner_id = state.userId;
            getOwner(params.owner_id);
        } else {
            // eslint-disable-next-line camelcase
            params.user_id = state.userId;
            getUser(params.user_id);
        }

        const openProfile = () => {
            state.profileVisible = true;
        };
        const logOutAction = async () => {
            vm.$ls.logout(vm);
        };
        const doAction = (key) => {
            if (key === 'logout') logOutAction();
            else if (key === 'profile') openProfile();
        };

        onMounted(() => {
            window.addEventListener('click', hideMenu, true);
            // window.addEventListener('blur', hideMenu);
        });

        return {
            ...toRefs(state),
            hideMenu,
            showMenu,
            doAction,
        };
    },
};
</script>

<style lang="postcss" scoped>
.menu-container {
    @apply bg-white;
    display: flex !important;
    line-height: 3rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);

    .right {
        position: absolute;
        display: inline-flex;
        right: 0;

        .menu-button {
            margin: 0 1vw;
        }
    }

    .menu-lap {
        position: relative;
        display: inline-block;

        &.account {
            .p-context-menu {
                min-width: 15.125rem;
            }
        }

        .menu-button {
            @apply relative text-gray-900 text-sm cursor-pointer;
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

            &.all {
                .menu-icon {
                    width: 2rem;
                    height: 2rem;
                }
            }
            &.support {
                &.opened {
                }
                &:hover {
                    @apply text-primary;
                }
            }
            &.account {
                .menu-icon {
                    width: 2rem;
                    height: 2rem;
                    overflow: hidden;
                    background: url('~@/assets/icons/user.svg') no-repeat center center;
                    background-size: cover;
                    margin-top: 0.5rem;

                    &.opened {
                        box-shadow: inset 0 0 0 2px theme('colors.primary');
                    }
                }
            }

            .menu-icon {
                border-radius: 0.625rem;
            }
        }
        .p-context-menu {
            .border {
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
        }
    }
}
</style>
