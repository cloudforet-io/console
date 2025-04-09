<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PI, PTextHighlighting, PSelectDropdown,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import type { ProviderItem, ProviderReferenceMap } from '@/store/reference/provider-reference-store';

import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';

import { peacock } from '@/styles/colors';

import type { ProjectCardItemType } from '@/services/project/v-shared/types/project-type';
import { PROJECT_ROUTE_V1 } from '@/services/project/v1/routes/route-constant';
import { useProjectPageStore } from '@/services/project/v1/stores/project-page-store';
import { SERVICE_ACCOUNT_ROUTE } from '@/services/service-account/routes/route-constant';

interface Props {
    item: ProjectCardItemType;
    serviceAccountProviderList: string[];
    searchKeyword?: string;
}

const props = defineProps<Props>();

const allReferenceStore = useAllReferenceStore();
const favoriteStore = useFavoriteStore();
const favoriteGetters = favoriteStore.getters;
const projectPageStore = useProjectPageStore();


const router = useRouter();

const storeState = reactive({
    providers: computed<ProviderReferenceMap>(() => allReferenceStore.getters.provider),
    projectGroup: computed<ProjectGroupReferenceMap>(() => allReferenceStore.getters.projectGroup),
    favoriteItems: computed(() => favoriteGetters.projectItems),
});

const state = reactive({
    projectGroupName: computed<string>(() => {
        if (!props.item.parentId) return '';
        return storeState.projectGroup[props.item.parentId].name;
    }),
    isStarred: computed(() => storeState.favoriteItems.some((item) => item.itemId === props.item.id)),
    toolsetMenuItems: computed(() => [
        {
            type: 'item',
            name: 'update',
            label: i18n.t('PROJECT.DETAIL.UPDATE'),
            icon: 'ic_settings',
        },
        {
            type: 'item',
            name: 'move',
            label: i18n.t('PROJECT.DETAIL.MOVE'),
            icon: 'ic_move',
        },
        { type: 'divider', name: 'divider' },
        {
            type: 'item',
            name: 'delete',
            label: i18n.t('PROJECT.DETAIL.DELETE'),
            icon: 'ic_delete',
        },
    ]),
    toolsetMenuVisible: false,
});

const getProvider = (name: string): ProviderItem => storeState.providers[name] || {};

const handleSelectProject = () => {
    router.push({
        name: PROJECT_ROUTE_V1.DETAIL.TAB.SUMMARY._NAME,
        params: {
            id: props.item.id as string,
        },
    }).catch(() => {});
};

const handleSelectItem = (selected: MenuItem) => {
    projectPageStore.setCurrentSelectedProjectId(props.item.id);
    if (selected.name === 'update') {
        projectPageStore.setProjectFormModalVisible(true);
    }
    if (selected.name === 'move') {
        projectPageStore.setProjectGroupMoveModalVisible(true);
    }
    if (selected.name === 'delete') {
        projectPageStore.setProjectDeleteModalVisible(true);
    }
};

</script>

<template>
    <div :class="{'project-main-project-card': true, 'toolset-active': state.toolsetMenuVisible }"
         @click="handleSelectProject"
    >
        <div class="main-contents">
            <div class="title-wrapper">
                <div class="title">
                    <p-i name="ic_document-filled"
                         :color="peacock[600]"
                         width="1rem"
                         height="1rem"
                    />
                    <p-text-highlighting class="text"
                                         :text="props.item.name"
                                         :term="props.searchKeyword"
                    />
                </div>

                <div class="toolset-group">
                    <p-select-dropdown class="toolset-button"
                                       style-type="tertiary-icon-button"
                                       button-icon="ic_ellipsis-horizontal"
                                       size="sm"
                                       :visible-menu.sync="state.toolsetMenuVisible"
                                       :menu="state.toolsetMenuItems"
                                       :selected="[]"
                                       use-fixed-menu-style
                                       reset-selection-on-menu-close
                                       @select="handleSelectItem"
                    />
                    <favorite-button :class="{'favorite-button': true, 'starred': state.isStarred }"
                                     :item-id="props.item.id"
                                     :favorite-type="FAVORITE_TYPE.PROJECT"
                    />
                </div>
            </div>
            <span class="project-group">
                {{ state.projectGroupName }}
            </span>
        </div>
        <div class="sub-contents">
            <div v-if="props.serviceAccountProviderList.length > 0"
                 class="provider-icon-wrapper"
            >
                <div class="provider">
                    <template v-for="(provider, index) in props.serviceAccountProviderList">
                        <router-link v-if="index < 5"
                                     :key="index"
                                     :to="{name: SERVICE_ACCOUNT_ROUTE._NAME,query: { provider: getProvider(provider) ? provider : null },}"
                                     class="icon-link"
                                     :style="{backgroundImage: `url('${getProvider(provider).icon || require('@/assets/images/ic_cloud-filled.svg')}')`}"
                                     @click.native.stop.prevent
                        />
                    </template>
                </div>
                <span v-if="props.serviceAccountProviderList.length > 5"
                      class="provider-more-text"
                >
                    ...
                </span>
                <router-link v-if="props.serviceAccountProviderList.length !== 0"
                             class="icon-wrapper"
                             :to="{ name: SERVICE_ACCOUNT_ROUTE._NAME }"
                             @click.native.stop.prevent
                >
                    <p-i name="ic_plus_thin"
                         scale="0.8"
                         color="inherit"
                    />
                </router-link>
            </div>
            <div v-else
                 class="account-add"
            >
                <router-link :to="{ name: SERVICE_ACCOUNT_ROUTE._NAME }"
                             @click.native.stop.prevent
                >
                    <p-i name="ic_plus_thin"
                         scale="0.8"
                         color="inherit"
                    />
                </router-link>
                <router-link :to="{ name: SERVICE_ACCOUNT_ROUTE._NAME }"
                             @click.native.stop.prevent
                >
                    <span class="add-label"> {{ $t('PROJECT.LANDING.ADD_SERVICE_ACCOUNT') }}</span>
                </router-link>
            </div>
            <div v-if="item.projectType === 'PRIVATE'"
                 class="private-badge"
            >
                <p-i name="ic_lock-filled"
                     scale="0.8"
                     color="inherit"
                     class="badge-icon"
                />
                {{ $t('PROJECT.LANDING.INVITE_ONLY') }}
            </div>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.project-main-project-card {
    @apply flex flex-col justify-between bg-gray-100 rounded-lg cursor-pointer;
    height: 6.5rem;
    padding: 0.75rem 0.75rem 1rem;

    .main-contents {
        .title-wrapper {
            @apply flex items-center justify-between;
            .title {
                @apply flex gap-1 items-center text-paragraph-md text-gray-900;
                margin-bottom: 0.25rem;
            }
        }
        .project-group {
            @apply text-label-md text-gray-600;
        }
    }

    .sub-contents {
        @apply flex justify-between items-center;

        .provider-icon-wrapper {
            @apply flex-shrink inline-flex items-center truncate;
            .provider {
                @apply truncate;
                min-width: 0;
                height: 1.25rem;
            }
            .icon-wrapper {
                @apply rounded-full inline-flex justify-center items-center;
                height: 1.25rem;
                width: 1.25rem;
                &:hover {
                    @apply bg-blue-300;
                }
            }
            .provider-more-text {
                @apply text-label-sm text-gray-500;
                cursor: default;
                font-weight: normal;
                padding-right: 0.5rem;
            }
            &:hover {
                @apply text-secondary font-bold;
            }
            .icon-link {
                @apply flex-shrink-0 inline-block;
                height: 1.25rem;
                width: 1.25rem;
                background-repeat: no-repeat;
                background-size: 100%;
                background-position: center;
                line-height: 1.25rem;
                margin-right: 0.37rem;
                &:hover {
                    opacity: 50%;
                }
            }
        }
        .account-add {
            @apply flex-shrink-0 inline-flex text-gray-700;
            .add-label {
                @apply text-xs;
                line-height: 1.2;
            }
            &:hover {
                .add-label {
                    text-decoration: underline;
                }
            }
        }
        .private-badge {
            @apply text-gray-500 flex items-center text-label-sm;
            gap: 0.125rem;
            .badge-icon {
                margin-right: 0.125rem;
            }
        }
    }

    .favorite-button {
        display: none;

        &.starred {
            display: block;
        }
    }
    .toolset-button {
        display: none;
    }

    .toolset-group {
        @apply flex gap-1 items-center;
    }

    &:hover {
        @apply bg-gray-150;

        .toolset-button {
            display: block;
        }
        .favorite-button {
            display: block;
        }
    }
    &.toolset-active {
        @apply bg-blue-200;
    }
}

/* custom design-system component - p-select-dropdown */
:deep(.p-select-dropdown) {
    .dropdown-button-component {
        @apply rounded-full;

        &.opened {
            @apply rounded-full;
        }
    }
}

</style>
