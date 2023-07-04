<template>
    <div class="collector-detail-page">
        <p-heading :title="state.collectorName"
                   show-back-button
                   @click-back-button="handleClickBackButton"
        >
            <p-skeleton v-if="state.loading"
                        width="20rem"
                        height="1.5rem"
            />
            <template v-if="state.collectorName"
                      #title-right-extra
            >
                <span class="title-right-button-wrapper">
                    <p-icon-button name="ic_delete"
                                   width="1.5rem"
                                   height="1.5rem"
                                   :disabled="!state.hasManagePermission"
                                   class="delete-button"
                                   @click="handleClickDeleteButton"
                    />
                    <p-icon-button name="ic_edit-text"
                                   width="1.5rem"
                                   height="1.5rem"
                                   :disabled="!state.hasManagePermission"
                                   @click="handleClickEditButton"
                    />
                </span>
            </template>
            <template #extra>
                <div class="collector-button-box">
                    <router-link v-if="state.hasJobs"
                                 :to="state.collectorHistoryLink"
                    >
                        <p-button v-if="props.collectorId"
                                  style-type="tertiary"
                        >
                            {{ $t('INVENTORY.COLLECTOR.DETAIL.COLLECTOR_HISTORY') }}
                        </p-button>
                    </router-link>
                </div>
            </template>
        </p-heading>

        <collector-base-info-section class="section" />
        <collector-schedule-section class="section" />
        <collector-options-section class="section" />
        <collector-service-accounts-section class="section"
                                            :manage-disabled="!state.hasManagePermission"
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
    </div>
</template>

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
import {
    defineProps, defineExpose, reactive, onMounted, computed,
// eslint-disable-next-line import/no-duplicates
} from 'vue';
import type { Location } from 'vue-router';

import {
    PHeading, PSkeleton, PButton, PIconButton, PDoubleCheckModal,
} from '@spaceone/design-system';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useGoBack } from '@/common/composables/go-back';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import CollectorBaseInfoSection from '@/services/asset-inventory/collector/collector-detail/modules/CollectorBaseInfoSection.vue';
import CollectorNameEditModal
    from '@/services/asset-inventory/collector/collector-detail/modules/CollectorNameEditModal.vue';
import CollectorOptionsSection
    from '@/services/asset-inventory/collector/collector-detail/modules/CollectorOptionsSection.vue';
import CollectorScheduleSection from '@/services/asset-inventory/collector/collector-detail/modules/CollectorScheduleSection.vue';
import CollectorServiceAccountsSection
    from '@/services/asset-inventory/collector/collector-detail/modules/CollectorServiceAccountsSection.vue';
import type { CollectorModel } from '@/services/asset-inventory/collector/model';
import { useCollectorFormStore } from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';

const props = defineProps<{
    collectorId: string;
}>();

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.$state;

const queryHelper = new QueryHelper();
const state = reactive({
    hasManagePermission: useManagePermissionState(),
    loading: true,
    collector: computed<CollectorModel|null>(() => collectorFormState.originCollector),
    collectorName: computed<string>(() => state.collector?.name ?? ''),
    hasJobs: false,
    collectorHistoryLink: computed<Location>(() => ({
        name: ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY._NAME,
        query: {
            filters: queryHelper.setFilters([
                {
                    k: 'collector_id',
                    v: props.collectorId,
                    o: '=',
                },
            ]).rawQueryStrings,
        },
    })),
    deleteModalVisible: false,
    deleteLoading: false,
    editModalVisible: false,
});

const { setPathFrom, handleClickBackButton } = useGoBack({ name: ASSET_INVENTORY_ROUTE.COLLECTOR._NAME });

defineExpose({ setPathFrom });

const getCollector = async (): Promise<CollectorModel|null> => {
    state.loading = true;
    try {
        const result = await SpaceConnector.client.inventory.collector.get({
            collector_id: props.collectorId,
        });
        return result;
    } catch (e) {
        ErrorHandler.handleError(e);
        return null;
    } finally {
        state.loading = false;
    }
};

const fetchDeleteCollector = async () => SpaceConnector.client.inventory.collector.delete({
    collectors: [collectorFormStore.collectorId],
});
const jobCountApiHelper = new ApiQueryHelper().setCountOnly();
const fetchJobCount = async (collectorId: string): Promise<number> => {
    jobCountApiHelper.setFilters([
        {
            k: 'collector_id',
            v: collectorId,
            o: '=',
        },
    ]);
    const result = await SpaceConnector.client.inventory.job.list({
        query: jobCountApiHelper.data,
    });
    return result.total_count;
};

const goBackToMainPage = () => {
    SpaceRouter.router.push({
        name: ASSET_INVENTORY_ROUTE.COLLECTOR._NAME,
    });
};

const handleClickEditButton = () => {
    state.editModalVisible = true;
};

const handleClickDeleteButton = () => {
    state.deleteModalVisible = true;
};

const handleDeleteModalConfirm = async () => {
    state.deleteModalVisible = true;
    try {
        state.deleteLoading = true;
        await fetchDeleteCollector();
        state.deleteModalVisible = false;
        showSuccessMessage(i18n.t('INVENTORY.COLLECTOR.ALT_S_DELETE_COLLECTOR'), '');
        goBackToMainPage();
        collectorFormStore.$reset();
    } catch (error) {
        state.deleteModalVisible = false;
        ErrorHandler.handleRequestError(error, i18n.t('INVENTORY.COLLECTOR.ALT_E_DELETE_COLLECTOR'));
    } finally {
        state.deleteLoading = false;
    }
};
const handleUpdateEditModalVisible = (value: boolean) => {
    state.editModalVisible = value;
};
onMounted(async () => {
    collectorFormStore.$reset();
    const collector = await getCollector();
    if (collector) {
        collectorFormStore.setOriginCollector(collector);
        const jobCount = await fetchJobCount(collector.collector_id);
        state.hasJobs = jobCount > 0;
    }
});

</script>

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
}
</style>


