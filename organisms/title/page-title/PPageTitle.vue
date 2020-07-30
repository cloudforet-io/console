<template>
    <div class="p-page-title">
        <p-icon-button v-if="child" width="2rem" height="2rem"
                       name="ic_back"
                       @click="$emit('goBack',$event)"
                       class="mr-1"
        />
        <div class="title" :class="{child}">
            <slot name="before-title" />
            <slot name="title">
                {{ title }}
            </slot>
            <slot name="title-area" />
        </div>
        <div class="extra">
            <slot name="extra">
                <template v-if="useTotalCount">
                    <span v-if="useSelectedCount&&selectedCount">
                        &nbsp;({{ $t('ACTION.SELECTED_OF',{selectedCount,totalCount}) }})
                    </span>
                    <span v-else>
                        &nbsp;({{ totalCount }})
                    </span>
                </template>
                <slot name="extra-area" />
            </slot>
        </div>
    </div>
</template>

<script lang="ts">
import PIconButton from '@/components/molecules/buttons/icon-button/PIconButton.vue';

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
};
</script>

<style lang="postcss" scoped>
    .p-page-title{
        @apply mb-6 inline-flex content-start items-center;
        .title{
            @apply font-bold;
            font-size: 1.5rem;
            line-height: 120%;
            &.child{
                font-size: 1.5rem;
            }
        }
        .extra{
            @apply font-normal text-lg;
        }

    }

</style>
