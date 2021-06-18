<template>
    <general-page-layout class="alert-detail-page">
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
            <alert-detail-header v-if="!loading" :id="id" class="header"
                                 :alert-data="alertInfo"
                                 @confirm="getAlertData"
            />
            <alert-detail-responder v-if="!loading" :id="id" class="responder"
                                    :alert-data="alertInfo"
            />
            <alert-detail-info v-if="!loading" :id="id" class="info"
                               :alert-data="alertInfo"
                               @update="getAlertData"
            />
            <alert-detail-resource-info v-if="!loading && alertInfo.resource" :id="id" :alert-data="alertInfo"
                                        class="resource-info"
            />
            <alert-detail-project-dependency v-if="!loading" :id="id" :alert-data="alertInfo"
                                             class="project-dependency"
            />
            <alert-detail-note v-if="!loading" :id="id" class="note" />
            <alert-detail-timeline v-if="!loading" :id="id" class="timeline" />
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
    </general-page-layout>
</template>

<script lang="ts">
import { PBreadcrumbs, PIconButton, PPageTitle } from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import GeneralPageLayout from '@/common/components/layouts/GeneralPageLayout.vue';
import AlertDetailHeader from '@/views/monitoring/alert/modules/alert-detail/AlertDetailHeader.vue';
import AlertDetailInfo from '@/views/monitoring/alert/modules/alert-detail/AlertDetailInfo.vue';
import AlertDetailResponder from '@/views/monitoring/alert/modules/alert-detail/AlertDetailResponder.vue';
import AlertDetailTimeline from '@/views/monitoring/alert/modules/alert-detail/AlertDetailTimeline.vue';
import AlertDetailNote from '@/views/monitoring/alert/modules/alert-detail/AlertDetailNote.vue';
import DeleteModal from '@/common/modules/delete-modal/DeleteModal.vue';
import { SpaceConnector } from '@/lib/space-connector';
import { AlertDataModel } from '@/views/monitoring/alert/type';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import AlertTitleEditModal from '@/views/monitoring/alert/modules/alert-detail/AlertTitleEditModal.vue';
import AlertDetailResourceInfo from '@/views/monitoring/alert/modules/alert-detail/AlertDetailResourceInfo.vue';
import AlertDetailProjectDependency
    from '@/views/monitoring/alert/modules/alert-detail/AlertDetailProjectDependency.vue';
import {i18n} from "@/translations";

export default {
    name: 'AlertDetailPage',
    components: {
        AlertDetailProjectDependency,
        AlertDetailResourceInfo,
        AlertTitleEditModal,
        AlertDetailNote,
        AlertDetailTimeline,
        AlertDetailResponder,
        AlertDetailInfo,
        AlertDetailHeader,
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
        const state = reactive({
            alertInfo: {} as AlertDataModel,
            loading: true,
            //
            alertTitleEditFormVisible: false,
        });

        const routeState = reactive({
            route: computed(() => [
                { name: i18n.t('MENU.MONITORING.MONITORING'), path: '/monitoring' },
                { name: i18n.t('MENU.MONITORING.ALERT_SYSTEM'), path: '/monitoring/alert-system/dashboard' },
                { name: props.id },
            ]),
        });

        const checkDeleteState = reactive({
            visible: false,
            headerTitle: i18n.t('MONITORING.ALERT.DETAIL.DELETE_MODAL_TITLE'),
        });

        const getAlertData = async () => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.monitoring.alert.get({
                    // eslint-disable-next-line camelcase
                    alert_id: props.id,
                });
                state.alertInfo = res;
                state.loading = false;
            } catch (e) {
                console.error(e);
            }
        };

        const openAlertDeleteForm = () => {
            checkDeleteState.visible = true;
        };

        const alertDeleteConfirm = async () => {
            try {
                await SpaceConnector.client.monitoring.alert.delete({
                    alert_id: props.id,
                });
                showSuccessMessage(i18n.t('MONITORING.ALERT.DETAIL.ALT_S_DELETE_ALERT'), '', root);
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
            await getAlertData();
        };

        (async () => {
            await getAlertData();
        })();

        return {
            ...toRefs(state),
            routeState,
            checkDeleteState,
            openAlertDeleteForm,
            alertDeleteConfirm,
            openAlertEditForm,
            alertTitleEditConfirm,
            getAlertData,
        };
    },
};
</script>

<style lang="postcss" scoped>
.alert-detail-page {
    @apply bg-gray-100;
}
.p-page-title::v-deep {
    .extra {
        justify-content: flex-start;
    }
}
.detail-contents-wrapper {
    @apply grid grid-cols-12 gap-4 w-full;
    grid-auto-flow: row;
    grid-auto-rows: max-content;

    .header {
        @apply col-span-8 row-start-1 row-end-1;
        max-height: 6.125rem;
    }
    .responder {
        @apply col-span-4 row-start-1 row-end-3;
    }
    .info {
        @apply col-span-8 row-start-2 row-end-2;
    }
    .resource-info {
        @apply col-span-8 row-start-3 row-end-3;
    }
    .project-dependency {
        @apply col-span-4 row-start-3 row-end-3;
        min-height: 10rem;
    }
    .note {
        @apply col-span-4 row-start-4 row-end-4;
    }
    .timeline {
        @apply col-span-8 col-start-1 row-start-4 row-end-4;
        max-height: 32.125rem;
    }

    @screen tablet {
        .header {
            @apply col-span-12 row-start-1 row-end-1;
            max-height: none;
        }
        .info {
            @apply col-span-12 row-start-2 row-end-2;
        }
        .resource-info {
            @apply col-span-12 row-start-3 row-end-3;
        }
        .timeline {
            @apply col-span-12 row-start-4 row-end-4;
            max-height: none;
        }
        .responder {
            @apply col-span-6 row-start-5 row-end-5;
        }
        .note {
            @apply col-span-6 row-start-5 row-end-5;
        }
        .project-dependency {
            @apply col-span-6 row-start-6 row-end-6;
            min-height: 10rem;
        }

    }

    @screen mobile {
        .responder {
            @apply col-span-12 row-start-5 row-end-5;
        }
        .project-dependency {
            @apply col-span-12 row-start-6 row-end-6 col-start-1;
            min-height: 10rem;
        }
        .note {
            @apply col-span-12 row-start-7 row-end-7 col-start-1;
        }
    }

}
</style>
