<template>
    <div v-if="!loading"
         class="alert-detail-page"
    >
        <p-heading :title="alertInfo.title"
                   show-back-button
                   @click-back-button="$router.go(-1)"
        >
            <template #title-right-extra>
                <span class="alert-number">#{{ alertInfo.alert_number }}</span>
                <span class="title-btn">
                    <p-icon-button name="ic_trashcan"
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
            <div class="left-wrapper">
                <alert-summary :id="id"
                               class="header"
                               :alert-data="alertInfo"
                               :manage-disabled="!hasManagePermission"
                />

                <alert-key-info :id="id"
                                class="info"
                                :alert-data="alertInfo"
                                :manage-disabled="!hasManagePermission"
                />
                <alert-status-update :id="id"
                                     :alert-data="alertInfo"
                                     :manage-disabled="!hasManagePermission"
                                     class="status-update"
                />
                <alert-timeline-and-event :id="id"
                                          :alert-data="alertInfo"
                                          class="timeline-and-event"
                />
            </div>
            <div class="right-wrapper">
                <alert-responder :id="id"
                                 class="responder"
                                 :alert-data="alertInfo"
                                 :manage-disabled="!hasManagePermission"
                />
                <alert-note :id="id"
                            :manage-disabled="!hasManagePermission"
                            class="note"
                />
                <alert-project-dependency :id="id"
                                          :alert-data="alertInfo"
                                          class="project-dependency"
                />
            </div>
        </section>
        <delete-modal :header-title="checkDeleteState.headerTitle"
                      :visible.sync="checkDeleteState.visible"
                      :contents="$t('MONITORING.ALERT.DETAIL.DELETE_MODAL_DESC')"
                      @confirm="alertDeleteConfirm"
        />
        <alert-title-edit-modal v-if="alertTitleEditFormVisible"
                                :visible.sync="alertTitleEditFormVisible"
                                :alert-id="id"
                                :alert-title="alertInfo.title"
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
    computed, getCurrentInstance, reactive, toRefs,
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

import AlertKeyInfo from '@/services/alert-manager/alert/alert-detail/modules/alert-key-info/AlertKeyInfo.vue';
import AlertResponder from '@/services/alert-manager/alert/alert-detail/modules/alert-responder/AlertResponder.vue';
import AlertSummary from '@/services/alert-manager/alert/alert-detail/modules/alert-summary/AlertSummary.vue';
import AlertNote from '@/services/alert-manager/alert/alert-detail/modules/AlertNote.vue';
import AlertProjectDependency
    from '@/services/alert-manager/alert/alert-detail/modules/AlertProjectDependency.vue';
import AlertStatusUpdate
    from '@/services/alert-manager/alert/alert-detail/modules/AlertStatusUpdate.vue';
import AlertTimelineAndEvent from '@/services/alert-manager/alert/alert-detail/modules/AlertTimelineAndEvent.vue';
import AlertTitleEditModal from '@/services/alert-manager/alert/alert-detail/modules/AlertTitleEditModal.vue';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/route-config';
import { alertManagerStore } from '@/services/alert-manager/store';

export default {
    name: 'AlertDetailPage',
    components: {
        AlertStatusUpdate,
        AlertProjectDependency,
        AlertTitleEditModal,
        AlertNote,
        AlertTimelineAndEvent,
        AlertResponder,
        AlertKeyInfo,
        AlertSummary,
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
        const vm = getCurrentInstance()?.proxy as Vue;

        const state = reactive({
            hasManagePermission: useManagePermissionState(),
            alertInfo: computed(() => alertManagerStore.state.alert.alertData),
            loading: true,
            //
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
                await alertManagerStore.dispatch('alert/getAlertData', props.id);
            } catch (e) {
                ErrorHandler.handleError(new NoResourceError({ name: ALERT_MANAGER_ROUTE.ALERT._NAME }));
            } finally {
                state.loading = false;
            }
        })();

        return {
            ...toRefs(state),
            checkDeleteState,
            openAlertDeleteForm,
            alertDeleteConfirm,
            openAlertEditForm,
            alertTitleEditConfirm,
        };
    },
};
</script>

<style lang="postcss" scoped>
.alert-detail-page {
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

    .left-wrapper {
        @apply grid col-span-8 gap-4;
        grid-auto-rows: max-content;
    }
    .right-wrapper {
        @apply grid col-span-4 gap-4;
        grid-auto-rows: max-content;
    }

    @screen tablet {
        margin-top: 0;
        .left-wrapper {
            @apply row-start-1 row-end-1 col-span-12;
            .header {
                @apply col-span-12 row-start-1 row-end-1;
                max-height: none;
            }
            .info {
                @apply col-span-12 row-start-2 row-end-2;
            }
            .status-update {
                @apply col-span-12 row-start-3 row-end-3;
                overflow-x: auto;
            }
            .timeline-and-event {
                @apply col-span-12 row-start-4 row-end-4;
                max-height: none;
            }
        }

        .right-wrapper {
            @apply row-start-2 row-end-2 col-span-12;
            .responder {
                @apply col-span-6 row-start-5 row-end-5;
            }
            .note {
                @apply col-span-6 row-start-5 row-end-5;
            }
            .project-dependency {
                @apply col-span-6 row-start-6 row-end-6;
            }
        }
    }

    @screen mobile {
        .right-wrapper {
            @apply col-span-12;
            margin-top: -4rem;
            .responder {
                @apply row-start-5 row-end-5;
            }
            .note {
                @apply row-start-6 row-end-6 col-start-1;
            }
            .project-dependency {
                @apply row-start-7 row-end-7 col-start-1;
            }
        }
    }
}
</style>
