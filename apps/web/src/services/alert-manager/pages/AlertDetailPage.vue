<template>
    <div v-if="!loading"
         class="alert-detail-note"
    >
        <p-heading :title="alertPageState.alertData?.title"
                   show-back-button
                   @click-back-button="$router.go(-1)"
        >
            <template #title-right-extra>
                <span class="alert-number">#{{ alertPageState.alertData?.alert_number }}</span>
                <span class="title-btn">
                    <p-icon-button name="ic_delete"
                                   class="w-full delete-btn"
                                   :disabled="!hasManagePermission"
                                   @click="openAlertDeleteForm"
                    />
                    <p-icon-button name="ic_edit-text"
                                   class="edit-btn"
                                   :disabled="!hasManagePermission"
                                   @click="openAlertEditForm"
                    />
                </span>
            </template>
        </p-heading>
        <section class="detail-contents-wrapper">
            <div class="main-contents-wrapper">
                <div class="main-contents">
                    <alert-detail-summary
                        :id="id"
                        class="header"
                        :manage-disabled="!hasManagePermission"
                    />

                    <alert-detail-info-table
                        :id="id"
                        class="info"
                        :manage-disabled="!hasManagePermission"
                    />
                    <alert-detail-status-update
                        :id="id"
                        :manage-disabled="!hasManagePermission"
                        class="status-update"
                    />
                    <alert-detail-tabs
                        :id="id"
                        class="timeline-and-event"
                    />
                </div>
            </div>
            <div class="sub-contents-wrapper">
                <div class="sub-contents">
                    <alert-responder :id="id"
                                     class="responder"
                                     :alert-data="alertPageState.alertData"
                                     :manage-disabled="!hasManagePermission"
                    />
                    <alert-detail-note
                        :id="id"
                        :manage-disabled="!hasManagePermission"
                        class="note"
                    />
                    <alert-detail-project-dependency :id="id"
                                                     class="project-dependency"
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
            v-if="alertTitleEditFormVisible"
            :visible.sync="alertTitleEditFormVisible"
            :alert-id="id"
            @confirm="alertTitleEditConfirm"
        />
        <delete-modal :header-title="checkDeleteState.headerTitle"
                      :visible.sync="checkDeleteState.visible"
                      :contents="$t('MONITORING.ALERT.DETAIL.DELETE_MODAL_DESC')"
                      @confirm="alertDeleteConfirm"
        />
    </div>
</template>

<script lang="ts">
import {
    getCurrentInstance, reactive, toRefs,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import { PIconButton, PHeading } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import { NoResourceError } from '@/common/composables/error/error';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import AlertDetailInfoTable from '@/services/alert-manager/components/AlertDetailInfoTable.vue';
import AlertDetailNote from '@/services/alert-manager/components/AlertDetailNote.vue';
import AlertDetailProjectDependency
    from '@/services/alert-manager/components/AlertDetailProjectDependency.vue';
import AlertResponder from '@/services/alert-manager/components/AlertDetailResponder.vue';
import AlertDetailStatusUpdate
    from '@/services/alert-manager/components/AlertDetailStatusUpdate.vue';
import AlertDetailSummary from '@/services/alert-manager/components/AlertDetailSummary.vue';
import AlertDetailTabs from '@/services/alert-manager/components/AlertDetailTabs.vue';
import AlertDetailTitleEditModal from '@/services/alert-manager/components/AlertDetailTitleEditModal.vue';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/routes/route-constant';
import { useAlertPageStore } from '@/services/alert-manager/stores/alert-page-store';

export default {
    name: 'AlertDetailPage',
    components: {
        AlertDetailStatusUpdate,
        AlertDetailProjectDependency,
        AlertDetailTitleEditModal,
        AlertDetailNote,
        AlertDetailTabs,
        AlertResponder,
        AlertDetailInfoTable,
        AlertDetailSummary,
        DeleteModal,
        PHeading,
        PIconButton,
    },
    props: {
        id: {
            type: String,
            default: null,
        },
    },
    setup(props) {
        const alertPageStore = useAlertPageStore();
        const alertPageState = alertPageStore.$state;

        const vm = getCurrentInstance()?.proxy as Vue;

        const state = reactive({
            hasManagePermission: useManagePermissionState(),
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
                await SpaceConnector.client.monitoring.alert.delete({
                    alerts: [props.id],
                });
                showSuccessMessage(i18n.t('MONITORING.ALERT.DETAIL.ALT_S_DELETE_ALERT'), '');
                await vm.$router.push({ name: ALERT_MANAGER_ROUTE.ALERT._NAME });
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
                ErrorHandler.handleError(new NoResourceError({ name: ALERT_MANAGER_ROUTE.ALERT._NAME }));
            } finally {
                state.loading = false;
            }
        })();

        return {
            ...toRefs(state),
            checkDeleteState,
            alertPageState,
            openAlertDeleteForm,
            alertDeleteConfirm,
            openAlertEditForm,
            alertTitleEditConfirm,
        };
    },
};
</script>

<style lang="postcss" scoped>
.alert-detail-note {
    @apply bg-gray-100;
}
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
</style>
