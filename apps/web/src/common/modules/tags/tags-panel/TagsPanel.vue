<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { get, camelCase } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PDataTable, PHeading, PButton, PHeadingLayout,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import TagsOverlay from '@/common/modules/tags/tags-panel/modules/TagsOverlay.vue';
import type { Tag } from '@/common/modules/tags/type';

import type {
    CloudServiceTagTableItem,
} from '@/services/asset-inventory/types/cloud-service-detail-tag-type';

const props = withDefaults(defineProps<{
    resourceKey: string;
    resourceId: string;
    resourceType: string;
    disabled?: boolean;
    tagEditButtonText?: Omit<TranslateResult, 'null'>|string;
    overlayTitle?: Omit<TranslateResult, 'null'>|string;
    customFields?: any[];
    customItems?: CloudServiceTagTableItem[];
    customTags?: Tag;
}>(), {
    disabled: false,
    tagEditButtonText: undefined,
    overlayTitle: undefined,
    customFields: undefined,
    customItems: undefined,
    customTags: undefined,
});
const emit = defineEmits<{(e: 'tags-updated'): void;
}>();

const appContextStore = useAppContextStore();
const appContextGetters = appContextStore.getters;

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
        { name: 'key', label: i18n.t('COMMON.TAGS.KEY'), type: 'item' },
        { name: 'value', label: i18n.t('COMMON.TAGS.VALUE'), type: 'item' },
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
        ErrorHandler.handleRequestError(new Error(), i18n.t('COMMON.TAGS.ALT_E_UPDATE'));
        return;
    }

    try {
        state.loading = true;
        await api.value.update({
            [props.resourceKey]: props.resourceId,
            tags: newTags,
        });
        showSuccessMessage(i18n.t('COMMON.TAGS.ALT_S_UPDATE'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('COMMON.TAGS.ALT_E_UPDATE'));
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
        <p-heading-layout class="pt-8 px-4 pb-4">
            <template #heading>
                <p-heading heading-type="sub"
                           :use-total-count="true"
                           :total-count="state.isCustomMode ? props.customItems.length : state.items.length"
                           :title="$t('COMMON.TAGS.TITLE')"
                />
            </template>
            <template #extra>
                <p-button v-if="!appContextGetters.isAdminMode"
                          style-type="secondary"
                          icon-left="ic_edit"
                          :disabled="props.disabled"
                          @click="editTag"
                >
                    {{ props.tagEditButtonText ?? $t('COMMON.TAGS.EDIT') }}
                </p-button>
            </template>
        </p-heading-layout>
        <slot name="table-top" />
        <p-data-table :fields="state.isCustomMode ? props.customFields : state.fields"
                      :items="state.isCustomMode ? props.customItems : state.items"
                      :loading="state.loading"
                      :col-copy="true"
                      beautify-text
        >
            <template v-for="(_, slot) of $scopedSlots"
                      #[slot]="scope"
            >
                <slot :name="slot"
                      v-bind="scope"
                />
            </template>
        </p-data-table>
        <transition name="slide-up">
            <tags-overlay v-if="tagState.tagEditPageVisible"
                          :title="props.overlayTitle"
                          :tags="state.isCustomMode ? props.customTags : state.tags"
                          :resource-id="props.resourceId"
                          :resource-key="props.resourceKey"
                          :resource-type="props.resourceType"
                          :loading="state.loading"
                          @close="closeTag"
                          @confirm="handleTagUpdate"
            />
        </transition>
    </div>
</template>
<style lang="postcss" scoped>
/* transition */
.slide-up-enter-active {
    transition: all 0.3s ease;
}
.slide-up-leave-active {
    transition: all 0.3s ease-out;
}
.slide-up-enter, .slide-up-leave-to {
    transform: translateY(100px);
    opacity: 0;
}

.p-data-table {
    min-height: 10rem;
}
</style>
