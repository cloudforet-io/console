<template>
    <div class="left-area">
        <div class="radio-container">
            <div class="provider">
                <p-field-title class="title">
                    Provider
                </p-field-title>
                <p-radio-group direction="vertical">
                    <p-radio v-for="provider in state.providerList"
                             :key="provider.name"
                             :selected="state.selectedProvider"
                             :value="provider.name"
                             class="provider-item"
                             @change="handleChangeProvider"
                    >
                        <div class="content-menu-item">
                            <p-lazy-img v-if="provider.name !== 'all'"
                                        width="1.25rem"
                                        height="1.25rem"
                                        error-icon="ic_cloud-filled"
                                        :src="provider.img"
                                        class="mr-1"
                            />{{ provider.label }}
                        </div>
                    </p-radio>
                </p-radio-group>
            </div>
            <div class="repository">
                <p-field-title class="title">
                    Repository
                </p-field-title>
                <p-radio-group direction="vertical">
                    <p-radio v-for="repo in state.repositoryList"
                             :key="repo.name"
                             v-model="state.selectedRepository"
                             :value="repo.name"
                             class="repository-item"
                    >
                        <div class="content-menu-item"
                             :style="{color: repo.color}"
                        >
                            <p-i v-if="repo.icon"
                                 :name="repo.icon"
                                 :color="repo.color"
                                 width="1.25rem"
                                 height="1.25rem"
                                 class="mr-1"
                            />{{ repo.label }}
                        </div>
                    </p-radio>
                </p-radio-group>
            </div>
        </div>
        <div class="dropdown-container">
            <div class="provider">
                <p-select-dropdown :selected="state.selectedProvider"
                                   :items="state.providerList"
                                   class="select-dropdown"
                                   @update:selected="handleChangeProvider"
                >
                    <template #default="{ item }">
                        <span class="content-menu-placeholder">
                            <p-lazy-img v-if="item.name !== 'all'"
                                        width="1rem"
                                        height="1rem"
                                        error-icon="ic_cloud-filled"
                                        :src="item.img"
                                        class="mr-1"
                            /><span>{{ item.label }}</span>
                        </span>
                    </template>
                    <template #menu-item--format="{ item }">
                        <div class="content-menu-item">
                            <p-lazy-img v-if="item.name !== 'all'"
                                        width="1rem"
                                        height="1rem"
                                        error-icon="ic_cloud-filled"
                                        :src="item.img"
                                        class="mr-1"
                            /><span>{{ item.label }}</span>
                        </div>
                    </template>
                </p-select-dropdown>
            </div>
            <div class="repository">
                <p-select-dropdown v-model:selected="state.selectedRepository"
                                   :items="state.repositoryList"
                                   class="select-dropdown"
                >
                    <template #default="{ item }">
                        <div class="content-menu-placeholder">
                            <span>{{ item.label }}</span>
                        </div>
                    </template>
                    <template #menu-item--format="{ item }">
                        <div class="content-menu-item">
                            <span>{{ item.label }}</span>
                        </div>
                    </template>
                </p-select-dropdown>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PFieldTitle, PRadioGroup, PRadio, PLazyImg, PSelectDropdown, PI,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import { computed, reactive, watch } from 'vue';
import { useStore } from 'vuex';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { repositoryColorMap, repositoryIconMap } from '@/services/asset-inventory/collector/config';
import type { RepositoryInfo } from '@/services/asset-inventory/collector/model';
import {
    useCollectorFormStore,
} from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.$state;

const emit = defineEmits<{(e:'select-repository', repository: string):void}>();
const store = useStore();

const state = reactive({
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
    providerList: computed(() => [
        { name: 'all', label: 'All Providers', img: undefined },
        ...Object.keys(state.providers).map((k) => ({
            label: state.providers[k].name,
            name: k,
            img: state.providers[k]?.icon,
        })),
        { name: 'etc', label: 'ETC', img: undefined },
    ]),
    selectedProvider: computed(() => collectorFormState.provider ?? 'all'),
    repositories: [],
    repositoryList: computed<MenuItem[]>(() => ([
        {
            name: 'all', label: 'All Repository', icon: null, color: null,
        },
        ...state.repositories.map((repo: RepositoryInfo) => ({
            label: repo.name,
            name: repo.repository_id,
            icon: repositoryIconMap[repo.repository_type],
            color: repositoryColorMap[repo.repository_type],
            iconColor: repositoryColorMap[repo.repository_type],
        })),
    ])),
    selectedRepository: 'all',
});

const repoApiQuery = new ApiQueryHelper();
const getRepositories = async () => {
    try {
        repoApiQuery.setSort('repository_type', true);
        const res = await SpaceConnector.client.repository.repository.list({
            query: repoApiQuery.data,
        });
        state.repositories = res.results;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.repositories = [];
    }
};

const handleChangeProvider = (provider) => {
    const providerValue = provider === 'all' ? null : provider;
    collectorFormStore.setProvider(providerValue);
};

watch(() => state.selectedRepository, (repository) => {
    emit('select-repository', repository);
});

(async () => {
    await getRepositories();
})();

</script>

<style lang="postcss" scoped>
.left-area {
    width: 14.125rem;
    .content-menu-item {
        @apply inline-flex items-center text-label-md;
        margin-left: 0.25rem;
    }

    .content-menu-placeholder {
        @apply inline-flex items-center text-label-md;
        line-height: 1.5;
        margin-left: 0.25rem;
        width: 100%;

        span {
            @apply truncate;
        }
    }

    .select-dropdown {
        width: 100%;
    }

    .provider {
        @apply flex flex-col;
        gap: 0.75rem;
        margin-bottom: 1.625rem;

        .provider-item {
            margin-bottom: 0.5rem;
        }
    }

    .repository {
        @apply flex flex-col;
        gap: 0.75rem;
        .repository-item {
            margin-bottom: 0.5rem;
        }
    }
    .radio-container {
        height: calc(100vh - 17rem);
        overflow-y: auto;
    }

    .dropdown-container {
        width: 100%;
        display: none;
    }
}

@screen tablet {
    @apply flex-col;

    .left-area {
        width: 100%;
        .radio-container {
            display: none;
        }
        .dropdown-container {
            @apply flex gap-4;
        }
    }
}

@screen mobile {
    .left-area {
        .dropdown-container {
            @apply grid grid-cols-2 gap-4;
            width: 100%;

            /* custom design-system component - p-select-dropdown */
            &:deep(.p-select-dropdown) {
                .text {
                    width: calc(100% - 1.25rem);
                }
            }
        }
    }
}
</style>

