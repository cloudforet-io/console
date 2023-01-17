<template>
    <div class="p-page-title">
        <div class="title-wrapper">
            <span v-if="child"
                  class="back-btn"
            >
                <p-icon-button name="ic_back"
                               @click="$emit('goBack',$event)"
                />
            </span>
            <slot name="title-left-extra" />
            <h2 :class="{'has-left': !!$slots['title-left-extra'], 'has-right': useTotalCount || !!$slots['title-right-extra']}">
                <slot>
                    <slot name="title">
                        <span>{{ title }}&zwnj;</span>
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
import { defineComponent } from 'vue';

import PIconButton from '@/inputs/buttons/icon-button/PIconButton.vue';
import { commaFormatter } from '@/utils/helpers';

interface Props {
    title?: string;
    child?: boolean;
    useTotalCount?: boolean;
    useSelectedCount?: boolean;
    totalCount?: number;
    selectedCount?: number;
}

export default defineComponent<Props>({
    name: 'PPageTitle',
    components: { PIconButton },
    props: {
        title: {
            type: String,
            default: 'Page',
        },
        child: {
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
.p-page-title {
    @apply mb-6 flex w-full items-start;
    > .title-wrapper {
        line-height: 2rem;
        vertical-align: middle;
        flex-grow: 99;
        > .back-btn {
            @apply mr-1;
            display: inline-flex;
            line-height: inherit;
        }
        > h2 {
            display: inline;
            font-weight: bold;
            font-size: 1.5rem;
            line-height: inherit;
            word-break: break-all;
            &.has-left {
                margin-left: 0.5rem;
            }
            &.has-right {
                margin-right: 0.5rem;
            }
        }
        > .total-count {
            font-size: 1.125rem;
            line-height: inherit;
            margin-right: 0.5rem;
        }
    }
    > .extra {
        flex-grow: 1;
        margin-left: 0.5rem;
    }
}
</style>
