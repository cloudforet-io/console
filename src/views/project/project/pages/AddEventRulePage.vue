<template>
    <general-page-layout class="add-service-account-container">
        <p-breadcrumbs class="flex-grow" :routes="routeState.routes" />
        <p-page-title child :title="$t('PROJECT.DETAIL.EVENT_RULE.EVENT_RULE')"
                      class="page-title"
                      @goBack="$router.go(-1)"
        />
    </general-page-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { computed, reactive } from '@vue/composition-api';

import {
    PPageTitle, PBreadcrumbs,
} from '@spaceone/design-system';

import GeneralPageLayout from '@/common/components/layouts/GeneralPageLayout.vue';

import { i18n } from '@/translations';

export default {
    name: 'AddEventRulePage',
    components: {
        GeneralPageLayout,
        PBreadcrumbs,
        PPageTitle,
    },
    setup() {
        const routeState = reactive({
            routes: computed(() => ([
            ])),
        });

        return {
            routeState,
        };
    },
};
</script>

<style lang="postcss" scoped>

</style>
