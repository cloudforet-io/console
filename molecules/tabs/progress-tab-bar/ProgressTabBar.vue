<template>
    <div class="progress-tab-nav">
        <div
            v-for="(tab, idx) in tabs"
            :key="tab.name"
            class="tab-nav-item"
            :class="{
                active: idx == proxyActiveIdx,
                done: progressState[tab.name],
                invalid: invalidState[tab.name],
            }"
            :style="{width: tabWidth}"
            @click="tabClick(idx)"
        >
            <span class="triangle-bg" />
            <span class="triangle" />
            <slot :name="`progress-${tab.name}`" :tab="tab">
                <span>{{ Number(idx) + 1 }}.
                    {{ tab.label || tab.name }}
                </span>
            </slot>

            <slot :name="`help-${tab.name}`" :tab="tab">
                <p-tooltip-button v-if="tab.help"
                                  class="help" :tooltip="tab.help" position="top"
                >
                    <template #button>
                        <p-i name="ic_tooltip" width="1rem"
                             height="1rem"
                        />
                    </template>
                </p-tooltip-button>
            </slot>
        </div>
    </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { ref, computed } from '@vue/composition-api';
import PTooltipButton from '@/components/organisms/buttons/tooltip-button/TooltipButton.vue';
import PI from '@/components/atoms/icons/PI.vue';
import {
    ProgressTabBarProps,
    progressTabBarProps,
} from '@/components/molecules/tabs/progress-tab-bar/ProgressTabBar.toolset';
import { makeProxy } from '@/lib/compostion-util';

export default {
    name: 'PProgressTabBar',
    components: {
        PTooltipButton,
        PI,
    },
    props: progressTabBarProps,
    setup(props: ProgressTabBarProps, { emit }) {
        const tabWidth = computed(() => `${100 / _.size(props.tabs)}%`);
        const proxyActiveIdx = makeProxy('activeIdx', props, emit);
        const tabClick = (idx) => {
            if (props.activeIdx !== idx) {
                emit('changeTab', idx, props.activeIdx);
                proxyActiveIdx.value = idx;
            }
        };

        return {
            tabWidth,
            proxyActiveIdx,
            tabClick,
        };
    },
};
</script>

<style lang="postcss" scoped>
$height: 2.5rem;

@define-mixin triangle-color $size, $color {
    border-left: $size solid $color;
}

@define-mixin triangle $size, $z-idx, $color {
    position: absolute;
    right: calc($(size) * -1);
    z-index: $z-idx;
    width: 0;
    height: 0;
    border-top: $size solid transparent;
    border-bottom: $size solid transparent;

    @mixin triangle-color $size, $color;
}

.progress-tab-nav {
    display: flex;
    width: 100%;
    height: $height;
    align-items: center;
    justify-content: center;
    .tab-nav-item {
        @apply bg-gray-100 border-t border-b border-gray-200 text-gray;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 1 1 auto;
        height: 100%;
        padding: 0;
        font-size: 0.875rem;
        cursor: pointer;
        &:last-child {
            @apply border-r border-gray-200;
            .triangle, .triangle-bg {
                display: none;
            }
        }
        &:first-child {
            @apply border-l border-gray-200;
        }
        &.active {
            @apply bg-gray-900 border-gray-900 text-white;
            font-size: 1rem;
            font-weight: bold;
            .triangle {
                @mixin triangle-color calc(($(height) / 2) - 1px), theme('colors.gray.900');
            }
            .triangle-bg {
                @mixin triangle-color calc($(height) / 2), theme('colors.gray.900');
            }
        }
        &.done {
            @apply border-gray-900 bg-white;
            .triangle {
                @mixin triangle-color calc(($(height) / 2) - 1px), theme('colors.white');
            }
            .triangle-bg {
                @mixin triangle-color calc($(height) / 2), theme('colors.gray.900');
            }
            &.active {
                @apply bg-gray-900;
                .triangle {
                    @mixin triangle-color calc(($(height) / 2) - 1px), theme('colors.gray.900');
                }
            }
        }
        &.invalid {
            @apply border-alert text-alert bg-white;
            font-style: italic;
            .triangle {
                @mixin triangle-color calc(($(height) / 2) - 1px), theme('colors.white');
            }
            .triangle-bg {
                @mixin triangle-color calc($(height) / 2), theme('colors.alert');
            }
            &.active {
                @apply bg-alert border-alert text-white;
                .triangle {
                    @mixin triangle-color calc(($(height) / 2) - 1px), theme('colors.alert');
                }
            }
        }
        .triangle {
            @mixin triangle calc(($(height) / 2) - 1px), 2, theme('colors.gray.100');
        }
        .triangle-bg {
            @mixin triangle calc($(height) / 2), 1, theme('colors.gray.200');
        }
        .help {
            margin-left: 0.5rem;
        }
    }
}
</style>
