<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PI, PTextHighlighting,
} from '@cloudforet/mirinae';

import type { ProjectType } from '@/api-clients/identity/project/schema/type';

import { useProviderReferenceStore, type ProviderItem } from '@/store/reference/provider-reference-store';

import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';

import ProjectActionDropdownButton from '@/services/project/v2/components/ProjectActionDropdownButton.vue';
import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';
import { SERVICE_ACCOUNT_ROUTE } from '@/services/service-account/routes/route-constant';

const props = defineProps<{
    serviceAccountProviderList: string[];
    searchKeyword?: string;
    projectId: string;
    groupName?: string;
    name: string;
    projectType: ProjectType;
}>();

/* favorite */
const favoriteStore = useFavoriteStore();
const isStarred = computed(() => favoriteStore.getters.projectItems.some((item) => item.itemId === props.projectId));

/* provider */
const providerReferenceStore = useProviderReferenceStore();
const getProvider = (name: string): ProviderItem => providerReferenceStore.getters.providerItems[name] || {};

/* project select */
const router = useRouter();
const handleSelectProject = () => {
    router.replace({
        name: PROJECT_ROUTE_V2._NAME,
        params: {
            projectGroupOrProjectId: props.projectId,
        },
    }).catch(() => {
        // ignore error
    });
};

/* action menu */
const visibleActionMenu = ref(false);
</script>

<template>
    <div class="flex flex-col justify-between rounded-lg cursor-pointer h-26 pt-3 px-3 pb-4 group/card"
         :class="[visibleActionMenu ? 'bg-blue-200' : 'bg-gray-100 hover:bg-gray-150']"
         @click="handleSelectProject"
    >
        <div>
            <div class="flex items-center justify-between">
                <div class="flex gap-1 items-center text-paragraph-md text-gray-900 mb-1 group-hover/card:font-medium">
                    <p-i name="ic_project-filled"
                         width="1rem"
                         height="1rem"
                    />
                    <p-text-highlighting :text="props.name"
                                         :term="props.searchKeyword"
                    />
                </div>

                <div class="flex gap-1 items-center">
                    <project-action-dropdown-button :project-id="props.projectId"
                                                    @update:visible="visibleActionMenu = $event"
                    />
                    <div :class="['hidden', (isStarred || visibleActionMenu) ? '!block' : 'group-hover/card:block']">
                        <favorite-button :item-id="props.projectId"
                                         :favorite-type="FAVORITE_TYPE.PROJECT"
                        />
                    </div>
                </div>
            </div>
        </div>
        <div class="flex justify-between items-center">
            <div v-if="props.serviceAccountProviderList.length > 0"
                 class="flex-shrink inline-flex items-center truncate hover:text-secondary hover:font-bold"
            >
                <div class="truncate min-w-0 h-5">
                    <template v-for="(provider, index) in props.serviceAccountProviderList">
                        <router-link v-if="index < 5"
                                     :key="index"
                                     :to="{name: SERVICE_ACCOUNT_ROUTE._NAME,query: { provider: getProvider(provider) ? provider : null },}"
                                     class="flex-shrink-0 inline-block w-5 h-5 bg-no-repeat bg-[length:100%] bg-center hover:opacity-50 mr-[0.37rem]"
                                     :style="{backgroundImage: `url('${getProvider(provider).icon || require('@/assets/images/ic_cloud-filled.svg')}')`}"
                                     @click.native.stop.prevent
                        />
                    </template>
                </div>
                <span v-if="props.serviceAccountProviderList.length > 5"
                      class="text-label-sm text-gray-500 cursor-default font-normal pr-2"
                >
                    ...
                </span>
                <router-link v-if="props.serviceAccountProviderList.length !== 0"
                             class="rounded-full inline-flex justify-center items-center h-5 w-5 hover:bg-blue-300"
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
                 class="flex-shrink-0 inline-flex text-gray-700 group/account"
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
                    <span class="text-xs group-hover/account:underline"> {{ $t('PROJECT.LANDING.ADD_SERVICE_ACCOUNT') }}</span>
                </router-link>
            </div>
            <div v-if="props.projectType === 'PRIVATE'"
                 class="text-gray-500 flex items-center text-label-sm gap-[0.125rem]"
            >
                <p-i name="ic_lock-filled"
                     scale="0.8"
                     color="inherit"
                     class="mr-[0.125rem]"
                />
                {{ $t('PROJECT.LANDING.INVITE_ONLY') }}
            </div>
        </div>
    </div>
</template>

