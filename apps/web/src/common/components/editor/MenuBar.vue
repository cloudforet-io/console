<template>
    <div class="menu-bar">
        <p-icon-button class="menu-button"
                       style-type="transparent"
                       name="ic_arrows-uturn-left"
                       :disabled="!editor.can().undo()"
                       @click="editor.chain().focus().undo().run()"
        />
        <p-icon-button class="menu-button"
                       style-type="transparent"
                       name="ic_arrows-uturn-right"
                       :disabled="!editor.can().redo()"
                       @click="editor.chain().focus().redo().run()"
        />

        <p-divider class="menu-divider"
                   vertical
        />

        <p-select-dropdown :selected="selectedTextStyle"
                           class="menu-dropdown text-style"
                           style-type="transparent"
                           :items="textStyleItems"
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

        <p-divider class="menu-divider"
                   vertical
        />

        <p-select-dropdown :selected="selectedTextAlign"
                           class="menu-dropdown"
                           style-type="transparent"
                           :items="textAlignItems"
                           @select="handleTextAlignSelect"
        >
            <template #default>
                <p-i :name="TEXT_ALIGN_ICONS[selectedTextAlign]"
                     color="inherit"
                />
            </template>
            <template #menu-item--format="{item}">
                <p-i :name="TEXT_ALIGN_ICONS[item.name]" />
                {{ item.label }}
            </template>
        </p-select-dropdown>

        <p-divider class="menu-divider"
                   vertical
        />

        <color-picker class="menu-dropdown"
                      :editor="editor"
                      @select="editor.chain().focus().setColor($event).run()"
        />

        <p-divider class="menu-divider"
                   vertical
        />

        <p-icon-button class="menu-button"
                       style-type="transparent"
                       name="ic_text-bold"
                       :class="{ 'selected': editor.isActive('bold') }"
                       @click="editor.chain().focus().toggleBold().run()"
        />
        <p-icon-button class="menu-button"
                       style-type="transparent"
                       name="ic_text-italic"
                       :class="{ 'selected': editor.isActive('italic') }"
                       @click="editor.chain().focus().toggleItalic().run()"
        />
        <p-icon-button class="menu-button"
                       style-type="transparent"
                       name="ic_text-underline"
                       :class="{ 'selected': editor.isActive('underline') }"
                       @click="editor.chain().focus().toggleUnderline().run()"
        />
        <p-icon-button class="menu-button"
                       style-type="transparent"
                       name="ic_text-strikethrough"
                       :class="{ 'selected': editor.isActive('strike') }"
                       @click="editor.chain().focus().toggleStrike().run()"
        />
        <p-icon-button class="menu-button"
                       style-type="transparent"
                       name="ic_inline-code"
                       :class="{ 'selected': editor.isActive('code') }"
                       :disabled="!editor.can().setCode()"
                       @click="editor.chain().focus().toggleCode().run()"
        />

        <p-divider class="menu-divider"
                   vertical
        />

        <p-icon-button class="menu-button"
                       style-type="transparent"
                       name="ic_list-bulleted-2"
                       :class="{ 'selected': editor.isActive('bulletList') }"
                       @click="editor.chain().focus().toggleBulletList().run()"
        />
        <p-icon-button class="menu-button"
                       style-type="transparent"
                       name="ic_list-numbered"
                       :class="{ 'selected': editor.isActive('orderedList') }"
                       @click="editor.chain().focus().toggleOrderedList().run()"
        />

        <p-divider class="menu-divider"
                   vertical
        />

        <p-icon-button class="menu-button"
                       style-type="transparent"
                       name="ic_link"
                       :class="{ 'selected': editor.isActive('link') }"
                       @click="handleLinkClick"
        />
        <p-popover v-model="imagePopoverVisible"
                   position="bottom"
        >
            <p-icon-button class="menu-button"
                           style-type="transparent"
                           name="ic_image"
                           :class="{selected: imagePopoverVisible}"
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
                       :class="{ 'selected': editor.isActive('codeBlock') }"
                       :disabled="!editor.can().setCodeBlock()"
                       @click="editor.chain().focus().toggleCodeBlock().run()"
        />
        <p-icon-button class="menu-button"
                       style-type="transparent"
                       name="ic_quotes"
                       :class="{ 'selected': editor.isActive('blockquote') }"
                       :disabled="!editor.can().setBlockquote()"
                       @click="editor.chain().focus().toggleBlockquote().run()"
        />
        <p-icon-button class="menu-button"
                       style-type="transparent"
                       name="ic_horizontal-rule"
                       :disabled="!editor.can().setHorizontalRule()"
                       @click="editor.chain().focus().setHorizontalRule().run()"
        />
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed,
    defineComponent, reactive, toRefs,
} from 'vue';

import {
    PDivider, PI, PIconButton, PPopover, PSelectDropdown,
} from '@spaceone/design-system';
import type { Editor } from '@tiptap/vue-2';

import { i18n } from '@/translations';

import ColorPicker from '@/common/components/editor/ColorPicker.vue';

interface Props {
    editor: Editor
}

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

export default defineComponent<Props>({
    name: 'MenuBar',
    components: {
        ColorPicker,
        PIconButton,
        PDivider,
        PSelectDropdown,
        PI,
        PPopover,
    },
    props: {
        editor: {
            type: Object as PropType<Editor>,
            required: true,
        },
    },
    setup(props) {
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

        return {
            ...toRefs(state),
            handleTextStyleSelect,
            handleTextAlignSelect,
            handleLinkClick,
            TEXT_ALIGN_ICONS,
            TEXT_STYLE_TAGS,
        };
    },
});
</script>

<style lang="postcss" scoped>
@import './text-editor-nodes.pcss';
.menu-bar {
    display: flex;
    flex-wrap: wrap;
    padding: 0.5rem;

    > .menu-divider {
        margin: 0.25rem 0.5rem;
    }

    .menu-button, .menu-dropdown {
        &:not(:first-of-type) {
            margin-left: 0.125rem;
        }
        &:not(:last-of-type) {
            margin-right: 0.125rem;
        }
        &.text-style {
            width: 110px;
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

    /* custom design-system component - p-select-dropdown */
    :deep(.menu-dropdown.p-select-dropdown:not(.invalid):not(.disabled):not(.read-only).transparent) {
        > .dropdown-button {
            @apply rounded text-gray-900 outline-none;
            padding-left: 0.5rem;

            @media (hover: hover) {
                &:hover {
                    @apply bg-gray-200 text-gray-900;
                }
            }

            &:active, &.selected {
                @apply bg-gray-700 text-white outline-none;
            }
        }
        &.active > .dropdown-button {
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
