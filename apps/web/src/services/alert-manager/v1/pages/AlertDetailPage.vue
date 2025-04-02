<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PIconButton, PHeading } from '@cloudforet/mirinae';


import type { AlertDeleteParameters } from '@/schema/monitoring/alert/api-verbs/delete';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import { NoResourceError } from '@/common/composables/error/error';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { usePageEditableStatus } from '@/common/composables/page-editable-status';

import AlertDetailInfoTable from '@/services/alert-manager/v1/components/AlertDetailInfoTable.vue';
import AlertDetailNote from '@/services/alert-manager/v1/components/AlertDetailNote.vue';
import AlertResponder from '@/services/alert-manager/v1/components/AlertDetailResponder.vue';
import AlertDetailSummary from '@/services/alert-manager/v1/components/AlertDetailSummary.vue';
import AlertDetailTabs from '@/services/alert-manager/v1/components/AlertDetailTabs.vue';
import AlertDetailTitleEditModal from '@/services/alert-manager/v1/components/AlertDetailTitleEditModal.vue';
import { ALERT_MANAGER_ROUTE_V1 } from '@/services/alert-manager/v1/routes/route-constant';
import { useAlertPageStore } from '@/services/alert-manager/v1/stores/alert-page-store';

const props = defineProps({
    id: {
        type: String,
        default: null,
    },
});
const alertPageStore = useAlertPageStore();
const alertPageState = alertPageStore.state;

const { hasReadWriteAccess } = usePageEditableStatus();

const router = useRouter();

const state = reactive({
    loading: true,
    alertTitleEditFormVisible: false,
});

const checkDeleteState = reactive({
    visible: false,
    headerTitle: i18n.t('MONITORING.ALERT.DETAIL.DELETE_MODAL_TITLE'),
});

const openAlertDeleteForm = () => {
    checkDeleteState.visible = true;
};

const alertDeleteConfirm = async () => {
    try {
        await SpaceConnector.clientV2.monitoring.alert.delete<AlertDeleteParameters>({
            alert_id: props.id,
        });
        showSuccessMessage(i18n.t('MONITORING.ALERT.DETAIL.ALT_S_DELETE_ALERT'), '');
        await router.push({ name: ALERT_MANAGER_ROUTE_V1.ALERTS._NAME });
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('MONITORING.ALERT.DETAIL.ALT_E_DELETE_ALERT'));
    } finally {
        checkDeleteState.visible = false;
    }
};

const openAlertEditForm = () => {
    state.alertTitleEditFormVisible = true;
};

const alertTitleEditConfirm = async () => {
    state.alertTitleEditFormVisible = false;
};

/* init */
(async () => {
    state.loading = true;
    try {
        await alertPageStore.getAlertData(props.id);
    } catch (e) {
        ErrorHandler.handleError(new NoResourceError({ name: ALERT_MANAGER_ROUTE_V1.ALERTS._NAME }));
    } finally {
        state.loading = false;
    }
})();
</script>

<template>
    <div v-if="!state.loading"
         class="alert-detail-note"
    >
        <p-heading class="mb-6"
                   :title="alertPageState.alertData?.title"
                   show-back-button
                   @click-back-button="router.go(-1)"
        >
            <template #title-right-extra>
                <span class="alert-number">#{{ alertPageState.alertData?.alert_number }}</span>
                <span v-if="hasReadWriteAccess"
                      class="title-btn"
                >
                    <p-icon-button name="ic_edit-text"
                                   class="edit-btn"
                                   @click="openAlertEditForm"
                    />
                    <p-icon-button name="ic_delete"
                                   class="w-full delete-btn"
                                   @click="openAlertDeleteForm"
                    />
                </span>
            </template>
        </p-heading>
        <section class="detail-contents-wrapper">
            <div class="main-contents-wrapper">
                <div class="main-contents">
                    <alert-detail-summary
                        :id="props.id"
                        :has-read-write-access="hasReadWriteAccess"
                        class="header"
                    />

                    <alert-detail-info-table
                        :id="props.id"
                        :has-read-write-access="hasReadWriteAccess"
                        class="info"
                    />
                    <alert-detail-tabs
                        :id="props.id"
                        class="timeline-and-event"
                    />
                </div>
            </div>
            <div class="sub-contents-wrapper">
                <div class="sub-contents">
                    <alert-responder :id="props.id"
                                     class="responder"
                                     :alert-data="alertPageState.alertData"
                    />
                    <alert-detail-note
                        v-if="hasReadWriteAccess"
                        :id="props.id"
                        class="note"
                    />
                </div>
            </div>
        </section>
        <delete-modal :header-title="checkDeleteState.headerTitle"
                      :visible.sync="checkDeleteState.visible"
                      :contents="$t('MONITORING.ALERT.DETAIL.DELETE_MODAL_DESC')"
                      @confirm="alertDeleteConfirm"
        />
        <alert-detail-title-edit-modal
            v-if="state.alertTitleEditFormVisible"
            :visible.sync="state.alertTitleEditFormVisible"
            :alert-id="props.id"
            @confirm="alertTitleEditConfirm"
        />
        <delete-modal :header-title="checkDeleteState.headerTitle"
                      :visible.sync="checkDeleteState.visible"
                      :contents="$t('MONITORING.ALERT.DETAIL.DELETE_MODAL_DESC')"
                      @confirm="alertDeleteConfirm"
        />
    </div>
</template>

<style lang="postcss" scoped>
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
            grid-row-start: 1;
            grid-row-end: 1;
            grid-column: span 12 / span 12;
        }

        .sub-contents-wrapper {
            grid-row-start: 2;
            grid-row-end: 2;
            grid-column: span 12 / span 12;
        }
    }

    @screen mobile {
        .sub-contents-wrapper {
            grid-column: span 12 / span 12;
            margin-top: -4rem;
        }
    }
}
</style>
