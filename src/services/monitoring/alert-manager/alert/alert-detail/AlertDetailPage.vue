<template>
    <general-page-layout v-if="!loading" class="alert-detail-page">
        <p-breadcrumbs :routes="routeState.route" />
        <p-page-title :title="alertInfo.title" child class="page-title"
                      @goBack="$router.go(-1)"
        >
            <template #extra>
                <span class="title-btn">
                    <p-icon-button name="ic_trashcan"
                                   class="w-full delete-btn"
                                   @click="openAlertDeleteForm"
                    />
                    <p-icon-button name="ic_edit-text"
                                   class="edit-btn"
                                   @click="openAlertEditForm"
                    />
                </span>
            </template>
        </p-page-title>
        <section class="detail-contents-wrapper">
            <div class="left-wrapper">
                <alert-summary :id="id" class="header"
                                     :alert-data="alertInfo"
                />

                <alert-key-info :id="id" class="info"
                                   :alert-data="alertInfo"
                />
                <alert-status-update :id="id"
                                                 :alert-data="alertInfo"
                                                 class="status-update"
                />
                <alert-timeline-and-event :id="id" :alert-data="alertInfo"
                                                 class="timeline-and-event"
                />
            </div>
            <div class="right-wrapper">
                <alert-responder :id="id" class="responder"
                                        :alert-data="alertInfo"
                />
                <alert-note :id="id" class="note" />
                <alert-project-dependency :id="id" :alert-data="alertInfo"
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
    </general-page-layout>
</template>

<script lang="ts">
import { PBreadcrumbs, PIconButton, PPageTitle } from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, onMounted, onUnmounted, reactive, toRefs,
} from '@vue/composition-api';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import AlertSummary from '@/services/monitoring/alert-manager/alert/alert-detail/modules/alert-summary/AlertSummary.vue';
import AlertKeyInfo from '@/services/monitoring/alert-manager/alert/alert-detail/modules/alert-key-info/AlertKeyInfo.vue';
import AlertResponder from '@/services/monitoring/alert-manager/alert/alert-detail/modules/alert-responder/AlertResponder.vue';
import AlertTimelineAndEvent from '@/services/monitoring/alert-manager/alert/alert-detail/modules/AlertTimelineAndEvent.vue';
import AlertNote from '@/services/monitoring/alert-manager/alert/alert-detail/modules/AlertNote.vue';
import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { AlertDataModel } from '@/services/monitoring/alert-manager/type';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import AlertTitleEditModal from '@/services/monitoring/alert-manager/alert/alert-detail/modules/AlertTitleEditModal.vue';
import AlertProjectDependency
    from '@/services/monitoring/alert-manager/alert/alert-detail/modules/AlertProjectDependency.vue';
import { i18n } from '@/translations';
import AlertStatusUpdate
    from '@/services/monitoring/alert-manager/alert/alert-detail/modules/AlertStatusUpdate.vue';
import { MONITORING_ROUTE } from '@/services/monitoring/routes';
import { store } from '@/store';
import alertStoreModule from '@/services/monitoring/alert-manager/store';
import { AlertStoreState } from '@/services/monitoring/alert-manager/store/type';
import { registerServiceStore } from '@/common/composables/register-service-store';

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
        GeneralPageLayout,
        DeleteModal,
        PBreadcrumbs,
        PPageTitle,
        PIconButton,
    },
    props: {
        id: {
            type: String,
            default: null,
        },
    },
    setup(props, { root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        registerServiceStore<AlertStoreState>('alert', alertStoreModule);

        const state = reactive({
            alertInfo: computed(() => store.state.service.alert.alertData),
            loading: true,
            //
            alertTitleEditFormVisible: false,
        });

        const routeState = reactive({
            route: computed(() => [
                { name: i18n.t('MENU.MONITORING.MONITORING'), path: '/monitoring' },
                { name: i18n.t('MENU.MONITORING.ALERT_MANAGER'), path: '/monitoring/alert-manager/dashboard' },
                { name: `${props.id} #${state.alertInfo?.alert_number}` },
            ]),
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
                showSuccessMessage(i18n.t('MONITORING.ALERT.DETAIL.ALT_S_DELETE_ALERT'), '', root);
                await vm.$router.push({ name: MONITORING_ROUTE.ALERT_MANAGER.ALERT._NAME });
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('MONITORING.ALERT.DETAIL.ALT_E_DELETE_ALERT'), '', root);
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

        (async () => {
            state.loading = true;
            try {
                await Promise.allSettled([
                    store.dispatch('resource/webhook/load'),
                    store.dispatch('resource/user/load'),
                    store.dispatch('service/alert/getAlertData', props.id),
                ]);
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        })();

        return {
            ...toRefs(state),
            routeState,
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
.p-page-title::v-deep {
    h2 {
        flex-wrap: wrap;
        max-width: 100%;
        padding-right: 0.5rem;
    }
    .extra {
        justify-content: flex-start;
    }
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
