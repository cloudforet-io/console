<template>
    <general-page-layout class="alert-detail-page">
        <p-breadcrumbs :routes="routeState.route" />
        <p-page-title :title="id" child class="page-title"
                      @goBack="$router.go(-1)"
        />
        <section class="detail-contents-wrapper">
            <alert-detail-header class="header" :id="id" />
            <alert-detail-responder class="responder" :id="id" />
            <alert-detail-info class="info" :id="id" />
            <alert-detail-note class="note" :id="id" />
            <alert-detail-timeline class="timeline" :id="id" />
        </section>
    </general-page-layout>
</template>

<script lang="ts">
import { PBreadcrumbs, PPageTitle } from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import GeneralPageLayout from '@/common/components/layouts/GeneralPageLayout.vue';
import AlertDetailHeader from '@/views/monitoring/alert/modules/alert-detail/AlertDetailHeader.vue';
import AlertDetailInfo from '@/views/monitoring/alert/modules/alert-detail/AlertDetailInfo.vue';
import AlertDetailResponder from '@/views/monitoring/alert/modules/alert-detail/AlertDetailResponder.vue';
import AlertDetailTimeline from '@/views/monitoring/alert/modules/alert-detail/AlertDetailTimeline.vue';
import AlertDetailNote from '@/views/monitoring/alert/modules/alert-detail/AlertDetailNote.vue';

export default {
    name: 'AlertDetailPage',
    components: {
        AlertDetailNote,
        AlertDetailTimeline,
        AlertDetailResponder,
        AlertDetailInfo,
        AlertDetailHeader,
        GeneralPageLayout,
        PBreadcrumbs,
        PPageTitle,
    },
    props: {
        id: {
            type: String,
            default: null,
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
        });

        const routeState = reactive({
            route: computed(() => [
                { name: vm.$t('MENU.MONITORING.MONITORING'), path: '/monitoring' },
                { name: vm.$t('MENU.MONITORING.ALERT_SYSTEM'), path: '/monitoring/alert-system/dashboard' },
                { name: props.id },
            ]),
        });

        return {
            ...toRefs(state),
            routeState,
        };
    },
};
</script>

<style lang="postcss" scoped>
.alert-detail-page {
    @apply bg-gray-100;
}
.detail-contents-wrapper {
    @apply grid grid-cols-12 gap-4 w-full;
    grid-auto-flow: row;
    grid-auto-rows: max-content;

    .header {
        @apply col-span-8;
        max-height: 6.125rem;

        @screen mobile {
            @apply col-span-12 row-start-1;
            max-height: none;
        }

        @screen tablet {
            @apply col-span-12 row-start-1;
            max-height: none;
        }
    }
    .responder {
        @apply col-span-4;

        @screen tablet {
            @apply col-span-6 row-start-4;
        }

        @screen mobile {
            @apply col-span-12 row-start-4;
        }
    }
    .info {
        @apply col-span-8;

        @screen mobile {
            @apply col-span-12 row-start-2;
        }

        @screen tablet {
            @apply col-span-12 row-start-2;
        }
    }
    .note {
        @apply col-span-4;

        @screen tablet {
            @apply col-span-6 row-start-4;
        }

        @screen mobile {
            @apply col-span-12 row-start-5;
        }

    }
    .timeline {
        @apply col-span-8;

        @screen mobile {
            @apply col-span-12 row-start-3;
        }

        @screen tablet {
            @apply col-span-12 row-start-3;
        }
    }
}
</style>
