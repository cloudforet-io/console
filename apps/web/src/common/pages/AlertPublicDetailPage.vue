<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PHeading,
} from '@cloudforet/mirinae';

import { setI18nLocale } from '@/translations';

import AlertDetailInfoTable from '@/services/alert-manager/components/AlertDetailInfoTable.vue';
import AlertDetailNote from '@/services/alert-manager/components/AlertDetailNote.vue';
import AlertResponder from '@/services/alert-manager/components/AlertDetailResponder.vue';
import AlertDetailSummary from '@/services/alert-manager/components/AlertDetailSummary.vue';
import AlertDetailTabs from '@/services/alert-manager/components/AlertDetailTabs.vue';

const router = useRouter();

interface Props {
    alertUrl?: string;
    language?: string;
}

const props = defineProps<Props>();

const state = reactive({
    loading: true,
    alertData: {},
    alertId: '',
});



const fetchData = async () => {
    // try {
    //     const { costReportId } = props;
    //     if (!costReportId) return;
    //     state.baseInfo = await SpaceConnector.clientV2.costAnalysis.costReport.get<CostReportGetParameters, CostReportModel>({
    //         cost_report_id: costReportId,
    //     });
    // } catch (e: any) {
    //     ErrorHandler.handleError(e);
    //     await router.push({ name: ERROR_ROUTE.EXPIRED_LINK._NAME });
    // }
};


const setMetaTag = () => {
    const viewportEl = document.querySelector('head meta[name="viewport"]');
    if (viewportEl) (viewportEl as HTMLMetaElement).content = 'width=928';
};
const setRootTagStyle = () => {
    const htmlEl = document.querySelector('html');
    const bodyEl = document.querySelector('body');
    const appEl = document.querySelector('#app');
    if (htmlEl) {
        htmlEl.style.overflowY = 'auto';
    }
    if (bodyEl) bodyEl.style.height = 'unset';
    if (appEl) (appEl as HTMLElement).style.height = 'unset';
};


(async () => {
    setMetaTag();
    state.loading = true;
    await fetchData();
    await setI18nLocale(props.language ?? 'en');
    state.loading = false;
    setRootTagStyle();
})();

</script>

<template>
    <div class="body">
        <div class="main-content">
            <p-heading title="alertPageState.alertData?.title"
                       show-back-button
                       @click-back-button="router.go(-1)"
            >
                <template #title-right-extra>
                    <span class="alert-number">#{{ state.alertData?.alert_number }}</span>
                </template>
            </p-heading>
            <section class="detail-contents-wrapper">
                <div class="main-contents-wrapper">
                    <div class="main-contents">
                        <alert-detail-summary
                            :id="state.alertId"
                            class="header"
                        />

                        <alert-detail-info-table
                            :id="state.alertId"
                            class="info"
                        />
                        <alert-detail-tabs
                            :id="state.alertId"
                            class="timeline-and-event"
                        />
                    </div>
                </div>
                <div class="sub-contents-wrapper">
                    <div class="sub-contents">
                        <alert-responder :id="state.alertId"
                                         class="responder"
                                         :alert-data="state.alertData"
                        />
                        <alert-detail-note
                            :id="state.alertId"
                            class="note"
                        />
                    </div>
                </div>
            </section>
        </div>
        <div class="view-footer" />
    </div>
</template>

<style lang="postcss" scoped>
.body {
    .main-content {
        .alert-number {
            @apply text-gray-700;
            font-weight: 400;
            font-size: 1.5rem;
            margin-left: 0.25rem;
        }
        .title-btn {
            display: inline-flex;
            align-items: center;
            margin-left: 0.5rem;
        }
        .detail-contents-wrapper {
            @apply grid grid-cols-12 gap-4 w-full;
            grid-auto-flow: row;
            grid-auto-rows: max-content;
            justify-content: center;

            .main-contents-wrapper {
                @apply col-span-8;
                .main-contents {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
            }
            .sub-contents-wrapper {
                @apply col-span-4;
                .sub-contents {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
            }

            @screen tablet {
                margin-top: 0;
                .main-contents-wrapper {
                    @apply row-start-1 row-end-1 col-span-12;
                }

                .sub-contents-wrapper {
                    @apply row-start-2 row-end-2 col-span-12;
                }
            }

            @screen mobile {
                .sub-contents-wrapper {
                    @apply col-span-12;
                    margin-top: -4rem;
                }
            }
        }
    }
}
</style>
