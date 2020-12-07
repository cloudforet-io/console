<template>
    <div class="page-mask">
        <p-pane-layout class="page-wrapper">
            <div class="page-nav">
                <div class="left">
                    <p-icon-button name="ic_back" width="2rem" height="2rem"
                                   class="mr-2"
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
                <tags-input-group :tags.sync="newTags"
                                  :disabled="loading"
                                  :show-validation="showValidation"
                                  :is-valid.sync="isTagsValid"
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
                <p-button style-type="primary-dark" @click="onSave">
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
    reactive, toRefs, computed, getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';

import TagsInputGroup from '@/views/common/components/tags/TagsInputGroup.vue';
import FNB from '@/views/common/components/fnb/FNB.vue';
import PIconButton from '@/components/molecules/buttons/icon-button/PIconButton.vue';
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PPaneLayout.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';

import { SpaceConnector } from '@/lib/space-connector';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';

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
            type: Array,
            default: () => ([]),
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
    setup(props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const apiKeys = computed(() => props.resourceType.split('.').map(d => camelCase(d)));
        const api = computed(() => get(SpaceConnector.client, apiKeys.value));

        const state = reactive({
            loading: false,
            showValidation: false,
            newTags: props.tags.slice(),
            isTagsValid: true,
            noItem: computed(() => isEmpty(state.newTags)),
        });

        /* util */
        const goBack = () => {
            emit('close');
        };

        /* api */
        const onSave = async () => {
            if (!state.showValidation) state.showValidation = true;
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
    @apply absolute flex flex-col left-0 w-full h-full;
    z-index: 99;
    top: $gnb-height;

    /* transition: opacity 0.3s ease; */

    max-height: calc(100vh - ($gnb-height));
    min-height: calc(100vh - ($gnb-height));
    max-width: 100vw;
    .page-wrapper {
        @apply w-screen border-none flex-grow;
        .page-nav {
            @apply my-6 ml-8;
            .left {
                @apply flex;
                .title {
                    @apply font-bold text-2xl;
                    line-height: 120%;
                }
            }
        }
        .comment {
            @apply my-6;
            line-height: 150%;
            .highlight {
                @apply font-bold;
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
