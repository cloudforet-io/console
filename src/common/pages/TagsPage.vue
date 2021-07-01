<template>
    <div class="page-mask">
        <p-pane-layout class="page-wrapper">
            <div class="page-nav">
                <div class="left">
                    <p-icon-button name="ic_back"
                                   size="lg"
                                   class="go-back-button mr-2"
                                   @click="goBack()"
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
                <tags-input-group ref="tagsRef"
                                  :tags.sync="newTags"
                                  :disabled="loading"
                                  show-validation
                                  :is-valid.sync="isTagsValid"
                                  :show-header="showHeader"
                >
                    <template #addButton="scope">
                        <p-icon-text-button
                            outline style-type="primary-dark" :disabled="scope.disabled"
                            name="ic_plus_bold"
                            @click="scope.addPair($event)"
                        >
                            {{ $t('COMMON.TAGS.ADD_TAG') }}
                        </p-icon-text-button>
                    </template>
                </tags-input-group>
            </p-pane-layout>
            <div class="buttons">
                <p-button style-type="gray900" :outline="true" @click="goBack">
                    {{ $t('COMMON.TAGS.CANCEL') }}
                </p-button>
                <p-button style-type="primary-dark" :disabled="!isTagsValid" @click="onSave">
                    {{ $t('COMMON.TAGS.SAVE') }}
                </p-button>
            </div>
        </p-pane-layout>
        <f-n-b class="fnb" />
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    camelCase, isEmpty, get,
} from 'lodash';

import {
    reactive, toRefs, computed, getCurrentInstance, ComponentRenderProxy, watch,
} from '@vue/composition-api';

import {
    PIconButton, PPaneLayout, PIconTextButton, PButton,
} from '@spaceone/design-system';

import TagsInputGroup from '@/common/components/tags-input-group/TagsInputGroup.vue';
import FNB from '@/common/modules/FNB.vue';

import { SpaceConnector } from '@/core-lib/space-connector';
import { showErrorMessage, showSuccessMessage } from '@/core-lib/helper/notice-alert-helper';

interface Props {
    tags: object;
    resourceKey: string;
    resourceId: string;
    resourceType: string;
}

export default {
    name: 'TagsPage',
    components: {
        TagsInputGroup,
        FNB,
        PIconButton,
        PButton,
        PPaneLayout,
        PIconTextButton,
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
    setup(props: Props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const apiKeys = computed(() => props.resourceType.split('.').map(d => camelCase(d)));
        const api = computed(() => get(SpaceConnector.client, apiKeys.value));

        const state = reactive({
            loading: false,
            showHeader: computed(() => state.newTags.length > 0),
            newTags: { ...props.tags },
            isTagsValid: false,
            noItem: computed(() => isEmpty(state.newTags)),
            tagsRef: null as any,
        });

        /* util */
        const goBack = () => {
            emit('close');
        };


        /* api */
        const onSave = async () => {
            if (!state.isTagsValid) return;
            if (!api.value) {
                showErrorMessage(vm.$t('COMMON.TAGS.ALT_E_UPDATE'), new Error(), vm.$root);
                return;
            }

            try {
                state.loading = true;
                await api.value.update({
                    [props.resourceKey]: props.resourceId,
                    tags: state.newTags,
                });
                showSuccessMessage(vm.$t('COMMON.TAGS.ALT_S_UPDATE'), '', vm.$root);
            } catch (e) {
                console.error(e);
                showErrorMessage(vm.$t('COMMON.TAGS.ALT_E_UPDATE'), e, vm.$root);
            } finally {
                state.loading = false;
            }

            emit('update');
        };

        watch(() => props.tags, (tags) => {
            state.newTags = { ...props.tags };
            if (state.tagsRef) state.tagsRef.init();
        });

        return {
            ...toRefs(state),
            goBack,
            onSave,
        };
    },
};

</script>

<style lang="postcss" scoped>
.page-mask {
    position: absolute;
    display: flex;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    flex-direction: column;
    z-index: 99;

    /* transition: opacity 0.3s ease; */
    max-height: 100%;
    min-height: 100%;
    max-width: 100vw;

    .page-wrapper {
        width: 100%;
        border: none;
        flex-grow: 1;
        .page-nav {
            @apply my-6 ml-8;
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
            @apply pl-4 pr-6 m-6 overflow-y-auto;
            height: 60vh;
        }
        .buttons {
            @apply flex mt-8 pr-12 justify-end;
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
