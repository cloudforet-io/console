<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PFieldGroup, PLink, PLazyImg,
} from '@cloudforet/mirinae';
import type { MenuAttachHandler } from '@cloudforet/mirinae/types/hooks/use-context-menu-attach/use-context-menu-attach';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { OtherTaskField } from '@/api-clients/opsflow/_types/task-field-type';
import type { CloudServiceListParameters } from '@/schema/inventory/cloud-service/api-verbs/list';
import type { CloudServiceModel } from '@/schema/inventory/cloud-service/model';
import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import type {
    CloudServiceTypeItem,
    CloudServiceTypeReferenceMap,
} from '@/store/reference/cloud-service-type-reference-store';
import {
    useCloudServiceTypeReferenceStore,
} from '@/store/reference/cloud-service-type-reference-store';

import { VariableModelFactory } from '@/lib/variable-models';
import { getVariableModelMenuHandler } from '@/lib/variable-models/variable-model-menu-handler';

import DataSelector from '@/common/components/select/DataSelector.vue';
import type { DataSelectorItem } from '@/common/components/select/type';
import ErrorHandler from '@/common/composables/error/errorHandler';

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
const userWorkspaceStore = useUserWorkspaceStore();

const cloudServiceTypeReferenceMap = computed<CloudServiceTypeReferenceMap>(() => cloudServiceTypeReferenceStore.getters.cloudServiceTypeItems);
const cloudServiceTypeItems = computed<CloudServiceTypeItem[]>(() => Object.values(cloudServiceTypeReferenceMap.value));

interface CloudDataSelectorItem extends DataSelectorItem {
    data: CloudServiceModel|CloudServiceTypeItem;
    imageUrl?: string;
}

const cloudServiceOptions = computed<Record<string, any>>(() => {
    if (!relatedAssetInfo.value) return {};
    return {
        provider: relatedAssetInfo.value.provider,
        cloud_service_group: relatedAssetInfo.value.group,
        cloud_service_type: relatedAssetInfo.value.type,
    };
});
const cloudServiceVariableModel = new VariableModelFactory({ type: 'MANAGED', managedModelKey: 'cloud_service' });
const cloudServiceHandler = getVariableModelMenuHandler<CloudServiceModel>(
    [{ variableModel: cloudServiceVariableModel }],
    cloudServiceOptions,
);


type Step = {
    name: string;
} & ({ menu?: CloudDataSelectorItem[]; } | { handler?: MenuAttachHandler<CloudDataSelectorItem>; });
const step1Menu = computed<CloudDataSelectorItem[]>(() => cloudServiceTypeItems.value.map((item) => ({
    name: item.key,
    label: item.label,
    imageUrl: item.icon,
    data: item,
})));
const emptyMenu = [];
const steps = computed<Step[]>(() => [
    {
        name: i18n.t('OPSFLOW.FIELD_GENERATOR.GROUP_TYPE') as string,
        menu: step1Menu.value,
    },
    {
        name: i18n.t('OPSFLOW.NAME') as string,
        menu: emptyMenu,
        handler: relatedAssetInfo.value ? cloudServiceHandler : undefined,
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
const handleUpdateSelected = (stepIdx: number, selected: CloudDataSelectorItem[]) => {
    selectedStates.value.splice(stepIdx, 1, selected);

    if (stepIdx === steps.value.length - 1) {
        updateFieldValue(selected.map((item) => item.name));
        relatedAssets.value = selected.map((item) => item.data as CloudServiceModel);
    }
};


interface RelatedAssetInfo {
    provider: string; group: string; type: string; icon?: string;
}
type RelatedAsset = Partial<Pick<CloudServiceModel, 'cloud_service_group'|'cloud_service_type'|'provider'|'name'|'reference'>> & Pick<CloudServiceModel, 'cloud_service_id'>;
const getIcon = (asset: RelatedAssetInfo): string|undefined => {
    const key = `${asset.provider}.${asset.group}.${asset.type}`;
    return cloudServiceTypeItems.value.find((item) => item.data.cloud_service_type_key === key)?.icon;
};
const relatedAssetInfo = computed<RelatedAssetInfo|undefined>(() => {
    if (props.readonly) {
        const asset = relatedAssets.value[0] as CloudServiceModel|undefined;
        if (!asset) return undefined;
        return {
            provider: asset.provider,
            group: asset.cloud_service_group,
            type: asset.cloud_service_type,
        };
    }
    const selected = selectedStates.value[0];
    if (!selected?.[0]) return undefined;
    const item = selected[0].data as CloudServiceTypeItem;
    const [provider, group, type] = item.data.cloud_service_type_key.split('.');
    return {
        provider,
        group,
        type,
        icon: item.icon,
    };
});
const relatedAssets = ref<RelatedAsset[]>([]);
const loading = ref(false);
const error = ref<unknown|null>(null);
onMounted(async () => {
    if (props.readonly && props.value) {
        try {
            loading.value = true;
            const res = await SpaceConnector.clientV2.inventory.cloudService.list<CloudServiceListParameters, ListResponse<CloudServiceModel>>({
                query: {
                    only: ['cloud_service_id', 'cloud_service_type', 'cloud_service_group', 'provider', 'name', 'reference.resource_id'],
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
        </div>
        <div v-if="relatedAssetInfo"
             class="pt-1"
        >
            <div class="flex items-center gap-1">
                <p-lazy-img :src="getIcon(relatedAssetInfo)"
                            :loading="loading"
                            width="1.25rem"
                            height="1.25rem"
                />
                <span class="pl-1 text-label-md">{{ relatedAssetInfo.group }} > {{ relatedAssetInfo.type }}</span>
            </div>
            <div class="mt-1 flex flex-wrap gap-1">
                <div v-for="asset in relatedAssets"
                     :key="asset.cloud_service_id"
                >
                    <p-link v-if="!error"
                            new-tab
                            highlight
                            action-icon="internal-link"
                            :to="{
                                name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                                params: {
                                    workspaceId: userWorkspaceStore.getters.currentWorkspaceId,
                                    provider: asset.provider,
                                    group: asset.cloud_service_group,
                                    name: asset.cloud_service_type,
                                },
                                query: {
                                    filters: [JSON.stringify([asset.cloud_service_id, 'cloud_service_id'])],
                                },
                            }"
                    >
                        <span class="pl-1 text-label-md">{{ asset.name }} ({{ asset.reference.resource_id }})</span>
                    </p-link>
                    <span v-else
                          class="pl-1 text-label-md"
                    >{{ asset.cloud_service_id }}</span>
                </div>
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
