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
            <template v-if="state.collectorName && collectorDetailPageStore.getters.isEditableCollector"
                      #title-right-extra
            >
                <span class="title-right-button-wrapper">
                    <p-icon-button name="ic_delete"
                                   width="1.5rem"
                                   height="1.5rem"
                                   class="delete-button"
                                   @click="handleClickDeleteButton"
                    />
                    <p-icon-button name="ic_edit-text"
                                   width="1.5rem"
                                   height="1.5rem"
                                   @click="handleClickEditButton"
                    />
                </span>
            </template>
            <template #extra>
                <div v-if="collectorJobStore.AllJobsInfoLoaded"
                     class="collector-button-box"
                >
                    <collect-data-button-group @collect="handleCollectData" />
                    <router-link v-if="collectorJobStore.hasJobs"
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
        </p-heading>

        <collector-base-info-section class="section"
                                     :history-link="state.collectorHistoryLink"
        />
        <collector-schedule-section class="section" />
        <collector-options-section class="section"
                                   data-test-id="collector-options-section"
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

import {
    PHeading, PSkeleton, PButton, PIconButton, PDoubleCheckModal,
} from '@spaceone/design-system';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import type { CollectorDeleteParameters } from '@/schema/inventory/collector/api-verbs/delete';
import type { CollectorGetParameters } from '@/schema/inventory/collector/api-verbs/get';
import type { CollectorModel } from '@/schema/inventory/collector/model';
import { i18n } from '@/translations';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useGoBack } from '@/common/composables/go-back';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

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
import { COLLECT_DATA_TYPE } from '@/services/asset-inventory/constants/collector-constant';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import {
    useCollectorDataModalStore,
} from '@/services/asset-inventory/stores/collector-data-modal-store';
import { useCollectorDetailPageStore } from '@/services/asset-inventory/stores/collector-detail-page-store';
import { useCollectorFormStore } from '@/services/asset-inventory/stores/collector-form-store';
import { useCollectorJobStore } from '@/services/asset-inventory/stores/collector-job-store';


const props = defineProps<{
    collectorId: string;
}>();

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.$state;

const collectorJobStore = useCollectorJobStore();
const collectorJobState = collectorJobStore.$state;

const collectorDataModalStore = useCollectorDataModalStore();

const collectorDetailPageStore = useCollectorDetailPageStore();

watch(() => collectorFormState.originCollector, async (collector) => {
    if (collector) {
        collectorJobStore.$patch({
            collector,
        });
    }
});

const { getProperRouteLocation } = useProperRouteLocation();

const queryHelper = new QueryHelper();
const state = reactive({
    isNotiVisible: computed(() => !collectorDetailPageStore.getters.isEditableCollector),
    loading: true,
    collector: computed<CollectorModel|null>(() => collectorFormState.originCollector),
    collectorName: computed<string>(() => state.collector?.name ?? ''),
    collectorHistoryLink: computed<Location>(() => ({
        name: makeAdminRouteName(ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY._NAME),
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

const { setPathFrom, handleClickBackButton } = useGoBack({ name: makeAdminRouteName(ASSET_INVENTORY_ROUTE.COLLECTOR._NAME) });

defineExpose({ setPathFrom });

const getCollector = async (): Promise<CollectorModel|null> => {
    state.loading = true;
    try {
        return await SpaceConnector.clientV2.inventory.collector.get<CollectorGetParameters, CollectorModel>({
            collector_id: props.collectorId,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        return null;
    } finally {
        state.loading = false;
    }
};

const fetchDeleteCollector = async () => (collectorFormStore.collectorId ? SpaceConnector.clientV2.inventory.collector.delete<CollectorDeleteParameters>({
    collector_id: collectorFormStore.collectorId,
}) : undefined);

const goBackToMainPage = () => {
    SpaceRouter.router.push(getProperRouteLocation({
        name: ASSET_INVENTORY_ROUTE.COLLECTOR._NAME,
    }));
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
const handleCollectData = () => {
    collectorDataModalStore.$patch((_state) => {
        _state.visible = true;
        _state.collectDataType = COLLECT_DATA_TYPE.ENTIRE;
        _state.selectedCollector = collectorFormState.originCollector;
        _state.selectedSecret = undefined;
    });
};
const handleClickCollectDataConfirm = () => {
    // pause and resume api polling to update recent job status after collect data immediately
    pause();
    resume();
};

/* Api polling */
const fetchRecentJob = async () => {
    if (!collectorJobState.collector) return;
    await collectorJobStore.getRecentJobs();
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


onMounted(async () => {
    collectorJobStore.$reset();
    collectorFormStore.$reset();
    collectorDataModalStore.$reset();
    collectorDetailPageStore.reset();
    const collector = await getCollector();
    collectorJobStore.$patch((_state) => {
        _state.collector = collector;
    });
    if (collector) {
        collectorJobStore.getAllJobsCount();
        await collectorFormStore.setOriginCollector(collector);
        collectorDetailPageStore.state.collector = collector;
        resume();
    }
});
onUnmounted(() => {
    pause();
    collectorJobStore.$reset();
    collectorFormStore.$reset();
    collectorDataModalStore.$reset();
    collectorDetailPageStore.reset();
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
    gap: 1rem;
    flex-wrap: wrap;
}
</style>


