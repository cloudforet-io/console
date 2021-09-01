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
        <div class="domain-tab">
            <ul>
                <li v-for="(item, index) in domainList" :key="index">
                    <p-button :class="{ 'active': item.domain_id === extraParams.domainId }"
                              class="btn"
                              @click="switchDomain(item)"
                    >
                        {{ item.name }}
                    </p-button>
                </li>
            </ul>
        </div>

        <!-- If you want to reload when the state is changed, bind key with reactive state. -->
        <div :key="extraParams.domainId" class="contents-wrapper">
            <!-- Give extra parameter objects for api requests in widgets. -->
            <div class="col-span-12 lg:col-span-9
                        widget-wrapper"
            >
                <all-summary class="col-span-12" :extra-params="extraParams" />
                <resource-map class="col-span-12" :extra-params="extraParams" />
                <personal-health-dashboard class="col-span-12" :extra-params="extraParams" />
                <trusted-advisor class="col-span-12" :extra-params="extraParams" />
                <top-projects class="col-span-12" :extra-params="extraParams" />
            </div>
            <div class="col-span-12 lg:col-span-3
                    widget-wrapper"
            >
                <div class="col-span-12 sm:col-span-6 lg:col-span-12
                        widget-wrapper"
                >
                    <favorites-widget class="hidden lg:block col-span-12"
                                      :project="project" :cloud-service="cloudService" :extra-params="extraParams"
                    />
                    <daily-updates class="col-span-12 daily-updates"
                                   :providers="providers" :extra-params="extraParams"
                    />
                </div>
                <div class="col-span-12 sm:col-span-6 lg:col-span-12
                        widget-wrapper"
                >
                    <service-accounts class="col-span-12" :providers="providers" :extra-params="extraParams" />
                    <collector-progress class="col-span-12 collector-progress" :extra-params="extraParams" />
                    <cloud-services class="col-span-12 cloud-services" :more-info="true" :extra-params="extraParams" />
                </div>
            </div>
        </div>
    </general-page-layout>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import { PButton } from '@spaceone/design-system';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';

import GeneralPageLayout from '@/common/components/layouts/GeneralPageLayout.vue';
import AllSummary from '@/views/dashboard/modules/AllSummary.vue';
import ResourceMap from '@/views/dashboard/modules/ResourceMap.vue';
import PersonalHealthDashboard from '@/views/dashboard/modules/PersonalHealthDashboard.vue';
import TrustedAdvisor from '@/views/dashboard/modules/TrustedAdvisor.vue';
import TopProjects from '@/views/dashboard/modules/TopProjects.vue';
import FavoritesWidget from '@/views/dashboard/modules/FavoritesWidget.vue';
import DailyUpdates from '@/common/modules/DailyUpdates.vue';
import ServiceAccounts from '@/views/dashboard/modules/ServiceAccounts.vue';
import CollectorProgress from '@/views/dashboard/modules/CollectingProgress.vue';
import CloudServices from '@/common/modules/CloudServices.vue';


export default {
    name: 'TotalDashboardPage',
    components: {
        PButton,
        GeneralPageLayout,
        AllSummary,
        ResourceMap,
        PersonalHealthDashboard,
        TrustedAdvisor,
        TopProjects,
        FavoritesWidget,
        DailyUpdates,
        ServiceAccounts,
        CollectorProgress,
        CloudServices,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            extraParams: computed(() => vm.$store.state.domain),
            domainList: [],
            providers: computed(() => vm.$store.state.resource.provider.items),
            project: computed(() => [...vm.$store.getters['favorite/projectGroup/sortedItems'], ...vm.$store.getters['favorite/project/sortedItems']]),
            cloudService: computed(() => vm.$store.getters['favorite/cloudServiceType/sortedItems']),
            timezone: computed(() => vm.$store.state.user.timezone || 'UTC'),
        });

        const getDomainList = async (): Promise<void> => {
            try {
                const res = await SpaceConnector.client.identity.domain.list();
                state.domainList = res.results.splice(144, 13);
            } catch (e) {
                console.error(e);
            }
        };

        const switchDomain = (domain) => {
            vm.$store.dispatch('domain/load', domain.name);
        };

        /** Init */
        (async () => {
            // Widgets does not load required resources.
            // Page components need to load resources first.
            await Promise.allSettled([
                vm.$store.dispatch('resource/provider/load'),
                vm.$store.dispatch('resource/projectGroup/load'),
                vm.$store.dispatch('resource/project/load'),
                vm.$store.dispatch('resource/cloudServiceType/load'),
                vm.$store.dispatch('favorite/projectGroup/load'),
                vm.$store.dispatch('favorite/project/load'),
                vm.$store.dispatch('favorite/cloudServiceType/load'),
                getDomainList(),
            ]);
        })();

        return {
            ...toRefs(state),
            switchDomain,
        };
    },
};
</script>

<style lang="postcss" scoped>
.total-dashboard::v-deep {
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
    margin-bottom: 3rem;
    ul {
        display: flex;
        flex-wrap: wrap;
        margin: 0 -10px;
        li {
            width: 20%;
            margin-top: 1rem;
            padding: 0 10px;
        }
    }
    .btn {
        overflow: hidden;
        display: block;
        width: 100%;
        height: 3rem;
        padding: 0 20px;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-weight: 400;
        font-size: 1rem;
        color: #444;
        background-color: #eee;
        border-radius: 4px;
        &:hover {
            background-color: #e9e9e9;
        }
        &.active {
            font-weight: 700;
            color: #fff;
            @apply bg-primary;
        }
    }
}
</style>
