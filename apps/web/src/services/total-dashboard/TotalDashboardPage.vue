<template>
    <!-- You can choose a layout in src/common/components/layouts.
         Give component's name to root element or component with dash case. -->
    <general-page-layout class="total-dashboard">
        <!-- You can use tailwindcss class names.
             See tailwind.config.js to use customized classes. -->
        <div class="flex flex-wrap justify-between items-center">
            <p class="text-xl font-bold mb-4">
                ROOT DOMAIN - TOTAL DASHBOARD
            </p>
        </div>

        <!-- KB Domain Tab -->
        <div v-if="domainList.length > 0"
             class="domain-tab"
        >
            <ul>
                <li v-for="(domain) in domainList"
                    :key="domain.domain_id"
                >
                    <p-button :class="{ 'active': domain.domain_id === selectedDomainId }"
                              class="btn"
                              @click="switchDomain(domain)"
                    >
                        {{ domain.name }}
                    </p-button>
                </li>
            </ul>
        </div>

        <!-- If you want to reload when the state is changed, bind key with reactive state. -->
        <p-data-loader :loading="loading"
                       disable-empty-case
        >
            <div :key="selectedDomainId"
                 class="contents-wrapper"
            >
                <!-- Give extra parameter objects for api requests in widgets. -->
                <div class="col-span-12 lg:col-span-9
                        widget-wrapper"
                >
                    <all-summary class="col-span-12"
                                 :extra-params="extraParams"
                    />
                    <resource-map class="col-span-12"
                                  :extra-params="extraParams"
                    />
                    <personal-health-dashboard class="col-span-12"
                                               :extra-params="extraParams"
                    />
                    <trusted-advisor class="col-span-12"
                                     :extra-params="extraParams"
                    />
                    <top-projects class="col-span-12"
                                  :extra-params="extraParams"
                    />
                </div>
                <div class="col-span-12 lg:col-span-3
                    widget-wrapper"
                >
                    <div class="col-span-12 sm:col-span-6 lg:col-span-12
                        widget-wrapper"
                    >
                        <daily-updates class="col-span-12 daily-updates"
                                       :extra-params="extraParams"
                        />
                    </div>
                    <div class="col-span-12 sm:col-span-6 lg:col-span-12
                        widget-wrapper"
                    >
                        <service-accounts class="col-span-12"
                                          :extra-params="extraParams"
                        />
                        <collector-progress class="col-span-12 collector-progress"
                                            :extra-params="extraParams"
                        />
                        <cloud-services class="col-span-12 cloud-services"
                                        :more-info="true"
                                        :extra-params="extraParams"
                        />
                    </div>
                </div>
            </div>
        </p-data-loader>
    </general-page-layout>
</template>

<script lang="ts">
import {
    computed, getCurrentInstance, reactive, toRefs,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import { PButton, PDataLoader } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { DomainListParameters, DomainListResponse } from '@/schema/identity/domain/api-verbs/list';
import type { DomainModel } from '@/schema/identity/domain/model';
import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import DailyUpdates from '@/common/modules/widgets/DailyUpdates.vue';

import CloudServices from '@/services/asset-inventory/components/CloudServices.vue';
import AllSummary from '@/services/home-dashboard/components/AllSummary.vue';
import CollectorProgress from '@/services/home-dashboard/components/CollectingProgress.vue';
import PersonalHealthDashboard from '@/services/home-dashboard/components/PersonalHealthDashboard.vue';
import ResourceMap from '@/services/home-dashboard/components/ResourceMap.vue';
import ServiceAccounts from '@/services/home-dashboard/components/ServiceAccounts.vue';
import TopProjects from '@/services/home-dashboard/components/TopProjects.vue';
import TrustedAdvisor from '@/services/home-dashboard/components/TrustedAdvisor.vue';

interface ExtraParams {
    domain_id?: string;
}

export default {
    name: 'TotalDashboardPage',
    components: {
        PButton,
        PDataLoader,
        GeneralPageLayout,
        AllSummary,
        ResourceMap,
        PersonalHealthDashboard,
        TrustedAdvisor,
        TopProjects,
        DailyUpdates,
        ServiceAccounts,
        CollectorProgress,
        CloudServices,
    },
    setup() {
        const vm = getCurrentInstance()?.proxy as Vue;
        const state = reactive({
            loading: false,
            domainList: [] as DomainModel[],
            selectedDomainId: '',
            extraParams: computed<ExtraParams>(() => {
                const params: ExtraParams = {};
                if (state.selectedDomainId) params.domain_id = state.selectedDomainId;
                return params;
            }),
            timezone: computed(() => vm.$store.state.user.timezone || 'UTC'),
        });

        const getDomainList = async (): Promise<void> => {
            if (state.loading) return;

            state.loading = true;
            try {
                const { results } = await SpaceConnector.clientV2.identity.domain.list<DomainListParameters, DomainListResponse>();
                state.domainList = results;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.domainList = [];
            } finally {
                state.loading = false;
            }
        };

        const switchDomain = (domain?) => {
            state.selectedDomainId = domain?.domain_id;
        };

        /** Init */
        (async () => {
            await Promise.allSettled([
                store.dispatch('reference/provider/load'),
                getDomainList(),
            ]);
            switchDomain(state.domainList[0]);
        })();

        return {
            ...toRefs(state),
            switchDomain,
        };
    },
};
</script>

<style lang="postcss" scoped>
/* custom general-page-layout */
:deep(.total-dashboard) {
    @apply bg-gray-100;
    height: auto;
    .page-contents {
        @apply bg-gray-100;
        max-width: 1368px;
        padding: 1.5rem;
        margin: 0 auto;
    }
}

.contents-wrapper {
    @apply grid grid-cols-12;
    grid-auto-flow: row;
    grid-gap: 1.25rem;
}

.widget-wrapper {
    @apply grid-cols-12;
    grid-auto-rows: max-content;
    display: inline-grid;
    grid-gap: 1.25rem;
}

.daily-updates {
    height: 33.75rem;
}

@screen lg {
    .daily-updates {
        height: 48rem;
    }
}

.domain-tab {
    position: relative;
    margin-bottom: 2.5rem;
    overflow: hidden;
    ul {
        display: flex;
        flex-wrap: wrap;
        margin: -1rem -0.5rem 0;
        li {
            width: 20%;
            margin-top: 1rem;
            padding: 0 0.5rem;
        }
    }
    .btn {
        @apply rounded-md;
        overflow: hidden;
        display: block;
        width: 100%;
        height: 3rem;
        padding: 0 1rem;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-weight: 400;
        font-size: 1rem;
        color: #444;
        background-color: #eee;
        &:hover {
            background-color: #e9e9e9;
        }
        &.active {
            @apply bg-primary;
            font-weight: 700;
            color: #fff;
        }
    }
}
</style>
