<script lang="ts">
// eslint-disable-next-line import/order,import/no-duplicates
import { defineComponent, type ComponentPublicInstance } from 'vue';

interface IInstance extends ComponentPublicInstance {
    setPathFrom(from: any): void
}

export default defineComponent({
    beforeRouteEnter(to, from, next) {
        next((vm) => {
            const instance = vm as unknown as IInstance;
            instance.setPathFrom(from);
        });
    },
});
</script>

<script lang="ts" setup>
/* eslint-disable import/first */
// eslint-disable-next-line import/order
import { useTimeoutPoll, useDocumentVisibility } from '@vueuse/core';
import {
    defineProps, defineExpose, reactive, onMounted, onUnmounted, computed, watch,
// eslint-disable-next-line import/no-duplicates
} from 'vue';
import type { Location } from 'vue-router';
import { useRoute } from 'vue-router/composables';

import { useQueryClient, useMutation } from '@tanstack/vue-query';
import dayjs from 'dayjs';
import { clone } from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PHeading, PSkeleton, PButton, PIconButton, PDoubleCheckModal, PHeadingLayout,
} from '@cloudforet/mirinae';

import { useCollectorApi } from '@/api-clients/inventory/collector/composables/use-collector-api';
import type { CollectorDeleteParameters } from '@/api-clients/inventory/collector/schema/api-verbs/delete';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import { useAuthorizationStore } from '@/store/authorization/authorization-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useGoBack } from '@/common/composables/go-back';

import CollectorAdditionalRule from '@/services/asset-inventory/components/CollectorAdditionalRule.vue';
import CollectorBaseInfoSection from '@/services/asset-inventory/components/CollectorBaseInfoSection.vue';
import CollectorDataModal
    from '@/services/asset-inventory/components/CollectorDataModal.vue';
import CollectDataButtonGroup
    from '@/services/asset-inventory/components/CollectorDetailCollectDataButtonGroup.vue';
import CollectorNameEditModal
    from '@/services/asset-inventory/components/CollectorDetailNameEditModal.vue';
import CollectorOptionsSection
    from '@/services/asset-inventory/components/CollectorDetailOptionsSection.vue';
import CollectorScheduleSection from '@/services/asset-inventory/components/CollectorDetailScheduleSection.vue';
import { useCollectorGetQuery } from '@/services/asset-inventory/composables/use-collector-get-query';
import { useInventoryJobListQuery } from '@/services/asset-inventory/composables/use-inventory-job-list-query';
import { COLLECT_DATA_TYPE } from '@/services/asset-inventory/constants/collector-constant';
import { ADMIN_ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/admin/route-constant';
import {
    useCollectorDataModalStore,
} from '@/services/asset-inventory/stores/collector-data-modal-store';
import { useCollectorFormStore } from '@/services/asset-inventory/stores/collector-form-store';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';

const props = defineProps<{
    collectorId: string;
}>();

const { collectorAPI } = useCollectorApi();

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.state;
const collectorDataModalStore = useCollectorDataModalStore();
const authorizationStore = useAuthorizationStore();

const route = useRoute();

const queryHelper = new QueryHelper();

const state = reactive({
    selectedMenuId: computed(() => {
        const reversedMatched = clone(route.matched).reverse();
        const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
        const targetMenuId: MenuId = closestRoute?.meta?.menuId || MENU_ID.WORKSPACE_HOME;
        if (route.name === COST_EXPLORER_ROUTE.LANDING._NAME) {
            return '';
        }
        return targetMenuId;
    }),
    hasReadWriteAccess: computed<boolean|undefined>(() => authorizationStore.getters.pageAccessPermissionMap[state.selectedMenuId]?.write),
    collectorName: computed<string>(() => collectorData.value?.name ?? ''),
    collectorHistoryLink: computed<Location|undefined>(() => {
        if (!jobListCountData.value?.total_count) return undefined;
        return {
            name: ADMIN_ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY._NAME,
            query: {
                filters: queryHelper.setFilters([
                    {
                        k: 'collector_id',
                        v: props.collectorId,
                        o: '=',
                    },
                ]).rawQueryStrings,
            },
        };
    }),
    deleteModalVisible: false,
    deleteLoading: false,
    editModalVisible: false,
});

const { setPathFrom, handleClickBackButton } = useGoBack({ name: ADMIN_ASSET_INVENTORY_ROUTE.COLLECTOR._NAME });

defineExpose({ setPathFrom });

const goBackToMainPage = () => {
    SpaceRouter.router.push({
        name: ADMIN_ASSET_INVENTORY_ROUTE.COLLECTOR._NAME,
    });
};

/* Query */
const { data: collectorData, isLoading: isCollectorLoading } = useCollectorGetQuery({ collectorId: computed(() => props.collectorId) });
const jobListCountQueryHelper = new ApiQueryHelper().setCountOnly();
const { data: jobListCountData, isLoading: isJobListLoading } = useInventoryJobListQuery({
    params: computed(() => {
        jobListCountQueryHelper.setFilters([
            { k: 'collector_id', v: props.collectorId, o: '=' },
        ]);
        return {
            query: jobListCountQueryHelper.data,
        };
    }),
});
const fiveDaysAgo = dayjs.utc().subtract(5, 'day').startOf('day').toISOString();
const recentJobsQueryHelper = new ApiQueryHelper();
const { refetch: refetchRecentJobs } = useInventoryJobListQuery({
    params: computed(() => {
        recentJobsQueryHelper.setFilters([
            { k: 'collector_id', v: collectorFormState.collectorId ?? '', o: '=' },
            { k: 'created_at', v: fiveDaysAgo, o: '>' },
        ]);
        return {
            query: recentJobsQueryHelper.data,
        };
    }),
});

const queryClient = useQueryClient();
const { key: collectorListQueryKey } = useServiceQueryKey('inventory', 'collector', 'list');
const { mutate: deleteCollector } = useMutation({
    mutationFn: (params: CollectorDeleteParameters) => collectorAPI.delete(params),
    onMutate: () => { state.deleteLoading = true; },
    onSuccess: () => {
        showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.ALT_S_DELETE_COLLECTOR'), '');
        queryClient.invalidateQueries({ queryKey: collectorListQueryKey });
        goBackToMainPage();
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.COLLECTOR.ALT_E_DELETE_COLLECTOR'));
    },
    onSettled: () => {
        state.deleteModalVisible = false;
        state.deleteLoading = false;
    },
});

/* Event Handlers */
const handleClickEditButton = () => {
    state.editModalVisible = true;
};

const handleClickDeleteButton = () => {
    state.deleteModalVisible = true;
};
const handleDeleteModalConfirm = async () => {
    if (!props.collectorId) return;
    await deleteCollector({
        collector_id: props.collectorId,
    });
};
const handleUpdateEditModalVisible = (value: boolean) => {
    state.editModalVisible = value;
};
const handleCollectData = () => {
    collectorDataModalStore.setVisible(true);
    collectorDataModalStore.setSelectedCollectorId(props.collectorId);
    collectorDataModalStore.setCollectDataType(COLLECT_DATA_TYPE.ENTIRE);
    collectorDataModalStore.setSelectedSecret(undefined);
};
const handleClickCollectDataConfirm = () => {
    // pause and resume api polling to update recent job status after collect data immediately
    pause();
    resume();
};

/* Api polling */
const fetchRecentJob = async () => {
    await refetchRecentJobs();
};
const { pause, resume } = useTimeoutPoll(fetchRecentJob, 5000);
const documentVisibility = useDocumentVisibility();
watch(documentVisibility, (visibility) => {
    if (visibility === 'hidden') {
        pause();
    } else {
        resume();
    }
});
watch(() => collectorData.value, async (collector) => {
    if (collector) {
        await collectorFormStore.initForm(collector);
        resume();
    }
}, { immediate: true });

onMounted(async () => {
    collectorFormStore.setCollectorId(props.collectorId);
    collectorDataModalStore.reset();
});
onUnmounted(() => {
    pause();
    collectorFormStore.resetState();
    collectorDataModalStore.reset();
});
</script>
<template>
    <div class="collector-detail-page">
        <p-heading-layout>
            <template #heading>
                <p-heading class="mb-6"
                           :title="state.collectorName"
                           show-back-button
                           @click-back-button="handleClickBackButton"
                >
                    <p-skeleton v-if="isCollectorLoading"
                                width="20rem"
                                height="1.5rem"
                    />
                    <template v-if="state.hasReadWriteAccess && state.collectorName"
                              #title-right-extra
                    >
                        <span class="title-right-button-wrapper">
                            <p-icon-button name="ic_edit-text"
                                           width="1.5rem"
                                           height="1.5rem"
                                           @click="handleClickEditButton"
                            />
                            <p-icon-button name="ic_delete"
                                           width="1.5rem"
                                           height="1.5rem"
                                           class="delete-button"
                                           @click="handleClickDeleteButton"
                            />
                        </span>
                    </template>
                </p-heading>
            </template>
            <template #extra>
                <div v-if="!isJobListLoading"
                     class="collector-button-box"
                >
                    <collect-data-button-group v-if="state.hasReadWriteAccess"
                                               @collect="handleCollectData"
                    />
                    <router-link v-if="!!jobListCountData?.total_count"
                                 :to="state.collectorHistoryLink"
                    >
                        <p-button style-type="tertiary"
                                  icon-left="ic_history"
                        >
                            {{ $t('INVENTORY.COLLECTOR.DETAIL.COLLECTOR_HISTORY') }}
                        </p-button>
                    </router-link>
                </div>
            </template>
        </p-heading-layout>

        <collector-base-info-section class="section"
                                     :history-link="state.collectorHistoryLink"
                                     :has-read-write-access="state.hasReadWriteAccess"
        />
        <collector-schedule-section class="section"
                                    :has-read-write-access="state.hasReadWriteAccess"
        />
        <collector-options-section class="section"
                                   data-test-id="collector-options-section"
                                   :has-read-write-access="state.hasReadWriteAccess"
        />
        <collector-additional-rule class="section"
                                   :collector-id="props.collectorId"
        />
        <p-double-check-modal :visible.sync="state.deleteModalVisible"
                              :header-title="$t('INVENTORY.COLLECTOR.DETAIL.DELETE_COLLECTOR')"
                              :verification-text="state.collectorName"
                              modal-size="sm"
                              :loading="state.deleteLoading"
                              @confirm="handleDeleteModalConfirm"
        />
        <collector-name-edit-modal :visible="state.editModalVisible"
                                   @update:visible="handleUpdateEditModalVisible"
        />
        <collector-data-modal @click-confirm="handleClickCollectDataConfirm" />
    </div>
</template>
<style lang="postcss" scoped>
.section {
    margin-bottom: 1rem;
}
.title-right-button-wrapper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-left: 0.5rem;
}
.collector-button-box {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
}
</style>


