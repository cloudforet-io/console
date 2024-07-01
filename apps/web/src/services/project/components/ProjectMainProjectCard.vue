<script setup lang="ts">

import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { PI, PBadge, PTextHighlighting } from '@spaceone/design-system';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import type { ProviderItem, ProviderReferenceMap } from '@/store/reference/provider-reference-store';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';

import { peacock } from '@/styles/colors';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';
import type { ProjectCardItemType } from '@/services/project/types/project-type';

interface Props {
    item: ProjectCardItemType;
    serviceAccountProviderList: string[];
    searchKeyword?: string;
}

const props = defineProps<Props>();

const allReferenceStore = useAllReferenceStore();
const favoriteStore = useFavoriteStore();
const favoriteGetters = favoriteStore.getters;
const router = useRouter();
const { getProperRouteLocation } = useProperRouteLocation();

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
});
const getProvider = (name: string): ProviderItem => storeState.providers[name] || {};


const handleSelectProject = () => {
    router.push(getProperRouteLocation({
        name: PROJECT_ROUTE.DETAIL.TAB.DASHBOARD._NAME,
        params: {
            id: props.item.id as string,
        },
    }));
};
</script>

<template>
    <div class="project-main-project-card"
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

                <favorite-button :class="{'favorite-button': true, 'starred': state.isStarred }"
                                 :item-id="props.item.id"
                                 :favorite-type="FAVORITE_TYPE.PROJECT"
                />
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
                                     :to="{name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME,query: { provider: getProvider(provider) ? provider : null },}"
                                     class="icon-link"
                                     :style="{backgroundImage: `url('${getProvider(provider).icon || require('@/assets/images/ic_cloud-filled.svg')}')`}"
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
                             :to="{ name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME }"
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
                <router-link :to="{ name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME }">
                    <p-i name="ic_plus_thin"
                         scale="0.8"
                         color="inherit"
                    />
                </router-link>
                <router-link :to="{ name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME }">
                    <span class="add-label"> {{ $t('PROJECT.LANDING.ADD_SERVICE_ACCOUNT') }}</span>
                </router-link>
            </div>
            <p-badge v-if="item.projectType === 'PRIVATE'"
                     badge-type="subtle"
                     style-type="gray100"
            >
                <p-i name="ic_lock-filled"
                     scale="0.8"
                     color="inherit"
                     class="badge-icon"
                />
                {{ $t('PROJECT.LANDING.INVITE_ONLY') }}
            </p-badge>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.project-main-project-card {
    @apply flex flex-col justify-between bg-white border border-gray-200 rounded-lg cursor-pointer;
    height: 6.375rem;
    padding: 1rem 1rem 0.5rem;

    .main-contents {
        .title-wrapper {
            @apply flex items-center justify-between;
            .title {
                @apply flex gap-1 items-center text-label-lg text-gray-900;
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
            @apply flex-shrink-0 inline-flex text-gray-900;
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
        .badge-icon {
            margin-right: 0.125rem;
        }
    }

    .favorite-button {
        display: none;

        &.starred {
            display: block;
        }
    }

    &:hover {
        @apply bg-blue-100;

        .favorite-button {
            display: block;
        }
    }
}

</style>
