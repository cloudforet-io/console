<template>
    <div class="tags-overlay">
        <p-pane-layout class="page-wrapper">
            <div class="page-nav">
                <div class="left">
                    <p-icon-button name="ic_back"
                                   size="lg"
                                   class="go-back-button mr-2"
                                   @click="$emit('close')"
                    />
                    <div class="title">
                        {{ $t('COMMON.TAGS.TITLE') }}
                    </div>
                </div>
                <div class="right" />
            </div>
            <p-pane-layout class="tag-panel">
                <div v-if="noItem" class="comment">
                    <span class="highlight">{{ $t('COMMON.TAGS.NO_TAGS') }}</span><br>
                    {{ $t('COMMON.TAGS.CLICK_TO_ADD_TAG') }}
                </div>
                <div v-else class="comment">
                    <span class="highlight">{{ $t('COMMON.TAGS.ADD_TAG_DESC') }}</span><br>
                    {{ $t('COMMON.TAGS.KEY_VALUE_DESC') }}
                </div>
                <tags-input-group :tags="newTags"
                                  :disabled="loading"
                                  show-validation
                                  :is-valid.sync="isTagsValid"
                                  :show-header="showHeader"
                                  @update-tags="handleUpdateTags"
                />
            </p-pane-layout>
            <div class="buttons">
                <p-button style-type="gray900" :outline="true" @click="$emit('close')">
                    {{ $t('COMMON.TAGS.CANCEL') }}
                </p-button>
                <p-button style-type="primary-dark" :disabled="!isTagsValid" @click="handleSaveTags">
                    {{ $t('COMMON.TAGS.SAVE') }}
                </p-button>
            </div>
        </p-pane-layout>
    </div>
</template>

<script lang="ts">


import type { SetupContext } from 'vue';
import {
    reactive, toRefs, computed, onMounted,
} from 'vue';

import {
    PIconButton, PPaneLayout, PButton,
} from '@spaceone/design-system';
import {
    camelCase, isEmpty, get,
} from 'lodash';

import { SpaceConnector } from 'cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import TagsInputGroup from '@/common/components/forms/tags-input-group/TagsInputGroup.vue';
import type { Tag } from '@/common/components/forms/tags-input-group/type';
import ErrorHandler from '@/common/composables/error/errorHandler';


export default {
    name: 'TagsOverlay',
    components: {
        TagsInputGroup,
        PIconButton,
        PButton,
        PPaneLayout,
    },
    props: {
        tags: {
            type: Object,
            default: () => ({}),
        },
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
    },
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            loading: false,
            showHeader: computed(() => state.newTags.length > 0),
            newTags: { ...props.tags },
            isTagsValid: false,
            noItem: computed(() => isEmpty(state.newTags)),
        });

        /* Api */
        const handleSaveTags = async () => {
            if (!state.isTagsValid) return;

            const apiKeys = props.resourceType.split('.').map(d => camelCase(d));
            const api = get(SpaceConnector.client, apiKeys);
            if (!api) {
                ErrorHandler.handleRequestError(new Error(), i18n.t('COMMON.TAGS.ALT_E_UPDATE'));
                return;
            }

            try {
                state.loading = true;
                await api.update({
                    [props.resourceKey]: props.resourceId,
                    tags: state.newTags,
                });
                showSuccessMessage(i18n.t('COMMON.TAGS.ALT_S_UPDATE'), '');
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('COMMON.TAGS.ALT_E_UPDATE'));
            } finally {
                state.loading = false;
            }

            emit('update');
        };

        /* Event */
        const handleUpdateTags = (tags?: Tag) => {
            state.newTags = tags;
        };

        /* Init */
        onMounted(() => {
            state.newTags = { ...props.tags };
        });

        return {
            ...toRefs(state),
            handleSaveTags,
            handleUpdateTags,
        };
    },
};

</script>

<style lang="postcss" scoped>
.tags-overlay {
    position: fixed;
    width: 100vw;
    height: calc(100vh - $(gnb-height));
    top: $gnb-height;
    left: 0;
    z-index: 99;
    background-color: $bg-color;

    .page-wrapper {
        display: flex;
        flex-direction: column;
        background-color: transparent;
        width: 100%;
        max-height: 100%;
        min-height: 100%;
        border: none;
        .page-nav {
            @apply my-6 ml-8;
            flex-shrink: 0;
            .left {
                @apply flex;
                .go-back-button {
                    min-width: 2rem;
                    min-height: 2rem;
                    max-width: 2rem;
                    max-height: 2rem;
                }
                .title {
                    font-size: 1.5rem;
                    font-weight: bold;
                    line-height: 1.2;
                }
            }
        }
        .comment {
            margin-top: 1.5rem;
            margin-bottom: 1.5rem;
            line-height: 150%;
            .highlight {
                font-weight: bold;
            }
        }
        .tag-panel {
            @apply pl-4 pr-6 m-6;
            flex-grow: 1;
            overflow-y: auto;
        }
        .buttons {
            @apply flex mt-8 mb-8 pr-12 justify-end;
            .p-button {
                @apply ml-4;
            }
        }
    }
    .fnb {
        @apply flex-grow-0 border-none bg-white;
    }
}
</style>
