<template>
    <div class="p-page-title">
        <p-icon-button v-if="child"
                       name="ic_back"
                       class="back-btn"
                       @click="$emit('goBack',$event)"
        />
        <div class="title-wrapper" :class="{child}">
            <h2>
                <slot name="title">
                    {{ title }}
                </slot>
            </h2>
        </div>
        <slot name="total-count">
            <template v-if="useTotalCount">
                <span v-if="useSelectedCount&&selectedCount" class="total-count">
                    &nbsp;({{ $t('COMPONENT.PAGE_TITLE.SELECTED_OF',{selectedCount,totalCount}) }})
                </span>
                <span v-else class="total-count">
                    &nbsp;({{ commaFormatter(totalCount) }})
                </span>
            </template>
        </slot>
        <div class="extra">
            <slot name="extra" />
        </div>
    </div>
</template>

<script lang="ts">
import PIconButton from '@/inputs/buttons/icon-button/PIconButton.vue';
import { commaFormatter } from '@/util/helpers';

export default {
    name: 'PPageTitle',
    components: { PIconButton },
    event: ['goBack'],
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
};
</script>
import { commaFormatter } from '@/util/helpers';

<style lang="postcss">
.p-page-title {
    @apply mb-6 flex w-full items-start;
    .back-btn {
        @apply flex-shrink-0 mr-1;
    }
    .title-wrapper {
        @apply flex flex-shrink items-start;
        overflow: hidden;
        h2 {
            @apply flex-shrink-0;
            font-weight: bold;
            font-size: 1.5rem;
            line-height: 2rem;
        }
        .icon {
            margin-left: 0.625rem;
        }
    }
    .total-count {
        font-size: 1.125rem;
        line-height: 2rem;
    }
    .extra {
        flex-shrink: 0;
        flex-grow: 1;
        display: inline-flex;
        justify-content: flex-end;
    }
}
</style>
