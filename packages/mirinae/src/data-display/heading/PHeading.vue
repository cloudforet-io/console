<template>
    <div class="p-heading"
         :class="`heading-${headingType}`"
    >
        <div class="heading-wrapper">
            <span v-if="showBackButton"
                  class="back-button"
            >
                <p-icon-button name="ic_arrow-left"
                               @click="handleClickBackButton"
                />
            </span>
            <slot name="title-left-extra" />
            <h2 :class="{'has-left': !!slots['title-left-extra'], 'has-right': useTotalCount || !!slots['title-right-extra']}">
                <slot>
                    <slot name="title">
                        <!--&zwnj: Added to prevent style bugs if title does not exist-->
                        <span class="title">{{ title.length ? title : '&zwnj;' }}</span>
                    </slot>
                </slot>
            </h2>
            <slot v-if="useTotalCount"
                  name="total-count"
            >
                <span v-if="useSelectedCount && selectedCount"
                      class="total-count"
                >({{ t('COMPONENT.PAGE_TITLE.SELECTED_OF',{ selectedCount, totalCount }) }})</span>
                <span v-else
                      class="total-count"
                >({{ commaFormatter(totalCount) }})</span>
            </slot>
            <slot name="title-right-extra" />
        </div>
        <div v-if="slots['extra']"
             class="extra"
        >
            <slot name="extra" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { useSlots } from 'vue';
import { useI18n } from 'vue-i18n';

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<Props>(), {
    title: 'Page',
    headingType: HEADING_TYPE.MAIN,
    showBackButton: false,
    useTotalCount: false,
    useSelectedCount: false,
    totalCount: 0,
    selectedCount: 0,
});

const emit = defineEmits(['click-back-button']);
const { t } = useI18n();
const slots = useSlots();

const handleClickBackButton = (e: MouseEvent) => {
    emit('click-back-button', e);
};

</script>

<style lang="postcss">
.p-heading {
    gap: 0.5rem;
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
                @apply text-gray-900;
            }
        }
    }
    &.heading-sub {
        display: flex;
        align-items: center;
        line-height: 2rem;
        margin: 2rem 1rem 1rem;
        > .heading-wrapper {
            line-height: 1.2;
            > .total-count {
                @apply text-gray-500;
                padding-left: 0.125rem;
                font-weight: normal;
            }
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

    @screen mobile {
        flex-wrap: wrap;
    }
}
</style>
