<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import { PBadge, PSelectStatus } from '@cloudforet/mirinae';


import { useAllReferenceDataModel } from '@/query/resource-query/reference-data-model';
import { i18n } from '@/translations';

import TagsPanel from '@/common/modules/tags/tags-panel/TagsPanel.vue';

import { useCloudServiceGetQuery } from '@/services/asset-inventory/composables/use-cloud-service-get-query';
import {
    CLOUD_SERVICE_TAG_TYPE,
    CLOUD_SERVICE_TAG_TYPE_BADGE_OPTION,
} from '@/services/asset-inventory/constants/cloud-service-detail-constant';
import type {
    CloudServiceTagTableItem,
} from '@/services/asset-inventory/types/cloud-service-detail-tag-type';


type Tag = Record<string, string>;

interface CloudServiceTags {
    [provider: string]: Tag;
}
const props = withDefaults(defineProps<{
    resourceId: string;
    disabled?: boolean;
    provider?: string;
}>(), {
    disabled: false,
    provider: '',
});

const referenceMap = useAllReferenceDataModel();
const queryClient = useQueryClient();
const state = reactive({
    tagTypeList: computed(() => [
        { name: 'all', label: i18n.t('INVENTORY.CLOUD_SERVICE.PAGE.ALL') },
        { name: CLOUD_SERVICE_TAG_TYPE.CUSTOM, label: CLOUD_SERVICE_TAG_TYPE_BADGE_OPTION[CLOUD_SERVICE_TAG_TYPE.CUSTOM].label },
        { name: CLOUD_SERVICE_TAG_TYPE.MANAGED, label: CLOUD_SERVICE_TAG_TYPE_BADGE_OPTION[CLOUD_SERVICE_TAG_TYPE.MANAGED].label },
    ]),
    selectedTagType: 'all',
    fields: computed(() => [
        { name: 'key', label: i18n.t('COMMON.TAGS.KEY'), type: 'item' },
        { name: 'value', label: i18n.t('COMMON.TAGS.VALUE'), type: 'item' },
        {
            name: 'type', label: i18n.t('INVENTORY.CLOUD_SERVICE.PAGE.TYPE'), type: 'item', disableCopy: true,
        },
        {
            name: 'provider', label: i18n.t('INVENTORY.CLOUD_SERVICE.PAGE.PROVIDER'), type: 'item', disableCopy: true,
        },
    ]),
    cloudServiceTags: computed<CloudServiceTags>(() => cloudServiceData.value?.tags ?? {}),
    items: computed<CloudServiceTagTableItem[]>(() => {
        if (state.selectedTagType === 'all') {
            const items:CloudServiceTagTableItem[] = [];
            Object.entries<Tag>(state.cloudServiceTags).forEach(([provider, tags]) => {
                Object.keys(tags).forEach((key) => {
                    items.push({
                        key,
                        value: tags[key],
                        type: (provider === CLOUD_SERVICE_TAG_TYPE.CUSTOM ? CLOUD_SERVICE_TAG_TYPE.CUSTOM : CLOUD_SERVICE_TAG_TYPE.MANAGED),
                        provider: provider === CLOUD_SERVICE_TAG_TYPE.CUSTOM ? undefined : provider,
                    });
                });
            });
            return items;
        }
        const isCustomTag = state.selectedTagType === CLOUD_SERVICE_TAG_TYPE.CUSTOM;
        const tags = isCustomTag ? state.customTags : state.manageTags;
        return Object.entries(tags).map(([key, value]) => ({
            key,
            value: value as string,
            type: state.selectedTagType,
            provider: isCustomTag ? undefined : props.provider,
        }));
    }),
    customTags: computed<Tag>(() => (state.cloudServiceTags?.custom ?? {})),
    manageTags: computed<Tag>(() => (state.cloudServiceTags[props.provider] ?? {})),
});

const { data: cloudServiceData, cloudServiceGetQueryKey } = useCloudServiceGetQuery({
    cloudServiceId: computed(() => props.resourceId),
    enabled: computed(() => !!props.resourceId),
});

/* event handler */
const handleSelectTagType = (tagType) => { state.selectedTagType = tagType; };
const handleTagsUpdated = async () => {
    await queryClient.invalidateQueries({ queryKey: cloudServiceGetQueryKey.value });
};

const getTagTypeBadgeOption = (tagType: keyof typeof CLOUD_SERVICE_TAG_TYPE) => CLOUD_SERVICE_TAG_TYPE_BADGE_OPTION[tagType];

</script>

<template>
    <tags-panel :resource-id="props.resourceId"
                resource-type="inventory.CloudService"
                resource-key="cloud_service_id"
                :disabled="props.disabled"
                :tag-edit-button-text="$t('INVENTORY.CLOUD_SERVICE.PAGE.EDIT_CUSTOM_TAGS')"
                :overlay-title="$t('INVENTORY.CLOUD_SERVICE.PAGE.CUSTOM_TAGS')"
                :custom-fields="state.fields"
                :custom-items="state.items"
                :custom-tags="state.customTags"
                @tags-updated="handleTagsUpdated"
    >
        <template #table-top>
            <div class="tag-type-filter">
                <span class="label">{{ $t('INVENTORY.CLOUD_SERVICE.PAGE.TYPE') }}</span>
                <p-select-status v-for="(status, idx) in state.tagTypeList"
                                 :key="`${status.name}-${idx}`"
                                 :selected="state.selectedTagType"
                                 :value="status.name"
                                 :multi-selectable="false"
                                 @change="handleSelectTagType"
                >
                    {{ status.label }}
                </p-select-status>
            </div>
        </template>
        <template #col-type-format="{ value }">
            <p-badge :style-type="getTagTypeBadgeOption(value).styleType"
                     :badge-type="CLOUD_SERVICE_TAG_TYPE.CUSTOM ? 'solid-outline' : 'subtle'"
            >
                {{ getTagTypeBadgeOption(value).label }}
            </p-badge>
        </template>
        <template #col-provider-format="{ value }">
            <p-badge v-if="referenceMap.provider[value]"
                     :background-color="referenceMap.provider[value]?.color"
                     text-color="white"
            >
                {{ referenceMap.provider[value]?.label || value }}
            </p-badge>
        </template>
    </tags-panel>
</template>

<style lang="postcss" scoped>
.tag-type-filter {
    @apply flex gap-4 items-center;
    padding: 1rem;
    font-size: 0.875rem;
    line-height: 125%;

    .label {
        @apply text-gray-500;
        font-size: 0.875rem;
    }
}
</style>
