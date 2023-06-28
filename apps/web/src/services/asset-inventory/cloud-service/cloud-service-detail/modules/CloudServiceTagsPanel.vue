<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PBadge, PSelectStatus } from '@spaceone/design-system';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import ErrorHandler from '@/common/composables/error/errorHandler';
import TagsPanel from '@/common/modules/tags/tags-panel/TagsPanel.vue';

import type { TagType } from '@/services/asset-inventory/cloud-service/cloud-service-detail/config';
import {
    CLOUD_SERVICE_TAG_TYPE,
    CLOUD_SERVICE_TAG_TYPE_BADGE_OPTION,
} from '@/services/asset-inventory/cloud-service/cloud-service-detail/config';
import type {
    CloudServiceTagTableItem,
} from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/type';


type Tag = Record<string, string>;

interface CloudServiceTags {
    [provider: string]: Tag;
}

interface Props {
    resourceId: string;
    disabled: boolean;
    provider: string;
}

const props = withDefaults(defineProps<Props>(), {
    resourceId: '',
    disabled: false,
    provider: '',
});
const store = useStore();
const { t } = useI18n();

const state = reactive({
    tagTypeList: computed(() => [
        { name: 'all', label: t('INVENTORY.CLOUD_SERVICE.PAGE.ALL') },
        { name: CLOUD_SERVICE_TAG_TYPE.CUSTOM, label: CLOUD_SERVICE_TAG_TYPE_BADGE_OPTION[CLOUD_SERVICE_TAG_TYPE.CUSTOM].label },
        { name: CLOUD_SERVICE_TAG_TYPE.MANAGED, label: CLOUD_SERVICE_TAG_TYPE_BADGE_OPTION[CLOUD_SERVICE_TAG_TYPE.MANAGED].label },
    ]),
    providers: computed(() => store.getters['reference/provider/fieldItems']?.options),
    selectedTagType: 'all',
    fields: computed(() => [
        { name: 'key', label: t('COMMON.TAGS.KEY'), type: 'item' },
        { name: 'value', label: t('COMMON.TAGS.VALUE'), type: 'item' },
        {
            name: 'type', label: t('INVENTORY.CLOUD_SERVICE.PAGE.TYPE'), type: 'item', disableCopy: true,
        },
        {
            name: 'provider', label: t('INVENTORY.CLOUD_SERVICE.PAGE.PROVIDER'), type: 'item', disableCopy: true,
        },
    ]),
    cloudServiceTags: {} as CloudServiceTags,
    // TODO: edit forced type assertion
    items: computed<CloudServiceTagTableItem[]>(() => {
        if (state.selectedTagType === 'all') {
            const items:CloudServiceTagTableItem[] = [];
            Object.entries<Tag>(state.cloudServiceTags).forEach(([provider, tags]) => {
                Object.keys(tags).forEach((key) => {
                    items.push({
                        key,
                        value: tags[key],
                        type: (provider === CLOUD_SERVICE_TAG_TYPE.CUSTOM ? CLOUD_SERVICE_TAG_TYPE.CUSTOM : CLOUD_SERVICE_TAG_TYPE.MANAGED) as TagType,
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
            type: state.selectedTagType as TagType,
            provider: isCustomTag ? undefined : props.provider,
        }));
    }),
    customTags: computed<Tag>(() => (state.cloudServiceTags?.custom ?? {})),
    manageTags: computed<Tag>(() => (state.cloudServiceTags[props.provider] ?? {})),
});
/* event handler */
const handleSelectTagType = (tagType) => { state.selectedTagType = tagType; };
const handleTagsUpdated = async () => { await getCloudServiceTags(); };

const getCloudServiceTags = async () => {
    try {
        const { tags } = await SpaceConnector.clientV2.inventory.cloudService.get({
            cloud_service_id: props.resourceId,
        });
        state.cloudServiceTags = tags;
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

const getTagTypeBadgeOption = (tagType: keyof typeof CLOUD_SERVICE_TAG_TYPE) => CLOUD_SERVICE_TAG_TYPE_BADGE_OPTION[tagType];
const getProviderBadgeOption = (provider) => ({
    color: state.providers[provider]?.options.background_color,
    label: state.providers[provider]?.name,
});

watch([() => props.resourceId, () => props.resourceId], () => { getCloudServiceTags(); }, {
    immediate: true,
});

</script>

<template>
    <tags-panel :resource-id="resourceId"
                :disabled="disabled"
                resource-type="inventory.CloudService"
                resource-key="cloud_service_id"
                :tag-edit-button-text="t('INVENTORY.CLOUD_SERVICE.PAGE.EDIT_CUSTOM_TAGS')"
                :overlay-title="t('INVENTORY.CLOUD_SERVICE.PAGE.CUSTOM_TAGS')"
                :custom-fields="state.fields"
                :custom-items="state.items"
                :custom-tags="state.customTags"
                @tags-updated="handleTagsUpdated"
    >
        <template #table-top>
            <div class="tag-type-filter">
                <span class="label">{{ t('INVENTORY.CLOUD_SERVICE.PAGE.TYPE') }}</span>
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
            <p-badge v-if="value"
                     :background-color="getProviderBadgeOption(value).color"
                     text-color="white"
            >
                {{ getProviderBadgeOption(value)?.label }}
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
