<template>
    <div class="p-heading"
         :class="`heading-${headingType}`"
    >
        <div class="heading-wrapper">
            <span v-if="showBackButton"
                  class="back-button"
            >
                <p-icon-button name="ic_arrow-left"
                               @click="$emit('click-back-button',$event)"
                />
            </span>
            <slot name="title-left-extra" />
            <h2 :class="{'has-left': !!$slots['title-left-extra'], 'has-right': useTotalCount || !!$slots['title-right-extra']}">
                <slot>
                    <slot name="title">
                        <span class="title">{{ title }}&zwnj;</span>
                    </slot>
                </slot>
            </h2>
            <slot v-if="useTotalCount"
                  name="total-count"
            >
                <span v-if="useSelectedCount && selectedCount"
                      class="total-count"
                >({{ $t('COMPONENT.PAGE_TITLE.SELECTED_OF',{ selectedCount, totalCount }) }})</span>
                <span v-else
                      class="total-count"
                >({{ commaFormatter(totalCount) }})</span>
            </slot>
            <slot name="title-right-extra" />
        </div>
        <div v-if="$slots['extra']"
             class="extra"
        >
            <slot name="extra" />
        </div>
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { defineComponent } from 'vue';

import type { HeadingType } from '@/data-display/heading/config';
import { HEADING_TYPE } from '@/data-display/heading/config';
import PIconButton from '@/inputs/buttons/icon-button/PIconButton.vue';
import { commaFormatter } from '@/utils/helpers';

interface Props {
    title?: string;
    headingType?: string;
    showBackButton?: boolean;
    useTotalCount?: boolean;
    useSelectedCount?: boolean;
    totalCount?: number;
    selectedCount?: number;
}

export default defineComponent<Props>({
    name: 'PHeading',
    components: { PIconButton },
    props: {
        title: {
            type: String,
            default: 'Page',
        },
        headingType: {
            type: String as PropType<HeadingType>,
            default: HEADING_TYPE.MAIN,
        },
        showBackButton: {
            type: Boolean,
            default: false,
        },
        useTotalCount: {
            type: Boolean,
            default: false,
        },
        useSelectedCount: {
            type: Boolean,
            default: false,
        },
        totalCount: {
            type: Number,
            default: 0,
        },
        selectedCount: {
            type: Number,
            default: 0,
        },
    },
    setup() {
        return {
            commaFormatter,
        };
    },
});
</script>

<style lang="postcss">
.p-heading {
    &.heading-main {
        display: flex;
        align-items: flex-start;
        width: 100%;
        margin-bottom: 1.5rem;
        > .heading-wrapper {
            > h2 {
                font-weight: bold;
                &.has-right {
                    margin-right: 0.5rem;
                }
            }
            > .total-count {
                font-weight: bold;

                @apply text-gray-900;
            }
        }
        > .extra {
            margin-left: 0.5rem;
        }
    }
    &.heading-sub {
        display: flex;
        align-items: center;
        height: 2rem;
        margin: 2rem 1rem 1rem 1rem;
        > .heading-wrapper {
            line-height: 1.2;
            > .total-count {
                @apply text-gray-500;
                padding-left: 0.125rem;
            }
        }
        > .extra {
            padding-left: 1rem;
        }
    }
    > .heading-wrapper {
        line-height: 2rem;
        vertical-align: middle;
        flex-grow: 99;
        > .back-button {
            display: inline-flex;
            line-height: inherit;
            margin-right: 0.25rem;
        }
        > h2 {
            @apply text-2xl;
            display: inline;
            word-break: break-all;
            &.has-left {
                margin-left: 0.5rem;
            }
        }
        > .total-count {
            font-size: 1.125rem;
            line-height: inherit;
            font-weight: normal;
            margin-right: 0.5rem;
        }
    }
    > .extra {
        flex-grow: 1;
    }
}
</style>
