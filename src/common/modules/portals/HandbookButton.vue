<template>
    <fragment>
        <span style-type="primary"
              class="handbook-button"
              @click="handleHandbookButton"
        >
            <p-i name="ic_help"
                 width="0.875rem"
                 height="0.875rem"
                 color="inherit"
            />
            <span class="text">
                <slot name="button">{{ $t('COMMON.HANDBOOK_BUTTON.HANDBOOK') }}</slot>
            </span>
        </span>
        <portal to="handbook-title">
            <p class="handbook-title">
                {{ $t('COMMON.HANDBOOK_BUTTON.HANDBOOK') }}
            </p>
        </portal>
        <portal to="handbook-contents">
            <div class="handbook-contents">
                <p-tab :tabs="tabs"
                       :active-tab.sync="proxyActiveTab"
                >
                    <template v-for="(_, slot) of $scopedSlots"
                              #[slot]="scope"
                    >
                        <div :key="slot">
                            <slot :name="slot"
                                  v-bind="scope"
                            />
                        </div>
                    </template>
                </p-tab>
                <div class="no-more">
                    <p-checkbox v-model="noMore"
                                :value="true"
                                @change="onChangeNoMore"
                    >
                        {{ $t('COMMON.HANDBOOK_BUTTON.DONT_DISPLAY') }}
                    </p-checkbox>
                </div>
            </div>
        </portal>
    </fragment>
</template>

<script lang="ts">
import type { SetupContext } from 'vue';
import {
    computed, reactive, toRefs, watch, onMounted, onUnmounted, defineComponent,
} from 'vue';

import {
    PI, PCheckbox, PTab,
} from '@spaceone/design-system';

import { store } from '@/store';

import { useProxyValue } from '@/common/composables/proxy-state';

export default defineComponent({
    name: 'HandbookButton',
    components: {
        PI, PCheckbox, PTab,
    },
    props: {
        tabs: {
            type: Array,
            default: () => [],
        },
        activeTab: {
            type: String,
            default: '',
        },
        type: {
            type: String,
            required: true,
        },
    },
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            proxyActiveTab: useProxyValue('activeTab', props, emit),
            storageKey: computed<string>(() => `handbook:${store.state.user.userId}:${props.type}`),
            noMore: false,
        });

        watch(() => state.storageKey, () => {
            state.noMore = !!JSON.parse(localStorage.getItem(state.storageKey) ?? 'false');
        }, { immediate: true });

        const onChangeNoMore = (val) => {
            localStorage.setItem(state.storageKey, val);
            if (val) store.dispatch('display/hideSidebar');
        };

        const handleHandbookButton = () => {
            if (store.getters['display/isHandbookVisible']) store.dispatch('display/hideSidebar');
            else store.dispatch('display/showHandbook');
        };

        onMounted(() => {
            if (!state.noMore && !store.getters['display/isHandbookVisible']) {
                store.dispatch('display/showHandbook');
            }
        });
        onUnmounted(() => {
            if (store.getters['display/isHandbookVisible']) {
                store.dispatch('display/hideSidebar');
            }
        });
        return {
            ...toRefs(state),
            onChangeNoMore,
            handleHandbookButton,
        };
    },
});
</script>

<style lang="postcss" scoped>
.handbook-button {
    @apply inline-flex items-center text-gray-700;
    cursor: pointer;
    font-size: 0.75rem;
    line-height: 1.2;
    &:hover {
        @apply text-secondary;
        .text {
            text-decoration: underline;
        }
    }
    .text {
        @apply ml-1 mr-0;
    }
}

.handbook-contents {
    @apply relative flex h-full flex-col;
    height: calc(32vh - 6rem);
    &::before {
        @apply absolute block bg-blue-300;
        width: 93.63%;
        height: 8.75rem;
        bottom: 0.5rem;
        left: 0.589375rem;
        opacity: 0.5;
        border-radius: 0 0 1.25rem 0;
        transform: matrix(1, 0.05, -0.02, 1, 0, 0);
        content: '';
    }

    /* custom design-system component - p-tab */
    :deep(.p-tab) {
        @apply overflow-auto relative flex-grow border-0;
        z-index: 1;
        margin-bottom: 1rem;
        border-radius: 0 0 1.25rem 0;
        background-color: theme('colors.white');
        min-height: auto;

        .p-tab-bar {
            @apply bg-secondary-2;
        }
        .is-single {
            display: none;
        }
        .tab-pane {
            padding: 0 1rem;
            margin-top: 1.75rem;
            margin-bottom: 1.75rem;
        }
    }
    .no-more {
        position: fixed;
        bottom: 0.5rem;
    }
}

@screen lg {
    .handbook-title {
        @apply text-center ml-8;
    }
    .handbook-contents {
        @apply overflow-auto;
        height: calc(100vh - 8.825rem);
        &::before {
            bottom: 2.225rem;
        }

        /* custom design-system component - p-tab */
        :deep(.p-tab) {
            margin-bottom: 1.5rem;
            min-height: 19rem;
            .is-single + .tab-pane {
                height: calc(100% - 3.5rem);
            }
            .tab-pane {
                @apply overflow-auto;
                height: calc(100% - 6.25rem);
            }
        }
        .no-more {
            position: relative;
            bottom: 0;
        }
    }
}
</style>
