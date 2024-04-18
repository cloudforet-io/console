<script setup lang="ts">

import { computed, onMounted, reactive } from 'vue';

import {
    PFieldTitle, PI, PBadge,
} from '@spaceone/design-system';
import { uniq } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ServiceAccountListParameters } from '@/schema/identity/service-account/api-verbs/list';
import type { ServiceAccountModel } from '@/schema/identity/service-account/model';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProviderItem, ProviderReferenceMap } from '@/store/reference/provider-reference-store';
import type { ServiceAccountItem } from '@/store/reference/service-account-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';

import { indigo, peacock } from '@/styles/colors';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';



const allReferenceStore = useAllReferenceStore();

const storeState = reactive({
    providers: computed<ProviderReferenceMap>(() => allReferenceStore.getters.provider),
    serviceAccountList: computed<ServiceAccountItem[]>(() => Object.values(allReferenceStore.getters.serviceAccount)),
});

const state = reactive({
    serviceAccountList: [] as ServiceAccountModel[],
});


/* Utill */
const getDistinctProviders = (projectId: string): string[] => uniq(state.serviceAccountList.filter((d) => d.project_id === projectId).map((d) => d.provider));
const getProvider = (name: string): ProviderItem => storeState.providers[name] || {};


const handleSelectProjectGroup = () => {
    console.debug('PG');
    console.debug(getDistinctProviders('project-1a7eb5453099'));
    console.debug(state.serviceAccountList.filter((account) => account.project_id === 'project-1a7eb5453099'));
};

const listServiceAccount = async () => {
    try {
        const params: ServiceAccountListParameters = {
            query: {
                only: ['provider', 'project_id'],
            },
        };
        const response = await SpaceConnector.clientV2.identity.serviceAccount.list<ServiceAccountListParameters, ListResponse<ServiceAccountModel>>(params);
        state.serviceAccountList = response.results || [];
    } catch (e) {
        state.serviceAccountList = [];
        ErrorHandler.handleError(e);
    }
};

onMounted(async () => {
    await listServiceAccount();
});

</script>

<template>
    <div class="project-main">
        <div class="project-contents">
            <div class="contents-wrapper">
                <p-field-title class="content-title"
                               :label="$t('Project Group')"
                >
                    <template #right>
                        <span>({{ 5 }})</span>
                    </template>
                </p-field-title>
                <div class="card-contents">
                    <div class="project-group-card"
                         @click="handleSelectProjectGroup"
                    >
                        <div class="project-group-item">
                            <p-i name="ic_folder-filled"
                                 :color="indigo[500]"
                                 width="1rem"
                                 height="1rem"
                            />
                            <span class="project-group-name">German Gummy</span>
                        </div>
                        <favorite-button :item-id="'group id'"
                                         :favorite-type="FAVORITE_TYPE.PROJECT_GROUP"
                                         scale="0.8"
                                         class="favorite-button"
                        />
                    </div>
                </div>
            </div>

            <div class="contents-wrapper">
                <p-field-title class="content-title"
                               :label="$t('Project')"
                >
                    <template #right>
                        <span>({{ 5 }})</span>
                    </template>
                </p-field-title>
                <div class="card-contents">
                    <div class="project-card">
                        <div class="main-contents">
                            <div class="title-wrapper">
                                <div class="title">
                                    <p-i name="ic_document-filled"
                                         :color="peacock[600]"
                                         width="1rem"
                                         height="1rem"
                                    />
                                    <span class="text">
                                        Community Connector
                                    </span>
                                </div>

                                <favorite-button class="favorite-button"
                                                 item-id="project-1a7eb5453099"
                                                 :favorite-type="FAVORITE_TYPE.PROJECT"
                                />
                            </div>
                            <span class="project-group">
                                SpaceONE Project Group
                            </span>
                        </div>
                        <div class="sub-contents">
                            <div v-if="getDistinctProviders('project-1a7eb5453099').length > 0"
                                 class="provider-icon-wrapper"
                            >
                                <div class="provider">
                                    <template v-for="(provider, index) in getDistinctProviders('project-1a7eb5453099')">
                                        <router-link v-if="index < 5"
                                                     :key="index"
                                                     :to="{name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME,query: { provider: getProvider(provider) ? provider : null },}"
                                                     class="icon-link"
                                                     :style="{backgroundImage: `url('${getProvider(provider).icon || require('@/assets/images/ic_cloud-filled.svg')}')`}"
                                        />
                                    </template>
                                </div>
                                <span v-if="getDistinctProviders('project-1a7eb5453099').length > 5"
                                      class="provider-more-text"
                                >
                                    ...
                                </span>
                                <router-link v-if="getDistinctProviders('project-1a7eb5453099').length !== 0"
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
                            <p-badge badge-type="subtle"
                                     style-type="gray100"
                            >
                                <p-i name="ic_lock-filled"
                                     scale="0.8"
                                     color="inherit"
                                     class="badge-icon"
                                />
                                {{ $t('PROJECT.LANDING.INVITE_ONLY') }}
                            </p-badge>
                            <!--                            <p-badge v-if="item.project_type === 'PRIVATE'"-->
                            <!--                                     badge-type="subtle"-->
                            <!--                                     style-type="gray100"-->
                            <!--                            >-->
                            <!--                                <p-i name="ic_lock-filled"-->
                            <!--                                     scale="0.8"-->
                            <!--                                     color="inherit"-->
                            <!--                                     class="badge-icon"-->
                            <!--                                />-->
                            <!--                                {{ $t('PROJECT.LANDING.INVITE_ONLY') }}-->
                            <!--                            </p-badge>-->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.project-main {

    .project-contents {
        .contents-wrapper {
            margin-bottom: 1.5rem;

            .content-title {
                margin-bottom: 0.5rem;
            }

            .card-contents {
                @apply grid;
                gap: 1rem;
                grid-template-columns: repeat(auto-fill, minmax(18.75rem, 1fr));
                .project-group-card {
                    @apply flex items-center justify-between bg-white border border-gray-200 rounded-lg cursor-pointer;
                    height: 2.625rem;
                    padding: 0.75rem;

                    .project-group-item {
                        @apply flex gap-1;

                        .project-group-name {
                            @apply text-label-md text-gray-900;
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

                .project-card {
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
            }
        }
    }
}
</style>
