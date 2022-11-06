<template>
    <tags-panel :resource-id="resourceId"
                :disabled="disabled"
                resource-type="inventory.CloudService"
                resource-key="cloud_service_id"
                :tag-edit-button-text="$t('INVENTORY.CLOUD_SERVICE.PAGE.EDIT_CUSTOM_TAGS')"
                :overlay-title="$t('INVENTORY.CLOUD_SERVICE.PAGE.CUSTOM_TAGS')"
                :custom-fields="fields"
                :custom-items="items"
                :custom-tags="customTags"
                @tags-updated="handleTagsUpdated"
    >
        <template #table-top>
            <div class="tag-type-filter">
                <span class="label">{{ $t('INVENTORY.CLOUD_SERVICE.PAGE.TYPE') }}</span>
                <p-select-status v-for="(status, idx) in tagTypeList"
                                 :key="`${status.name}-${idx}`"
                                 :selected="selectedTagType"
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
                     outline
            >
                {{ getTagTypeBadgeOption(value).label }}
            </p-badge>
        </template>
        <template #col-provider-format="{ value }">
            <p-badge v-if="value"
                     :background-color="getProviderBadgeOption(value).color"
            >
                {{ getProviderBadgeOption(value)?.label }}
            </p-badge>
        </template>
    </tags-panel>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from 'vue';

import { PBadge, PSelectStatus } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { Tag } from '@/common/components/forms/tags-input-group/type';
import ErrorHandler from '@/common/composables/error/errorHandler';
import TagsPanel from '@/common/modules/tags/tags-panel/TagsPanel.vue';

import {
    CLOUD_SERVICE_TAG_TYPE,
    CLOUD_SERVICE_TAG_TYPE_BADGE_OPTION,
} from '@/services/asset-inventory/cloud-service/cloud-service-detail/config';

export default {
    name: 'CloudServiceTagsPanel',
    components: {
        PSelectStatus,
        PBadge,
        TagsPanel,
    },
    props: {
        resourceId: {
            type: String,
            default: '',
            required: true,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const state = reactive({
            tagTypeList: computed(() => [
                { name: 'all', label: i18n.t('INVENTORY.CLOUD_SERVICE.PAGE.ALL') },
                { name: CLOUD_SERVICE_TAG_TYPE.CUSTOM, label: CLOUD_SERVICE_TAG_TYPE_BADGE_OPTION[CLOUD_SERVICE_TAG_TYPE.CUSTOM].label },
                { name: CLOUD_SERVICE_TAG_TYPE.MANAGED, label: CLOUD_SERVICE_TAG_TYPE_BADGE_OPTION[CLOUD_SERVICE_TAG_TYPE.MANAGED].label },
            ]),
            providers: computed(() => store.getters['reference/provider/fieldItems']?.options),
            selectedTagType: 'all',
            cloudServiceTagList: [],
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
            items: computed(() => state.cloudServiceTagList?.map((k) => ({
                key: k.key,
                value: k.value,
                type: k.type,
                provider: k.provider,
            }))),
            customTags: computed<Tag>(() => {
                const tagObject = {};
                (state.cloudServiceTagList ?? []).forEach((tag) => {
                    if (tag.type === CLOUD_SERVICE_TAG_TYPE.CUSTOM) {
                        tagObject[tag.key] = tag.value;
                    }
                });
                return tagObject;
            }),
        });
        /* event handler */
        const handleSelectTagType = (tagType) => { state.selectedTagType = tagType; };
        const handleTagsUpdated = async () => { await getCloudServiceTags(); };

        const apiQuery = new ApiQueryHelper();
        const getCloudServiceTags = async () => {
            try {
                apiQuery.setFilters([{ k: 'type', v: state.selectedTagType, o: '=' }]);
                const { results } = await SpaceConnector.client.inventory.cloudServiceTag.list({
                    cloud_service_id: props.resourceId,
                    ...((state.selectedTagType !== 'all') && { query: apiQuery.data }),
                });
                state.cloudServiceTagList = results;
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };

        const getTagTypeBadgeOption = (tagType: keyof typeof CLOUD_SERVICE_TAG_TYPE) => CLOUD_SERVICE_TAG_TYPE_BADGE_OPTION[tagType];
        const getProviderBadgeOption = (provider) => ({
            color: state.providers[provider]?.options.background_color,
            label: state.providers[provider]?.name,
        });

        watch([() => state.selectedTagType, () => props.resourceId], () => { getCloudServiceTags(); }, {
            immediate: true,
        });
        return {
            ...toRefs(state),
            handleSelectTagType,
            handleTagsUpdated,
            getTagTypeBadgeOption,
            getProviderBadgeOption,
        };
    },
};
</script>

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
