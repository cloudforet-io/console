<template>
    <div class="p-page-title">
        <p-icon-button v-if="child"
                       name="ic_back"
                       class="back-btn"
                       @click="$emit('goBack',$event)"
        />
        <div class="title-wrapper" :class="{child}">
            <slot name="title">
                {{ title }}
            </slot>
            <slot name="title-info">
                <template v-if="titleInfo">
                    <p-i name="ic_outlined-info" color="inherit" width="0.875rem"
                         height="0.875rem"
                         class="icon"
                    />
                    <span class="title-info">{{ titleInfo }}</span>
                </template>
            </slot>
        </div>
        <slot name="total-count">
            <template v-if="useTotalCount">
                <span v-if="useSelectedCount&&selectedCount" class="total-count">
                    &nbsp;({{ $t('COMPONENT.PAGE_TITLE.SELECTED_OF',{selectedCount,totalCount}) }})
                </span>
                <span v-else class="total-count">
                    &nbsp;({{ totalCount }})
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
import PI from '@/foundation/icons/PI.vue';

export default {
    name: 'PPageTitle',
    components: { PIconButton, PI },
    event: ['goBack'],
    props: {
        title: {
            type: String,
            default: 'Page',
        },
        titleInfo: {
            type: String,
            default: null,
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
};
</script>

<style lang="postcss">
.p-page-title {
    @apply mb-6 flex w-full items-start;
    .back-btn {
        @apply flex-shrink-0 mr-1;
    }
    .title-wrapper {
        @apply flex-shrink;
        font-weight: bold;
        font-size: 1.5rem;
        line-height: 2rem;
        overflow: hidden;
        vertical-align: middle;
        .icon {
            margin-left: 0.625rem;
        }
        .title-info {
            @apply font-normal text-gray-700;
            font-size: 0.75rem;
            line-height: 150%;
            margin-left: 0.25rem;
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
