<template>
    <div class="p-heading"
         :class="`heading-${headingType}`"
    >
        <span v-if="showBackButton"
              class="back-button"
        >
            <p-icon-button name="ic_arrow-left"
                           @click="$emit('click-back-button',$event)"
            />
        </span>
        <slot name="title-left-extra" />
        <h2 :class="{
            'has-left': !!$slots['title-left-extra'],
            'has-right': useTotalCount || !!$slots['title-right-extra']}"
        >
            <slot>
                <slot name="title">
                    {{ title.length ? title : '&zwnj;' }}
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
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { defineComponent } from 'vue';

import type { TranslateResult } from 'vue-i18n';

import PIconButton from '@/controls/buttons/icon-button/PIconButton.vue';
import type { HeadingType } from '@/data-display/heading/config';
import { HEADING_TYPE } from '@/data-display/heading/config';
import { commaFormatter } from '@/utils/helpers';

export default defineComponent({
    name: 'PHeading',
    components: { PIconButton },
    props: {
        title: {
            type: String as PropType<TranslateResult>,
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
    vertical-align: middle;
    > .back-button {
        display: inline-flex;
        line-height: 2rem;
        margin-right: 0.25rem;
    }
    > h2 {
        @apply text-2xl;

        /* NOTE: display: inline; is required */

        display: inline;
        word-break: break-word;
        line-height: 1.875rem;
        &.has-left {
            margin-left: 0.5rem;
        }
    }
    > .total-count {
        font-size: 1.125rem;
        line-height: 2rem;
        font-weight: normal;
        margin-right: 0.5rem;
        vertical-align: sub;
    }
    &.heading-main {
        width: 100%;
        > h2 {
            font-weight: bold;
            &.has-right {
                margin-right: 0.5rem;
            }
        }
        > .total-count {
            @apply text-gray-900;
        }
    }
    &.heading-sub {
        > h2 {
            &.has-right {
                margin-right: 0.125rem;
            }
        }
        > .total-count {
            @apply text-gray-500;
        }
    }
}
</style>
