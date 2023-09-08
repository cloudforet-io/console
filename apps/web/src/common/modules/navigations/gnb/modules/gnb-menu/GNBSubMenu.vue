<template>
    <p-tooltip v-if="show"
               :contents="isEllipsisActive() ? label : undefined"
               position="bottom"
    >
        <router-link class="gnb-sub-menu"
                     :to="href ? {} : to"
                     custom
        >
            <template #default="{href: toHref, navigate}">
                <span>
                    <a class="gnb-sub-contents"
                       :href="href ? href : toHref"
                       :target="href ? '_blank' : undefined"
                       @click.stop="handleClickAnchor(navigate, $event)"
                    >
                        <div class="contents-left"
                             :class="{ 'is-exist-extra-mark': $slots['extra-mark'] }"
                        >
                            <p-i v-if="isDraggable"
                                 name="ic_drag-handle"
                                 width="1rem"
                                 height="1rem"
                                 class="drag-icon"
                            />
                            <div ref="labelRef"
                                 class="label"
                            >
                                {{ label }}
                            </div>
                            <beta-mark v-if="higlightTag === 'beta'" />
                            <new-mark v-else-if="higlightTag === 'new'" />
                        </div>
                        <div class="contents-right">
                            <slot name="extra-mark" />
                        </div>
                    </a>
                </span>
            </template>
        </router-link>
    </p-tooltip>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    defineComponent, reactive, toRefs,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import type { Route } from 'vue-router';

import { PI, PTooltip } from '@spaceone/design-system';

import type { HighlightTagType } from '@/store/modules/display/type';

import BetaMark from '@/common/components/marks/BetaMark.vue';
import NewMark from '@/common/components/marks/NewMark.vue';

interface Props {
    show?: boolean;
    label: string|undefined|TranslateResult;
    to?: Route;
    href?: string;
    isDraggable?: boolean;
    higlightTag?: HighlightTagType;
}

export default defineComponent<Props>({
    name: 'GNBSubMenu',
    components: {
        NewMark, BetaMark, PI, PTooltip,
    },
    props: {
        show: {
            type: Boolean,
            default: true,
        },
        to: {
            type: Object,
            default: () => ({}),
        },
        href: {
            type: String,
            default: undefined,
        },
        label: {
            type: String as PropType<string|undefined|TranslateResult>,
            default: '',
        },
        higlightTag: {
            type: String as PropType<HighlightTagType>,
            default: undefined,
        },
        isDraggable: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            labelRef: null as HTMLElement|null,
        });
        const isEllipsisActive = () => {
            if (state.labelRef) {
                return (state.labelRef?.offsetWidth < state.labelRef?.scrollWidth);
            } return false;
        };

        const handleClickAnchor = (navigateFn, event: Event) => {
            if (!props.href) navigateFn(event);
            emit('navigate');
        };

        return {
            ...toRefs(state),
            isEllipsisActive,
            handleClickAnchor,
        };
    },
});
</script>

<style lang="postcss" scoped>
.gnb-sub-menu {
    .gnb-sub-contents {
        @apply text-gray-900 rounded flex items-center justify-between;
        position: relative;
        width: 100%;
        height: 2rem;
        font-size: 0.875rem;
        line-height: 1rem;
        text-decoration: none;
        white-space: nowrap;
        cursor: pointer;
        padding: 0.5rem;
        &:hover, &:focus {
            @apply bg-violet-100 text-violet-600;
        }
        &selected {
            @apply text-violet-600;
            background-color: unset;
        }
        &:active {
            @apply bg-white;
        }

        .contents-left {
            @apply flex items-center;
            width: 100%;
            .label {
                @apply truncate;
                display: inline-block;
                width: 100%;
                line-height: 1.25;
            }
        }
        .is-exist-extra-mark {
            width: 80%;
        }
    }
}
</style>
