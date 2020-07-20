<template>
    <div class="progress-tab-nav">
        <div
            v-for="(tab, idx) in tabs"
            :key="tab.name"
            class="tab-nav-item"
            :class="{
                active: idx == proxyActiveIdx,
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
import { size } from 'lodash';
import { ref, computed } from '@vue/composition-api';
import PTooltipButton from '@/components/organisms/buttons/tooltip-button/TooltipButton.vue';
import PI from '@/components/atoms/icons/PI.vue';
import {
    ProgressTabBarProps,
    progressTabBarProps,
} from '@/components/molecules/tabs/progress-tab-bar/PProgressTabBar.toolset';
import { makeProxy } from '@/components/utils/composition';

export default {
    name: 'PProgressTabBar',
    components: {
        PTooltipButton,
        PI,
    },
    props: progressTabBarProps,
    setup(props: ProgressTabBarProps, { emit }) {
        const tabWidth = computed(() => `${100 / size(props.tabs)}%`);
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
    @apply flex w-full items-center justify-center;
    height: $height;
    .tab-nav-item {
        @apply relative flex items-center justify-center h-full p-0 text-sm cursor-pointer bg-white border-t border-b border-black text-black;
        flex: 1 1 auto;
        .triangle {
            @mixin triangle calc(($(height) / 2) - 1px), 2, theme('colors.white');
        }
        .triangle-bg {
            @mixin triangle calc($(height) / 2), 1, theme('colors.black');
        }
        &:last-child {
            @apply border-r border-black;
            .triangle, .triangle-bg {
                display: none;
            }
        }
        &:first-child {
            @apply border-l border-black;
        }
        &.active {
            @apply text-lg font-bold bg-black text-white;
            .triangle {
                @mixin triangle-color calc(($(height) / 2) - 1px), theme('colors.black');
            }
            .triangle-bg {
                @mixin triangle-color calc($(height) / 2), theme('colors.black');
            }
        }
        &.invalid {
            @apply border-alert text-alert bg-white;
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
        .help {
            margin-left: 0.5rem;
        }
    }
}
</style>
