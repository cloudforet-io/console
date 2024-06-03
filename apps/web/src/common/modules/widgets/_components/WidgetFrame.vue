<script setup lang="ts">
import { onClickOutside } from '@vueuse/core/index';
import {
    reactive, computed, ref,
} from 'vue';

import {
    PI, PIconButton, PContextMenu, useContextMenuController,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { WIDGET_SIZE } from '@/schema/dashboard/_constants/widget-constant';
import { i18n } from '@/translations';

import type { WidgetFrameProps } from '@/common/modules/widgets/types/widget-frame-type';


const props = withDefaults(defineProps<WidgetFrameProps>(), {
    title: undefined,
    size: WIDGET_SIZE.full,
    width: undefined,
    widgetLink: undefined,
    widgetLocation: undefined,
    dateRange: () => ({ start: undefined, end: undefined }),
    noData: false,
    currency: undefined,
    theme: undefined,
});
const emit = defineEmits<{(event: 'click-delete'): void;
    (event: 'click-edit'): void;
}>();

const state = reactive({
    isFull: computed<boolean>(() => props.size === WIDGET_SIZE.full),
    etcDropdownMenuItems: computed<MenuItem[]>(() => ([
        {
            type: 'item',
            name: 'expandAndEdit',
            label: i18n.t('Expand & Edit'),
        },
        {
            type: 'item',
            name: 'fullData',
            label: i18n.t('Full Data'),
            link: props.widgetLink,
        },
    ])),
});
const contextMenuRef = ref<any|null>(null);
const targetRef = ref<HTMLElement | null>(null);
const {
    visibleMenu: visibleContextMenu,
    contextMenuStyle,
    hideContextMenu,
    toggleContextMenu,
} = useContextMenuController({
    targetRef,
    contextMenuRef,
    useFixedStyle: true,
    position: 'right',
    menu: state.etcDropdownMenuItems,
});
onClickOutside(targetRef, hideContextMenu);

/* Event */
const handleEditButtonClick = () => {
    emit('click-edit');
};
const handleClickDeleteButton = () => {
    emit('click-delete');
};
const handleClickEtcButton = () => {
    toggleContextMenu();
};
const handleSelectEtc = (item: MenuItem) => {
    if (item.name === 'expandAndEdit') {
        emit('click-edit');
    } else if (item.name === 'fullData') {
        window.open(props.widgetLink, '_blank');
    }
};
</script>

<template>
    <div class="widget-frame"
         :class="{ full: state.isFull, 'show-etc': visibleContextMenu }"
         :style="{ width: (props.width && !state.isFull) ? `${props.width}px` : '100%'}"
    >
        <div class="widget-header">
            <h3 class="title">
                {{ props.title }}
            </h3>
            <div class="metadata-wrapper">
                <p-i name="ic_info-circle"
                     width="1rem"
                     height="1rem"
                />
                <span class="metadata-text">Metadata</span>
                <div class="metadata-content">
                    Metadata
                </div>
            </div>
        </div>
        <p-icon-button ref="targetRef"
                       name="ic_ellipsis-horizontal"
                       shape="square"
                       class="etc-button"
                       @click="handleClickEtcButton"
        />
        <p-context-menu v-show="visibleContextMenu"
                        ref="contextMenuRef"
                        :style="contextMenuStyle"
                        :menu="state.etcDropdownMenuItems"
                        @select="handleSelectEtc"
        />
        <div v-if="props.editMode"
             class="action-button-wrapper"
        >
            <p-icon-button name="ic_edit"
                           style-type="transparent"
                           size="sm"
                           @click="handleEditButtonClick"
            />
            <p-icon-button name="ic_delete"
                           style-type="transparent"
                           size="sm"
                           @click="handleClickDeleteButton"
            />
        </div>
        <div class="body">
            <slot />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.widget-frame {
    position: relative;
    height: 22.5rem;

    @apply rounded-lg bg-white;
    border-color: theme('colors.gray.200');
    display: inline-flex;
    flex-direction: column;
    padding: 1rem;
    &:hover, &.show-etc {
        .etc-button {
            display: block;
        }
    }

    .widget-header {
        display: flex;
        align-items: center;
        padding-bottom: 0.5rem;
        .title {
            @apply truncate text-label-md;
            overflow: hidden;
            text-overflow: ellipsis;
            display: block;
            -webkit-box-orient: vertical;
            font-weight: 500;
        }
        .metadata-wrapper {
            @apply text-gray-700;
            display: flex;
            align-items: center;
            padding-left: 0.75rem;
            &:hover {
                .metadata-content {
                    display: block;
                }
            }
            .metadata-text {
                @apply text-label-sm;
                padding-left: 0.25rem;
            }
            .metadata-content {
                @apply bg-white border rounded-lg border-gray-200;
                position: absolute;
                top: 2.25rem;
                display: none;
                padding: 1.25rem 1rem;
            }
        }
    }
    .etc-button {
        position: absolute;
        top: 0.5rem;
        right: 1rem;
        display: none;
    }
    .p-context-menu {
        z-index: 100;
    }
    .action-button-wrapper {
        @apply bg-gray-150 rounded-lg;
        position: absolute;
        right: 0.25rem;
        top: 0.25rem;
        padding: 0.25rem;
    }
    .body {
        height: auto;
        overflow-y: auto;
        flex: 1 1;
        padding: 0 1.5rem;
    }
}
</style>
