<template>
    <div class="menu-bar">
        <p-icon-button class="menu-button" style-type="transparent" name="ic_undo"
                       @click="handleUndoClick"
        />
        <p-icon-button class="menu-button" style-type="transparent" name="ic_redo"
                       @click="handleRedoClick"
        />
        <p-divider class="menu-divider" vertical />
        <p-select-dropdown v-model="selectedTextStyle" class="menu-dropdown" style-type="transparent"
                           index-mode
                           :items="textStyleItems"
                           @select="handleTextStyleSelect"
        >
            <template #menu-item--format="{item}">
                <span class="text-style-node">{{ item.label }}</span>
            </template>
        </p-select-dropdown>
        <p-divider class="menu-divider" vertical />
        <p-select-dropdown v-model="selectedTextAlign" class="menu-dropdown" style-type="transparent"
                           :items="textAlignItems"
                           index-mode
                           @select="handleTextAlignSelect"
        >
            <template #default>
                <p-i :name="textAlignItems[selectedTextAlign].icon" color="inherit" />
            </template>
            <template #menu-item--format="{item}">
                <p-i :name="item.icon" />
                {{ item.label }}
            </template>
        </p-select-dropdown>
        <p-divider class="menu-divider" vertical />
        <color-picker class="menu-dropdown" @select="handleTextColorSelect" />
        <p-divider class="menu-divider" vertical />
        <p-icon-button class="menu-button" style-type="transparent" name="ic_text-bold"
                       @click="handleTextBoldClick"
        />
        <p-icon-button class="menu-button" style-type="transparent" name="ic_text-italic"
                       @click="handleTextItalicClick"
        />
        <p-icon-button class="menu-button" style-type="transparent" name="ic_text-underline"
                       @click="handleTextUnderlineClick"
        />
        <p-icon-button class="menu-button" style-type="transparent" name="ic_text-strikethrough"
                       @click="handleTextStrikethroughClick"
        />
        <p-icon-button class="menu-button" style-type="transparent" name="ic_inline-code"
                       @click="handleInlineCodeClick"
        />
        <p-divider class="menu-divider" vertical />
        <p-icon-button class="menu-button" style-type="transparent" name="ic_list-bulleted"
                       @click="handleBulletListClick"
        />
        <p-icon-button class="menu-button" style-type="transparent" name="ic_list-numbered"
                       @click="handleNumberListClick"
        />
        <p-divider class="menu-divider" vertical />
        <p-icon-button class="menu-button" style-type="transparent" name="ic_link"
                       @click="handleLinkClick"
        />
        <p-icon-button class="menu-button" style-type="transparent" name="ic_image"
                       @click="handleImageClick"
        />
        <p-icon-button class="menu-button" style-type="transparent" name="ic_editor-code"
                       @click="handleCodeBlockClick"
        />
        <p-icon-button class="menu-button" style-type="transparent" name="ic_quotes"
                       @click="handleQuotesClick"
        />
        <p-icon-button class="menu-button" style-type="transparent" name="ic_horizontal-rule"
                       @click="handleHorizontalRuleClick"
        />
    </div>
</template>

<script lang="ts">
import type { PropType } from '@vue/composition-api';
import {
    computed,
    defineComponent, reactive, toRefs,
} from '@vue/composition-api';

import {
    PDivider, PI, PIconButton, PSelectDropdown,
} from '@spaceone/design-system';
import type { Editor } from '@tiptap/vue-2';

import ColorPicker from '@/common/components/editor/ColorPicker.vue';


interface Props {
    editor: Editor|null
}


export default defineComponent<Props>({
    name: 'MenuBar',
    components: {
        ColorPicker,
        PIconButton,
        PDivider,
        PSelectDropdown,
        PI,
    },
    props: {
        editor: {
            type: Object as PropType<Editor|null>,
            default: null,
        },
    },
    setup() {
        const state = reactive({
            textStyleItems: computed(() => [
                // song-lang
                { name: 'normal', label: 'Normal text' },
                { name: 'heading1', label: 'Heading 1' },
                { name: 'heading2', label: 'Heading 2' },
                { name: 'heading3', label: 'Heading 3' },
            ]),
            textAlignItems: computed(() => [
                // song-lang
                { name: 'left', label: 'Left', icon: 'ic_text-align-left' },
                { name: 'center', label: 'Center', icon: 'ic_text-align-center' },
                { name: 'right', label: 'Right', icon: 'ic_text-align-right' },
                { name: 'justify', label: 'Justify', icon: 'ic_text-align-justify' },
            ]),
            selectedTextStyle: 0,
            selectedTextAlign: 0,
        });

        /* Event Handlers */

        // history
        const handleUndoClick = () => {};
        const handleRedoClick = () => {};

        // text style
        const handleTextStyleSelect = () => {};

        // text align
        const handleTextAlignSelect = () => {};

        // set color
        const handleTextColorSelect = () => {};

        // formatting
        const handleTextBoldClick = () => {};
        const handleTextItalicClick = () => {};
        const handleTextUnderlineClick = () => {};
        const handleTextStrikethroughClick = () => {};
        const handleInlineCodeClick = () => {};

        // list
        const handleBulletListClick = () => {};
        const handleNumberListClick = () => {};

        // etc
        const handleLinkClick = () => {};
        const handleImageClick = () => {};
        const handleCodeBlockClick = () => {};
        const handleQuotesClick = () => {};
        const handleHorizontalRuleClick = () => {};

        return {
            ...toRefs(state),
            handleUndoClick,
            handleRedoClick,
            handleTextStyleSelect,
            handleTextAlignSelect,
            handleTextColorSelect,
            handleTextBoldClick,
            handleTextItalicClick,
            handleTextUnderlineClick,
            handleTextStrikethroughClick,
            handleInlineCodeClick,
            handleBulletListClick,
            handleNumberListClick,
            handleLinkClick,
            handleImageClick,
            handleCodeBlockClick,
            handleQuotesClick,
            handleHorizontalRuleClick,
        };
    },
});
</script>

<style lang="postcss" scoped>
.menu-bar {
    display: flex;
    flex-wrap: wrap;
    padding: 0.5rem;

    > .menu-divider {
        margin: 0.25rem 0.5rem;
    }

    > .menu-button, .menu-dropdown {
        &:not(:first-of-type) {
            margin-left: 0.125rem;
        }
        &:not(:last-of-type) {
            margin-right: 0.125rem;
        }
    }

    /* custom design-system component - p-icon-button */
    > .menu-button.p-icon-button::v-deep {
        @apply rounded text-gray-900 outline-none;

        @media (hover: hover) {
            &:hover {
                @apply bg-gray-200 text-gray-900;
            }
        }

        &:active, &.selected {
            @apply bg-gray-700 text-white outline-none;
        }
    }

    /* custom design-system component - p-select-dropdown */
    > .menu-dropdown.p-select-dropdown:not(.invalid):not(.disabled):not(.read-only).transparent::v-deep {
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
}
</style>
