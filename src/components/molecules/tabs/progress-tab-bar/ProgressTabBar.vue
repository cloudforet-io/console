<template>
    <div class="progress-tab-nav">
        <div
            v-for="(tab, idx) in tabs"
            :key="tab.key"
            class="nav-item"
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
                    {{ tab.label || tab.key }}
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

<style lang="scss" scoped>
$height: 2.5rem;
@mixin triangle-color($size, $color) {
    border-left: $size solid $color;
}
@mixin triangle($size, $z-idx, $color) {
    position: absolute;
    right: calc(#{$size} * -1);
    z-index: $z-idx;
    width: 0;
    height: 0;
    border-top: $size solid transparent;
    border-bottom: $size solid transparent;
    @include triangle-color($size, $color);
}

.progress-tab-nav {
    display: flex;
    width: 100%;
    height: $height;
    align-items: center;
    justify-content: center;
    .nav-item {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 1 1 auto;
        height: 100%;
        padding: 0;
        background-color: $gray3;
        border-top: 1px solid $gray2;
        border-bottom: 1px solid $gray2;
        color: $gray;
        font-size: .875rem;
        cursor: pointer;
        &:last-child {
            border-right: 1px solid $gray2;
            .triangle, .triangle-bg {
                display: none;
            }
        }
        &:first-child {
            border-left: 1px solid $gray2;
        }
        &.active {
            background-color: $dark;
            border-color: $dark;
            color: $white;
            font-size: 1rem;
            font-weight: bold;
            .triangle {
                @include triangle-color(calc((#{$height} / 2) - 1px), $dark);
            }
            .triangle-bg {
                @include triangle-color(calc(#{$height} / 2), $dark);
            }
        }
        &.done {
            border-color: $dark;
            background-color: $white;
            .triangle {
                @include triangle-color(calc((#{$height} / 2) - 1px), $white);
            }
            .triangle-bg {
                @include triangle-color(calc(#{$height} / 2), $dark);
            }
            &.active {
                background-color: $dark;
                .triangle {
                    @include triangle-color(calc((#{$height} / 2) - 1px), $dark);
                }
            }
        }
        &.invalid {
            font-style: italic;
            border-color: $alert;
            background-color: $white;
            .triangle {
                @include triangle-color(calc((#{$height} / 2) - 1px), $white);
            }
            .triangle-bg {
                @include triangle-color(calc(#{$height} / 2), $alert);
            }
            &.active {
                background-color: $alert;
                border-color: $alert;
                .triangle {
                    @include triangle-color(calc((#{$height} / 2) - 1px), $alert);
                }
            }
        }
        .triangle {
            @include triangle(calc((#{$height} / 2) - 1px), 2, $gray3);
        }
        .triangle-bg {
            @include triangle(calc(#{$height} / 2), 1, $gray2);
        }
        .help {
            margin-left: .5rem;
        }
    }
}
</style>
