<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PFieldGroup, PLink, PLazyImg,
} from '@cloudforet/mirinae';
import type { MenuAttachHandler } from '@cloudforet/mirinae/types/hooks/use-context-menu-attach/use-context-menu-attach';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { CloudServiceListParameters } from '@/schema/inventory/cloud-service/api-verbs/list';
import type { CloudServiceModel } from '@/schema/inventory/cloud-service/model';
import type { OtherTaskField } from '@/schema/opsflow/_types/task-field-type';
import { i18n } from '@/translations';

import type {
    CloudServiceTypeItem,
    CloudServiceTypeReferenceMap,
} from '@/store/reference/cloud-service-type-reference-store';
import {
    useCloudServiceTypeReferenceStore,
} from '@/store/reference/cloud-service-type-reference-store';

import DataSelector from '@/common/components/select/DataSelector.vue';
import type { DataSelectorItem } from '@/common/components/select/type';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useTaskFieldValidation } from '@/services/ops-flow/task-fields-form/composables/use-task-field-validation';
import type {
    TaskFieldFormEmits,
    TaskFieldFormProps,
} from '@/services/ops-flow/task-fields-form/types/task-field-form-type';

const props = defineProps<TaskFieldFormProps<OtherTaskField, string[]>>();
const emit = defineEmits<TaskFieldFormEmits<string[]>>();

const {
    updateFieldValue,
    isInvalid, invalidText,
} = useTaskFieldValidation(props, emit);

const cloudServiceTypeReferenceStore = useCloudServiceTypeReferenceStore();
const cloudServiceTypeReferenceMap = computed<CloudServiceTypeReferenceMap>(() => cloudServiceTypeReferenceStore.getters.cloudServiceTypeItems);
const cloudServiceTypeItems = computed<CloudServiceTypeItem[]>(() => Object.values(cloudServiceTypeReferenceMap.value));

const cloudServiceFetcher = getCancellableFetcher<CloudServiceListParameters, ListResponse<CloudServiceModel>>(SpaceConnector.clientV2.inventory.cloudService.list);
const queryHelper = new ApiQueryHelper().setOnly('cloud_service_id', 'cloud_service_type', 'cloud_service_group', 'provider', 'name');
const getQuery = (cloudServiceType: string, inputText: string, pageStart = 1, pageLimit = 10) => {
    queryHelper.setFilters([
        { k: 'cloud_service_type', v: cloudServiceType, o: '=' },
    ])
        .setPage(pageStart, pageLimit);
    if (inputText) {
        queryHelper.addFilter({ k: 'name', v: inputText, o: '' });
    }
    if (props.value?.[0]) {
        queryHelper.addFilter({ k: 'cloud_service_id', v: props.value[0], o: '=' });
    }
    return queryHelper.data;
};
let handlerResults: CloudServiceModel[] = [];
let totalCount = 0;
interface CloudDataSelectorItem extends DataSelectorItem {
    data: CloudServiceModel|CloudServiceTypeItem;
    imageUrl?: string;
}
const cloudServiceHandler: MenuAttachHandler<CloudDataSelectorItem> = async (inputText: string, pageStart?: number, pageLimit?: number) => {
    try {
        const cloudServiceType = selectedStates.value[0]?.[0]?.data?.name;
        if (cloudServiceType) {
            const res = await cloudServiceFetcher({
                query: getQuery(cloudServiceType, inputText, pageStart, pageLimit),
            });
            if (res.status === 'succeed') {
                handlerResults = res.response.results ?? [];
                totalCount = res.response.total_count ?? 0;
            }
        }
    } catch (e) {
        ErrorHandler.handleError(e);
    }
    return {
        results: handlerResults.map((item) => ({
            name: item.cloud_service_id,
            label: `${item.name} (${item.cloud_service_id})`,
            data: item,
        })),
        more: pageStart * pageLimit < totalCount,
    };
};

type Step = {
    name: string;
} & ({ menu?: CloudDataSelectorItem[]; } | { handler?: MenuAttachHandler<CloudDataSelectorItem>; });
const steps = computed<Step[]>(() => [
    {
        name: i18n.t('OPSFLOW.FIELD_GENERATOR.GROUP_TYPE') as string,
        menu: cloudServiceTypeItems.value.map((item) => ({
            name: item.key,
            label: item.label,
            imageUrl: item.icon,
            data: item,
        })),
    },
    {
        name: i18n.t('OPSFLOW.NAME') as string,
        handler: cloudServiceHandler,
    },
]);
const selectedStates = ref<CloudDataSelectorItem[][]>([]);

const getStepKey = (idx: number): string => {
    if (idx === 0) return '--';
    if (!selectedStates.value[idx - 1]) return `${idx}-none`;
    return selectedStates.value[idx - 1].map((d) => d.name).join(', ');
};
const handleUpdateSearchKey = (stepIdx: number) => {
    selectedStates.value = selectedStates.value.map((d, idx) => {
        if (idx > stepIdx) return [];
        return d;
    });
};
const handleUpdateSelected = (stepIdx: number, selected: DataSelectorItem[]) => {
    selectedStates.value.splice(stepIdx, 1, selected);

    if (stepIdx === steps.value.length - 1) {
        updateFieldValue(selected.map((item) => item.name));
    }
};

const { getProperRouteLocation } = useProperRouteLocation();
type RelatedAsset= Partial<Pick<CloudServiceModel, 'cloud_service_group'|'cloud_service_type'|'provider'|'name'>> & Pick<CloudServiceModel, 'cloud_service_id'>;
const getIcon = (asset: RelatedAsset): string|undefined => {
    const key = `${asset.provider}.${asset.cloud_service_group}.${asset.cloud_service_type}`;
    return cloudServiceTypeItems.value.find((item) => item.data.cloud_service_type_key === key)?.icon;
};
const relatedAssets = ref<RelatedAsset[]>([]);
const loading = ref(false);
const error = ref<unknown|null>(null);
onMounted(async () => {
    if (props.readonly && props.value) {
        try {
            loading.value = true;
            const res = await SpaceConnector.clientV2.inventory.cloudService.list<CloudServiceListParameters, ListResponse<CloudServiceModel>>({
                query: {
                    only: ['cloud_service_id', 'cloud_service_type', 'cloud_service_group', 'provider', 'name'],
                    filter: [{
                        k: 'cloud_service_id', v: props.value, o: 'in',
                    }],
                },
            });
            relatedAssets.value = res.results ?? [];
        } catch (e) {
            ErrorHandler.handleError(e);
            error.value = e;
            relatedAssets.value = props.value.map((cloudServiceId) => ({ cloud_service_id: cloudServiceId }));
        } finally {
            loading.value = false;
        }
    }
});
</script>

<template>
    <p-field-group :label="field.name"
                   :required="props.readonly ||field.is_required"
                   :invalid="isInvalid"
                   :invalid-text="invalidText"
                   no-spacing
    >
        <div v-if="!props.readonly">
            <div class="mt-1 flex overflow-x-auto border border-gray-200 rounded-lg"
                 :class="{'border-red-500': isInvalid}"
            >
                <div v-for="(step, idx) in steps"
                     :key="idx"
                     class="flex-1 data-select-col"
                >
                    <data-selector :key="getStepKey(idx)"
                                   :label="step.name"
                                   :menu="step.menu"
                                   :handler="step.handler"
                                   :multi-selectable="idx === steps.length - 1"
                                   :show-select-marker="idx === steps.length - 1"
                                   @update:search-text="handleUpdateSearchKey(idx, $event)"
                                   @update:selected="handleUpdateSelected(idx, $event)"
                    />
                </div>
            </div>
            <div v-if="!!selectedStates[steps.length - 1]?.length"
                 class="p-2 flex flex-wrap gap-2 text-label-md"
            >
                <p-link v-for="(asset) in selectedStates[steps.length - 1]"
                        :key="asset.name"
                        new-tab
                        action-icon="internal-link"
                        :to="getProperRouteLocation({
                            name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                            params: {
                                provider: asset.data.provider,
                                group: asset.data.cloud_service_group,
                                name: asset.data.cloud_service_type,
                            },
                            query: {
                                cloudServiceId: asset.name,
                            },
                        })"
                >
                    {{ asset.label }}
                </p-link>
            </div>
        </div>
        <div v-else
             class="pt-1"
        >
            <div v-for="asset in relatedAssets"
                 :key="asset.cloud_service_id"
                 class="flex items-center gap-1"
            >
                <p-lazy-img :src="getIcon(asset)"
                            :loading="loading"
                            width="1.25rem"
                            height="1.25rem"
                />
                <p-link v-if="!error"
                        new-tab
                        highlight
                        action-icon="internal-link"
                        :to="getProperRouteLocation({
                            name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                            params: {
                                provider: asset.provider,
                                group: asset.cloud_service_group,
                                name: asset.cloud_service_type,
                            },
                            query: {
                                cloudServiceId: asset.cloud_service_id,
                            },
                        })"
                >
                    <span class="pl-1 text-label-md">{{ asset.cloud_service_group }} > {{ asset.cloud_service_type }} > {{ asset.name }}</span>
                </p-link>
                <span v-else
                      class="pl-1 text-label-md"
                >{{ asset.cloud_service_id }}</span>
            </div>
        </div>
    </p-field-group>
</template>

<style lang="scss" scoped>
.data-select-col {
    @apply border-r border-gray-200;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 16rem;
    padding: 0.75rem 0;
    &:last-child {
        @apply border-r-0;
    }
}
</style>
