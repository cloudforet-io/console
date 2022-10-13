<template>
    <!--song-lang : overlayTitle is located in the TagsOverlay.vue-->
    <tags-panel :resource-id="resourceId"
                :disabled="disabled"
                resource-type="inventory.CloudService"
                resource-key="cloud_service_id"
                :tag-edit-button-text="$t('Edit Custom Tags')"
                :overlay-title="$t('Custom Tags')"
                :custom-fields="fields"
                :custom-items="items"
                :custom-tags="tags"
                @tags-updated="handleTagsUpdated"
    >
        <template #table-top>
            <div class="tag-type-filter">
                <!--song-lang-->
                <span class="label">{{ $t('Type') }}</span>
                <p-select-status v-for="(status, idx) in tagTypeList" :key="`${status.name}-${idx}`"
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
            <p-badge v-if="value" :background-color="getProviderBadgeOption(value).color">
                {{ getProviderBadgeOption(value)?.label }}
            </p-badge>
        </template>
    </tags-panel>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from 'vue';

import { PBadge, PSelectStatus } from '@spaceone/design-system';


import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';
import { i18n } from '@/translations';

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
                { name: 'all', label: 'All' }, // song-lang
                { name: CLOUD_SERVICE_TAG_TYPE.CUSTOM, label: CLOUD_SERVICE_TAG_TYPE_BADGE_OPTION[CLOUD_SERVICE_TAG_TYPE.CUSTOM].label },
                { name: CLOUD_SERVICE_TAG_TYPE.MANAGED, label: CLOUD_SERVICE_TAG_TYPE_BADGE_OPTION[CLOUD_SERVICE_TAG_TYPE.MANAGED].label },
            ]),
            providers: computed(() => store.getters['reference/provider/fieldItems']?.options),
            selectedTagType: 'all',
            cloudServiceTagList: [],
            tags: computed(() => {
                const tagObject = {};
                (state.cloudServiceTagList ?? []).forEach((tag) => {
                    tagObject[tag.key] = tag.value;
                });
                return tagObject;
            }),
            fields: computed(() => [
                { name: 'key', label: i18n.t('COMMON.TAGS.KEY'), type: 'item' },
                { name: 'value', label: i18n.t('COMMON.TAGS.VALUE'), type: 'item' },
                {
                    name: 'type', label: i18n.t('Type'), type: 'item', disableCopy: true,
                }, // song-lang
                {
                    name: 'provider', label: i18n.t('Provider'), type: 'item', disableCopy: true,
                }, // song-lang
            ]),
            items: computed(() => state.cloudServiceTagList?.map(k => ({
                key: k.key,
                value: k.value,
                type: k.type,
                provider: k.provider,
            }))),
        });
        /* event handler */
        const handleSelectTagType = (tagType) => { state.selectedTagType = tagType; };
        const handleTagsUpdated = async () => { await getCloudServiceTags(); };

        const getCloudServiceTags = async () => {
            try {
                const { results } = await SpaceConnector.client.inventory.cloudServiceTag.list({
                    cloud_service_id: props.resourceId,
                });
                state.cloudServiceTagList = results;
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };

        const getTagTypeBadgeOption = (tagType: keyof typeof CLOUD_SERVICE_TAG_TYPE) => CLOUD_SERVICE_TAG_TYPE_BADGE_OPTION[tagType];
        const getProviderBadgeOption = provider => ({
            color: state.providers[provider]?.options.background_color,
            label: state.providers[provider]?.name,
        });

        (async () => {
            await getCloudServiceTags();
        })();
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
