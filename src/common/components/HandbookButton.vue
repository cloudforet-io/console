<template>
    <fragment>
        <button style-type="primary"
                class="handbook-button"
                @click="$store.dispatch('display/showHandbook')"
        >
            <p-i name="ic_help"
                 width="0.875rem" height="0.875rem"
                 color="inherit"
            />
            <span class="text">
                <slot name="button">{{ $t('COMMON.HANDBOOK_BUTTON.HANDBOOK') }}</slot>
            </span>
        </button>
        <portal to="handbook-title">
            <p class="handbook-title">
                {{ $t('COMMON.HANDBOOK_BUTTON.HANDBOOK') }}
            </p>
        </portal>
        <portal to="handbook-contents">
            <div class="handbook-contents">
                <p-tab v-if="tabs.length > 0" :tabs="tabs" :active-tab.sync="proxyActiveTab">
                    <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                        <div :key="slot">
                            <slot :name="slot" v-bind="scope" />
                        </div>
                    </template>
                </p-tab>
                <div v-else class="single-content">
                    <div>
                        <slot name="default" />
                    </div>
                </div>
                <div class="anymore">
                    <p-check-box v-model="noMore" :value="true" @change="onChangeNoMore">
                        {{ $t('COMMON.HANDBOOK_BUTTON.DONT_DISPLAY') }}
                    </p-check-box>
                </div>
            </div>
        </portal>
    </fragment>
</template>

<script lang="ts">
import {
    PI, PCheckBox, PTab,
} from '@spaceone/design-system';
import {
    computed, onMounted, onUnmounted,
    reactive,
    toRefs, watch,
} from '@vue/composition-api';
import { makeProxy } from '@/lib/compostion-util';
import { store } from '@/store';

interface Props {
    tabs?: any[];
    activeTab?: string;
    type: string;
}

export default {
    name: 'HandbookButton',
    components: {
        PI, PCheckBox, PTab,
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
    setup(props: Props, { emit }) {
        const state = reactive({
            proxyActiveTab: makeProxy('activeTab', props, emit),
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

        onMounted(() => {
            if (!state.noMore && !store.state.display.visibleSidebar) {
                store.dispatch('display/showHandbook');
            }
        });
        onUnmounted(() => {
            if (store.state.display.visibleSidebar) {
                store.dispatch('display/hideSidebar');
            }
        });
        return {
            ...toRefs(state),
            onChangeNoMore,
        };
    },
};
</script>

<style lang="postcss" scoped>
@define-mixin handbook-layout {
    position: relative;
    z-index: 1;
    flex-grow: 1;
    margin-bottom: 1rem;
    border-radius: 0 0 1.25rem 0;
    background-color: theme('colors.white');

    @screen lg {
        margin-bottom: 2rem;
    }
}

@define-mixin handbook-height {
    height: calc(100% - 2.75rem - 1.5625rem - 2.5rem);
    > div {
        overflow: auto;
        height: 100%;
    }
}

.handbook-button {
    @apply inline-flex items-center text-gray-700;
    margin-right: 20px;
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

.handbook-title {
    @apply text-center ml-4;
}

.handbook-contents {
    @apply relative flex h-full flex-col;

    &::before {
        content: '';

        @apply absolute block bg-blue-300;
        width: 93.63%;
        height: 8.75rem;
        bottom: 5.225rem;
        left: 0.589375rem;
        opacity: 0.5;
        border-radius: 0 0 1.25rem 0;
        transform: matrix(1, 0.05, -0.02, 1, 0, 0);
    }
    .single-content {
        @mixin handbook-layout;
        padding: 1.5625rem 0.875rem 2.5rem;
    }
    .p-tab::v-deep {
        @apply border-0;

        @mixin handbook-layout;
        .p-tab-bar {
            @apply bg-secondary-2;
        }
        .tab-pane {
            padding: 0 1.25rem;
            margin-top: 1.5625rem;
            margin-bottom: 2.5rem;
        }
    }
    .anymore {
        margin-top: auto;
    }
}

@screen lg {
    .handbook-contents {
        height: calc(100vh - 3rem - 3rem - 2.25rem - 1rem);
    }
    .p-tab::v-deep {
        .tab-pane {
            @mixin handbook-height;
        }
        .single-content {
            @mixin handbook-height;
        }
    }
    .anymore {
        margin-bottom: 2.5rem;
    }
}
</style>
