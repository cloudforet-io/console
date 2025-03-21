<script setup lang="ts">
import { computed, reactive } from 'vue';

import type { Editor } from '@tiptap/vue-2';

import {
    PDivider, PI, PIconButton, PPopover, PSelectDropdown,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import ColorPicker from '@/common/components/editor/ColorPicker.vue';

interface Props {
    editor: Editor;
    useColor: boolean;
    useTextAlign: boolean;
    useImage: boolean;
    showUndoRedoButtons: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    editor: () => ({} as Editor),
});

const TEXT_ALIGN_ICONS = {
    left: 'ic_text-align-left',
    center: 'ic_text-align-center',
    right: 'ic_text-align-right',
    justify: 'ic_text-align-justify',
};

const TEXT_STYLE_TAGS = {
    normal: 'p',
    heading1: 'h1',
    heading2: 'h2',
    heading3: 'h3',
};

const state = reactive({
    textStyleItems: computed(() => [
        { name: 'normal', label: i18n.t('COMMON.EDITOR.NORMAL_TEXT') },
        { name: 'heading1', label: i18n.t('COMMON.EDITOR.HEADING1') },
        { name: 'heading2', label: i18n.t('COMMON.EDITOR.HEADING2') },
        { name: 'heading3', label: i18n.t('COMMON.EDITOR.HEADING3') },
    ]),
    textAlignItems: computed(() => [
        { name: 'left', label: i18n.t('COMMON.EDITOR.ALIGN_LEFT') },
        { name: 'center', label: i18n.t('COMMON.EDITOR.ALIGN_CENTER') },
        { name: 'right', label: i18n.t('COMMON.EDITOR.ALIGN_RIGHT') },
        { name: 'justify', label: i18n.t('COMMON.EDITOR.ALIGN_JUSTIFY') },
    ]),
    selectedTextStyle: computed(() => {
        if (props.editor.isActive('paragraph')) return 'normal';
        if (props.editor.isActive('heading', { level: 1 })) return 'heading1';
        if (props.editor.isActive('heading', { level: 2 })) return 'heading2';
        if (props.editor.isActive('heading', { level: 3 })) return 'heading3';
        return 'normal';
    }),
    selectedTextAlign: computed(() => {
        if (props.editor.isActive({ textAlign: 'left' })) return 'left';
        if (props.editor.isActive({ textAlign: 'center' })) return 'center';
        if (props.editor.isActive({ textAlign: 'right' })) return 'right';
        if (props.editor.isActive({ textAlign: 'justify' })) return 'justify';
        return 'left';
    }),
    imagePopoverVisible: false,
});

/* Event Handlers */
const handleTextStyleSelect = (style: string) => {
    switch (style) {
    case 'normal': props.editor.chain().focus().setParagraph().run(); break;
    case 'heading1': props.editor.chain().focus().toggleHeading({ level: 1 }).run(); break;
    case 'heading2': props.editor.chain().focus().toggleHeading({ level: 2 }).run(); break;
    case 'heading3': props.editor.chain().focus().toggleHeading({ level: 3 }).run(); break;
    default: props.editor.chain().focus().setParagraph().run(); break;
    }
};
const handleTextAlignSelect = (align: string) => {
    props.editor.chain().focus().setTextAlign(align).run();
};
const handleLinkClick = () => {
    if (props.editor.isActive('link')) {
        props.editor.chain().focus().unsetLink().run();
    } else {
        const previousUrl = props.editor.getAttributes('link').href;
        // eslint-disable-next-line no-alert
        const url = window.prompt('URL', previousUrl);

        // cancelled
        if (url === null) return;

        // empty
        if (url === '') {
            props.editor
                .chain()
                .focus()
                .extendMarkRange('link')
                .unsetLink()
                .run();

            return;
        }

        // update link
        props.editor
            .chain()
            .focus()
            .extendMarkRange('link')
            .setLink({ href: url })
            .run();
    }
};
</script>

<template>
    <div class="menu-bar">
        <template v-if="props.showUndoRedoButtons">
            <p-icon-button class="menu-button"
                           style-type="transparent"
                           name="ic_arrows-uturn-left"
                           :disabled="!props.editor.can().undo()"
                           @click="props.editor.chain().focus().undo().run()"
            />
            <p-icon-button class="menu-button"
                           style-type="transparent"
                           name="ic_arrows-uturn-right"
                           :disabled="!props.editor.can().redo()"
                           @click="props.editor.chain().focus().redo().run()"
            />

            <p-divider class="menu-divider"
                       vertical
            />
        </template>

        <p-select-dropdown :selected="state.selectedTextStyle"
                           class="menu-dropdown text-style"
                           style-type="transparent"
                           :menu="state.textStyleItems"
                           @select="handleTextStyleSelect"
        >
            <template #menu-item--format="{item}">
                <component :is="TEXT_STYLE_TAGS[item.name]"
                           class="text-style-node"
                >
                    {{ item.label }}
                </component>
            </template>
        </p-select-dropdown>

        <template v-if="props.useTextAlign">
            <p-divider class="menu-divider"
                       vertical
            />

            <div class="text-align-wrapper">
                <p-select-dropdown :selected="state.selectedTextAlign"
                                   class="menu-dropdown"
                                   style-type="transparent"
                                   :menu="state.textAlignItems"
                                   @select="handleTextAlignSelect"
                >
                    <template #menu-item--format="{item}">
                        <p-i :name="TEXT_ALIGN_ICONS[item.name]" />
                        {{ item.label }}
                    </template>
                    <template #dropdown-button>
                        <p-i :name="TEXT_ALIGN_ICONS[state.selectedTextAlign]"
                             color="inherit"
                        />
                    </template>
                </p-select-dropdown>
            </div>
        </template>

        <template v-if="props.useColor">
            <p-divider class="menu-divider"
                       vertical
            />

            <color-picker class="menu-dropdown"
                          :editor="props.editor"
                          @select="props.editor.chain().focus().setColor($event).run()"
            />
        </template>

        <p-divider class="menu-divider"
                   vertical
        />

        <p-icon-button class="menu-button"
                       style-type="transparent"
                       name="ic_text-bold"
                       :class="{ 'selected': props.editor.isActive('bold') }"
                       @click="props.editor.chain().focus().toggleBold().run()"
        />
        <p-icon-button class="menu-button"
                       style-type="transparent"
                       name="ic_text-italic"
                       :class="{ 'selected': props.editor.isActive('italic') }"
                       @click="props.editor.chain().focus().toggleItalic().run()"
        />
        <p-icon-button class="menu-button"
                       style-type="transparent"
                       name="ic_text-underline"
                       :class="{ 'selected': props.editor.isActive('underline') }"
                       @click="props.editor.chain().focus().toggleUnderline().run()"
        />
        <p-icon-button class="menu-button"
                       style-type="transparent"
                       name="ic_text-strikethrough"
                       :class="{ 'selected': props.editor.isActive('strike') }"
                       @click="props.editor.chain().focus().toggleStrike().run()"
        />
        <p-icon-button class="menu-button"
                       style-type="transparent"
                       name="ic_inline-code"
                       :class="{ 'selected': props.editor.isActive('code') }"
                       :disabled="!props.editor.can().setCode()"
                       @click="props.editor.chain().focus().toggleCode().run()"
        />

        <p-divider class="menu-divider"
                   vertical
        />

        <p-icon-button class="menu-button"
                       style-type="transparent"
                       name="ic_list-bulleted-2"
                       :class="{ 'selected': props.editor.isActive('bulletList') }"
                       @click="props.editor.chain().focus().toggleBulletList().run()"
        />
        <p-icon-button class="menu-button"
                       style-type="transparent"
                       name="ic_list-numbered"
                       :class="{ 'selected': props.editor.isActive('orderedList') }"
                       @click="props.editor.chain().focus().toggleOrderedList().run()"
        />

        <p-divider class="menu-divider"
                   vertical
        />

        <p-icon-button class="menu-button"
                       style-type="transparent"
                       name="ic_link"
                       :class="{ 'selected': props.editor.isActive('link') }"
                       @click="handleLinkClick"
        />
        <p-popover v-if="props.useImage"
                   :is-visible.sync="state.imagePopoverVisible"
                   position="bottom"
        >
            <p-icon-button class="menu-button"
                           style-type="transparent"
                           name="ic_image"
                           :class="{selected: state.imagePopoverVisible}"
            />
            <template #content>
                <div class="image-popover">
                    <p>
                        {{ $t('COMMON.EDITOR.COPY_PASTE_DRAG_DROP') }}
                    </p>
                    <img src="@/assets/images/illust_insert-image.svg">
                </div>
            </template>
        </p-popover>

        <p-icon-button class="menu-button"
                       style-type="transparent"
                       name="ic_editor-code"
                       :class="{ 'selected': props.editor.isActive('codeBlock') }"
                       :disabled="!props.editor.can().setCodeBlock()"
                       @click="props.editor.chain().focus().toggleCodeBlock().run()"
        />
        <p-icon-button class="menu-button"
                       style-type="transparent"
                       name="ic_quotes"
                       :class="{ 'selected': props.editor.isActive('blockquote') }"
                       :disabled="!props.editor.can().setBlockquote()"
                       @click="props.editor.chain().focus().toggleBlockquote().run()"
        />
        <p-icon-button class="menu-button"
                       style-type="transparent"
                       name="ic_horizontal-rule"
                       :disabled="!props.editor.can().setHorizontalRule()"
                       @click="props.editor.chain().focus().setHorizontalRule().run()"
        />
    </div>
</template>

<style lang="postcss" scoped>
@import './text-editor-nodes.pcss';
.menu-bar {
    display: flex;
    flex-wrap: wrap;
    padding: 0.5rem;

    > .menu-divider {
        margin: 0.25rem 0.5rem;
    }

    .text-align-wrapper {
        @apply flex items-center;
    }

    .menu-dropdown {
        &.text-style {
            min-width: 7.5rem;
        }
    }

    .menu-button, .menu-dropdown {
        &:not(:first-of-type) {
            margin-left: 0.125rem;
        }
        &:not(:last-of-type) {
            margin-right: 0.125rem;
        }

        @mixin text-style;
        .text-style-node {
            padding: 0;
        }
    }

    /* custom design-system component - p-icon-button */
    :deep(.menu-button.p-icon-button) {
        @apply rounded text-gray-900 outline-none;

        &.disabled {
            @apply text-gray-300;
        }

        @media (hover: hover) {
            &:hover:not(.disabled) {
                @apply bg-gray-200 text-gray-900;
            }
        }

        &:active:not(.disabled), &.selected:not(.disabled) {
            @apply bg-gray-700 text-white outline-none;
        }
    }

    .image-popover {
        > p {
            line-height: 1.5;
            font-size: 0.875rem;
        }
        > img {
            margin-top: 0.75rem;
            width: 100%;
        }
    }
}
</style>
