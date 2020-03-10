<template>
    <div class="progress-tab-nav">
        <div
            v-for="(tab, idx) in tabs"
            :key="tab.key"
            class="tab-nav-item"
            :class="{
                active: idx == activeIdx,
                done: tab.done,
                invalid: tab.showValidation && tab.invalid,
            }"
            :style="{width: tabWidth}"
            @click="tabClick(idx)"
        >
            <span class="triangle-bg" />
            <span class="triangle" />
            <slot :name="`progress-${tab.key}`" :tab="tab">
                <span>{{ Number(idx) + 1 }}.
                    {{ labels[tab.key] || tab.key }}
                </span>
            </slot>

            <slot :name="`help-${tab.key}`" :tab="tab">
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

<script>
import _ from 'lodash';
import { ref, computed } from '@vue/composition-api';
import PTooltipButton from '@/components/organisms/buttons/tooltip-button/TooltipButton';
import PI from '@/components/atoms/icons/PI';

export default {
    name: 'PProgressTabBar',
    events: ['update:tabs', 'update:activeIdx', 'changeTabs'],
    components: {
        PTooltipButton,
        PI,
    },
    props: {
        tabs: [Array],
        labels: {
            type: Object,
            default: () => ({}),
        },
        activeIdx: {
            type: Number,
            default: 0,
        },
    },
    setup(props, { emit }) {
        const tabWidth = computed(() => `${100 / _.size(props.tabs)}%`);

        const tabClick = (idx) => {
            if (props.activeIdx !== idx) {
                emit('changeTab', idx, props.activeIdx);
                emit('update:activeIdx', idx);
            }
        };

        return {
            tabWidth,
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
        @apply bg-gray3 border-t border-b border-gray2 text-gray;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 1 1 auto;
        height: 100%;
        padding: 0;
        font-size: .875rem;
        cursor: pointer;
        &:last-child {
            @apply border-r border-gray2;
            .triangle, .triangle-bg {
                display: none;
            }
        }
        &:first-child {
            @apply border-l border-gray2;
        }
        &.active {
            @apply bg-dark border-dark text-white;
            font-size: 1rem;
            font-weight: bold;
            .triangle {
                @mixin triangle-color calc(($(height) / 2) - 1px), theme('colors.dark');
            }
            .triangle-bg {
                @mixin triangle-color calc($(height) / 2), theme('colors.dark');
            }
        }
        &.done {
            @apply border-dark bg-white;
            .triangle {
                @mixin triangle-color calc(($(height) / 2) - 1px), theme('colors.white');
            }
            .triangle-bg {
                @mixin triangle-color calc($(height) / 2), theme('colors.dark');
            }
            &.active {
                @apply bg-dark;
                .triangle {
                    @mixin triangle-color calc(($(height) / 2) - 1px), theme('colors.dark');
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
            @mixin triangle calc(($(height) / 2) - 1px), 2, theme('colors.gray3');
        }
        .triangle-bg {
            @mixin triangle calc($(height) / 2), 1, theme('colors.gray2');
        }
        .help {
            margin-left: .5rem;
        }
    }
}
</style>
