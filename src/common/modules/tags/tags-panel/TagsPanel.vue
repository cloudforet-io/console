<template>
    <div>
        <p-panel-top :use-total-count="true"
                     :total-count="isCustomMode ? customItems.length : items.length"
        >
            <template #default>
                {{ $t('COMMON.TAGS.TITLE') }}
            </template>
            <template #extra>
                <div class="edit-button-container">
                    <p-button style-type="secondary"
                              icon-left="ic_edit"
                              :disabled="disabled"
                              @click="editTag"
                    >
                        {{ tagEditButtonText ?? $t('COMMON.TAGS.EDIT') }}
                    </p-button>
                </div>
            </template>
        </p-panel-top>
        <slot name="table-top" />
        <p-data-table :fields="isCustomMode ? customFields : fields"
                      :items="isCustomMode ? customItems : items"
                      :loading="loading"
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
            <tags-overlay v-if="tagEditPageVisible"
                          :title="overlayTitle"
                          :tags="isCustomMode ? customTags : tags"
                          :resource-id="resourceId"
                          :resource-key="resourceKey"
                          :resource-type="resourceType"
                          :loading="loading"
                          @close="closeTag"
                          @update="handleTagUpdate"
            />
        </transition>
    </div>
</template>

<script lang="ts">

import type { PropType, SetupContext } from 'vue';
import {
    computed, reactive, toRefs, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PDataTable, PPanelTop, PButton,
} from '@spaceone/design-system';
import { get, camelCase } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import type { Tag } from '@/common/components/forms/tags-input-group/type';
import ErrorHandler from '@/common/composables/error/errorHandler';
import TagsOverlay from '@/common/modules/tags/tags-panel/modules/TagsOverlay.vue';

import type {
    CloudServiceTagTableItem,
} from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/type';

export default {
    name: 'TagsPanel',
    components: {
        PDataTable,
        PPanelTop,
        PButton,
        TagsOverlay,
    },
    props: {
        resourceKey: {
            type: String,
            default: '',
            required: true,
        },
        resourceId: {
            type: String,
            default: '',
            required: true,
        },
        resourceType: {
            type: String,
            default: '',
            required: true,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        tagEditButtonText: {
            type: String as PropType<TranslateResult|string|undefined>,
            default: undefined,
        },
        overlayTitle: {
            type: String as PropType<TranslateResult|string|undefined>,
            default: undefined,
        },
        customFields: {
            type: Array,
            default: undefined,
        },
        customItems: {
            type: Array as PropType<CloudServiceTagTableItem[]>,
            default: undefined,
        },
        customTags: {
            type: Object as PropType<Tag>,
            default: undefined,
        },
    },
    setup(props, { emit }: SetupContext) {
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
            isCustomMode: computed<boolean>(() => props.customItems && props.customFields),
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
                    tags: {
                        custom: newTags,
                    },
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

        return {
            ...toRefs(state),
            ...toRefs(tagState),
            editTag,
            closeTag,
            handleTagUpdate,
        };
    },
};
</script>
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
.slide-up-enter, .slide-up-leave-to {
    transform: translateY(100px);
    opacity: 0;
}

.p-data-table {
    min-height: 10rem;
}
</style>
