<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PDataTable, PHeading, PButton,
} from '@spaceone/design-system';
import { get, camelCase } from 'lodash';
import {
    computed, reactive, useSlots, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import type { Tag } from '@/common/components/forms/tags-input-group/type';
import ErrorHandler from '@/common/composables/error/errorHandler';
import TagsOverlay from '@/common/modules/tags/tags-panel/modules/TagsOverlay.vue';

import type {
    CloudServiceTagTableItem,
} from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/type';

interface Props {
    resourceKey: string;
    resourceId: string;
    resourceType: string;
    disabled: boolean;
    tagEditButtonText?: undefined|string;
    overlayTitle?: undefined|string;
    customFields?: any[];
    customItems?: CloudServiceTagTableItem[];
    customTags?: Tag;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'tags-updated'): void;}>();
const { t } = useI18n();
const slots = useSlots();

const apiKeys = computed(() => props.resourceType.split('.').map((d) => camelCase(d)));
const api = computed(() => {
    if (props.resourceType === 'inventory.CloudService') {
        return get(SpaceConnector.clientV2, apiKeys.value);
    }
    return get(SpaceConnector.client, apiKeys.value);
});

const state = reactive({
    loading: true,
    tags: {},
    isCustomMode: computed<boolean>(() => !!props.customItems && !!props.customFields),
    fields: computed(() => [
        { name: 'key', label: t('COMMON.TAGS.KEY'), type: 'item' },
        { name: 'value', label: t('COMMON.TAGS.VALUE'), type: 'item' },
    ]),
    items: computed(() => Object.keys(state.tags).map((k) => ({ key: k, value: state.tags[k] }))),
});
const tagState = reactive({
    tagEditPageVisible: false,
});

/* api */
const getTags = async () => {
    if (!api.value) {
        state.tags = {};
        state.loading = false;
        return;
    }

    try {
        const { tags } = await api.value.get({
            [props.resourceKey]: props.resourceId,
            query: { only: ['tags'] },
        });
        state.tags = tags;
    } catch (e) {
        state.tags = {};
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};

/* event */
const editTag = async () => {
    tagState.tagEditPageVisible = true;
};
const closeTag = async () => {
    tagState.tagEditPageVisible = false;
};
const handleTagUpdate = async (newTags) => {
    if (!api.value) {
        ErrorHandler.handleRequestError(new Error(), t('COMMON.TAGS.ALT_E_UPDATE'));
        return;
    }

    try {
        state.loading = true;
        await api.value.update({
            [props.resourceKey]: props.resourceId,
            tags: newTags,
        });
        showSuccessMessage(t('COMMON.TAGS.ALT_S_UPDATE'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('COMMON.TAGS.ALT_E_UPDATE'));
    } finally {
        state.loading = false;
    }
    emit('tags-updated');
    if (!state.isCustomMode) await getTags();
    tagState.tagEditPageVisible = false;
};

watch(
    [() => props.resourceKey, () => props.resourceId, () => props.resourceType],
    async ([resourceKey, resourceId, resourceType]) => {
        if (resourceKey && resourceId && resourceType && !state.isCustomMode) {
            await getTags();
        } else {
            state.loading = false;
        }
    },
    { immediate: true },
);

</script>

<template>
    <div>
        <p-heading heading-type="sub"
                   :use-total-count="true"
                   :total-count="state.isCustomMode ? customItems.length : state.items.length"
                   :title="t('COMMON.TAGS.TITLE')"
        >
            <template #extra>
                <div class="edit-button-container">
                    <p-button style-type="secondary"
                              icon-left="ic_edit"
                              :disabled="disabled"
                              @click="editTag"
                    >
                        {{ tagEditButtonText ?? t('COMMON.TAGS.EDIT') }}
                    </p-button>
                </div>
            </template>
        </p-heading>
        <slot name="table-top" />
        <p-data-table :fields="state.isCustomMode ? customFields : state.fields"
                      :items="state.isCustomMode ? customItems : state.items"
                      :loading="state.loading"
                      :col-copy="true"
                      beautify-text
        >
            <template v-for="(_, slot) of slots"
                      #[slot]="scope"
            >
                <slot :name="slot"
                      v-bind="scope"
                />
            </template>
        </p-data-table>
        <transition name="slide-up">
            <tags-overlay v-if="tagState.tagEditPageVisible"
                          :title="overlayTitle"
                          :tags="state.isCustomMode ? customTags : state.tags"
                          :resource-id="resourceId"
                          :resource-key="resourceKey"
                          :resource-type="resourceType"
                          :loading="state.loading"
                          @close="closeTag"
                          @update="handleTagUpdate"
            />
        </transition>
    </div>
</template>

<style lang="postcss" scoped>
.edit-button-container {
    display: flex;
    justify-content: flex-end;
}

/* transition */
.slide-up-enter-active {
    transition: all 0.3s ease;
}
.slide-up-leave-active {
    transition: all 0.3s ease-out;
}
.slide-up-enter-from, .slide-up-leave-to {
    transform: translateY(100px);
    opacity: 0;
}

.p-data-table {
    min-height: 10rem;
}
</style>
