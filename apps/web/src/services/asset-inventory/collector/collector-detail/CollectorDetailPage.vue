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
                <router-link :to="state.collectorHistoryLink">
                    <p-button v-if="props.collectorId"
                              style-type="tertiary"
                    >
                        {{ $t('INVENTORY.COLLECTOR.DETAIL.COLLECTOR_HISTORY') }}
                    </p-button>
                </router-link>
            </template>
        </p-heading>

        <collector-base-info-section class="section"
                                     :loading="state.loading"
        />
        <collector-schedule-section class="section" />
        <collector-options-section class="section"
                                   :loading="state.loading"
                                   :collector-options="state.collectorOptions"
        />
        <collector-service-accounts-section class="section"
                                            :providers="state.collectorProviders"
        />
        <p-double-check-modal :visible.sync="state.deleteModalVisible"
                              :header-title="$t('INVENTORY.COLLECTOR.DETAIL.DELETE_COLLECTOR')"
                              :verification-text="state.collectorName"
                              modal-size="sm"
                              :loading="state.deleteLoading"
                              @confirm="handleDeleteModalConfirm"
        />
        <collector-name-edit-modal :visible.sync="state.editModalVisible" />
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
import { makeAPIError } from '@cloudforet/core-lib/space-connector/error';

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
import { useCollectorFormStore } from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';
import type { CollectorModel, CollectorPluginModel } from '@/services/asset-inventory/collector/type';
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
    collectorOptions: computed<null|CollectorPluginModel['options']>(() => state.collector?.plugin_info?.options ?? null),
    // TODO: must be updated after backend api spec is updated
    collectorProviders: computed<undefined|string[]>(() => (state.collector?.provider ? [state.collector.provider] : undefined)),
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

const getCollector = async (): Promise<CollectorModel> => {
    state.loading = true;
    // TODO: change to real data
    const result = await new Promise<CollectorModel>((resolve) => {
        setTimeout(() => {
            resolve({
                collector_id: 'collector-1',
                name: 'collector-1',
                state: 'ENABLED',
                provider: 'aws',
                capability: {
                    supported_providers: ['aws'],
                    supported_schemas: ['aws_access_key', 'aws_access_key_pair'],
                    monitoring_type: 'METRIC',
                    use_resource_secret: true,
                },
                schedule: {
                    hours: [3],
                },
                plugin_info: {
                    plugin_id: 'plugin-4507e45ad6dd',
                    version: '1.4.3',
                    upgrade_mode: 'AUTO',
                    metadata: {},
                    secret_filter: {},
                    options: {
                        supported_resource_type: ['inventory.Server'],
                        filter_format: [],
                    },
                },
                tags: {
                    'spaceone:region': 'kr',
                    'spaceone:zone': 'kr-1',
                },
                last_collected_at: '2021-08-31T00:00:00Z',
                created_at: '2021-08-31T00:00:00Z',
            });
        }, 2000);
    });
    state.loading = false;
    return result;
};

const fetchDeleteCollector = async () => {
    // TODO: change to call api
    await new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(makeAPIError('error'));
        }, 2000);
    });
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

onMounted(async () => {
    collectorFormStore.$reset();
    const collector = await getCollector();
    collectorFormStore.setOriginCollector(collector);
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

</style>


