import type { Ref } from 'vue';
import {
    reactive, ref, onMounted, onUnmounted, computed,
} from 'vue';

import { debounce, throttle } from 'lodash';

import { useIgnoreWindowArrowKeydownEvents } from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

const POPUP_MIN_WIDTH = 200;
const POPUP_PAD = 1;

export const useMention = ({
    containerRef,
    contentEditableDivRef,
    menuRef,
    onKeydownEnter,
}: {
    containerRef: Ref<HTMLElement | null>;
    contentEditableDivRef: Ref<HTMLDivElement | null>;
    menuRef: Ref<any | null>; // HACK: any type is used to avoid type issue with Vue2 and Vue3 in mirinae. It is PContextMenu originally.
    onKeydownEnter?: (e: KeyboardEvent) => void;
}) => {
    const contents = ref('');
    const keyword = ref<string>('');
    const mentionTriggerIndex = ref(-1);
    const showSuggestions = ref(false);
    const popupPosition = reactive({ top: 0, left: 0, width: undefined as number|undefined });
    const getRawContents = () => {
        const contentsEl = contentEditableDivRef.value;
        if (!contentsEl) return '';
        let txt = '';
        contentsEl.childNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                txt += node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const el = node as HTMLElement;
                if (el.classList.contains('mention')) {
                    txt += `${el.dataset.userId}`;
                } else {
                    txt += el.textContent;
                }
            }
        });
        return txt;
    };
    let hiddenDiv: HTMLDivElement|null = null;
    const calculatePopupPosition = () => {
        const contentsEl = contentEditableDivRef.value;
        if (!contentsEl || !hiddenDiv) return;

        // initialize hidden div
        hiddenDiv.textContent = '';

        // append a text node before caret position
        const beforeCaretTextNode = document.createTextNode(contents.value.slice(0, mentionTriggerIndex.value));
        hiddenDiv.appendChild(beforeCaretTextNode);

        // append a span element to calculate caret position
        const caretSpanEl = hiddenDiv.children[0] ?? document.createElement('span');
        caretSpanEl.textContent = `@${keyword.value}`;
        hiddenDiv.appendChild(caretSpanEl);

        // append a text node after caret position
        const afterCaretTextNode = document.createTextNode(contents.value.slice(mentionTriggerIndex.value + caretSpanEl.textContent.length));
        hiddenDiv.appendChild(afterCaretTextNode);

        // sync scroll of hidden div with textarea to calculate caret position
        syncScroll();

        // calculate popup position
        const contentsRect = contentsEl.getBoundingClientRect();
        const caretRect = caretSpanEl.getBoundingClientRect();
        const caretBottom = caretRect.bottom > contentsRect.bottom ? contentsRect.bottom : caretRect.bottom;
        popupPosition.top = caretBottom - contentsRect.top;
        popupPosition.left = caretRect.left - contentsRect.left - POPUP_PAD;

        // calculate width of popup
        let width = contentsRect.width - (caretRect.left - contentsRect.left);
        if (width <= POPUP_MIN_WIDTH) {
            const diff = POPUP_MIN_WIDTH - width;
            popupPosition.left -= diff;
            width = POPUP_MIN_WIDTH;
        }
        popupPosition.width = width;
    };

    const getCaretOffset = (contentsEl: HTMLDivElement) => {
        let caretOffset = 0;
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(contentsEl);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }
        return caretOffset;
    };
    const detectMention = debounce(() => {
        const contentsEl = contentEditableDivRef.value;
        if (!contentsEl) return;

        const cursorPosition = getCaretOffset(contentsEl);
        const textBeforeCursor = contentsEl.textContent?.slice(0, cursorPosition) ?? '';
        const mentionMatch = /@([\p{L}\p{N}_]*)$/u.exec(textBeforeCursor);
        if (mentionMatch) {
            mentionTriggerIndex.value = mentionMatch.index;
            keyword.value = mentionMatch[1];
            showSuggestions.value = true;
            calculatePopupPosition();
            syncScroll();
        } else {
            clearMention();
        }
    }, 200);

    let lastKeyPressed = '';
    const handleInput = (e: InputEvent) => {
    // Ignore arrow key events when suggestions are shown
        if (showSuggestions.value && (lastKeyPressed === 'ArrowDown' || lastKeyPressed === 'ArrowUp')) {
            const selection = window.getSelection();
            const range = selection?.getRangeAt(0);

            if (!range) return;

            // Get the current text node and its content
            const textNode = range.startContainer;
            const textContent = textNode.textContent || '';

            // Remove the keyword and prepare for mention insertion
            const mentionText = `@${keyword.value}`;
            const lastAtIndex = textContent.lastIndexOf('@');
            const beforeMention = textContent.slice(0, lastAtIndex);
            const afterMention = textContent.slice(range.endOffset);
            textNode.textContent = beforeMention + mentionText + afterMention;
            // Move the cursor to the space after the mention
            const afterCursorPosition = beforeMention.length + mentionText.length;
            range.setStart(textNode, afterCursorPosition);
            range.setEnd(textNode, afterCursorPosition);
            selection?.removeAllRanges(); // clear the current selection
            selection?.addRange(range); // set the new cursor position

            return;
        }
        if (lastKeyPressed === 'Escape' || lastKeyPressed === 'Tab') {
            return;
        }
        if (lastKeyPressed === 'Enter') {
            return;
        }
        contents.value = (e.target as HTMLDivElement).innerText;
        detectMention(); // detect mention after IME input ends
    };
    const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            if (showSuggestions.value) {
                menuRef.value?.focus();
            }
        } else if (showSuggestions.value && (e.key === 'Escape' || e.key === 'Tab' || e.key === ' ')) {
            clearMention();
        } else if (e.key === 'Enter') {
            if (onKeydownEnter) {
                onKeydownEnter(e);
            }
        }

        lastKeyPressed = e.key; // Track the last key pressed
    };
    const reset = () => {
        contents.value = '';
        if (contentEditableDivRef.value) {
            contentEditableDivRef.value.textContent = '';
        }
        if (hiddenDiv) {
            hiddenDiv.textContent = '';
        }
    };

    const selectSuggestion = (item: SelectDropdownMenuItem) => {
        const contentsDiv = contentEditableDivRef.value;
        if (!contentsDiv) return;

        const selection = window.getSelection();
        const range = selection?.getRangeAt(0);

        if (!range) return;

        // Get the current text node and its content
        const textNode = range.startContainer;
        const textContent = textNode.textContent || '';

        // Remove the keyword and prepare for mention insertion
        const lastAtIndex = textContent.lastIndexOf('@');
        const beforeMention = textContent.slice(0, lastAtIndex);
        const afterMention = textContent.slice(range.endOffset);
        textNode.textContent = beforeMention + afterMention;

        // Create a span element for the selected user mention
        const mentionSpan = document.createElement('span');
        mentionSpan.className = 'mention'; // CSS class for styling the mention
        mentionSpan.textContent = item.label as string; // Display the user label
        mentionSpan.dataset.userId = item.name; // Store user ID as a dataset attribute
        mentionSpan.contentEditable = 'false'; // Make the mention non-editable

        // Insert the mentionSpan at the correct position
        range.setStart(textNode, beforeMention.length);
        range.setEnd(textNode, beforeMention.length);
        range.insertNode(mentionSpan);

        // Add a space after the mention for continued typing
        const space = document.createTextNode(' ');
        range.setStartAfter(mentionSpan);
        range.setEndAfter(mentionSpan);
        range.insertNode(space);

        // Move the cursor to the space after the mention
        range.setStartAfter(space);
        range.setEndAfter(space);
        selection?.removeAllRanges();
        selection?.addRange(range);

        // Reset state after inserting the mention
        showSuggestions.value = false;
        keyword.value = '';
        mentionTriggerIndex.value = -1;
        contents.value = contentsDiv.innerText;
    };
    /* focus in & out */
    const handleGlobalClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;

        // Check if the click is outside contentEditableDivRef or menuRef
        if (containerRef.value?.contains(target)) {
            detectMention();
        } else {
            showSuggestions.value = false;
        }
    };

    const clearMention = () => {
        showSuggestions.value = false;
        keyword.value = '';
        mentionTriggerIndex.value = -1;
        if (hiddenDiv) {
            hiddenDiv.textContent = contents.value;
        }
    };
    const handleMenuEsc = () => {
        clearMention();
        focusOnInput();
    };
    const focusOnInput = () => {
        if (contentEditableDivRef.value) {
            contentEditableDivRef.value.focus();
        }
    };

    // sync style of hidden div with textarea
    onMounted(() => {
        if (!containerRef.value || !contentEditableDivRef.value) return;
        // make container relative
        containerRef.value.style.position = 'relative';
        // create hidden div
        hiddenDiv = document.createElement('div');
        containerRef.value.insertBefore(hiddenDiv, contentEditableDivRef.value);
        const contentsEl = contentEditableDivRef.value;
        hiddenDiv.style.font = getComputedStyle(contentsEl).font;
        hiddenDiv.style.lineHeight = getComputedStyle(contentsEl).lineHeight;
        hiddenDiv.style.padding = getComputedStyle(contentsEl).padding;
        hiddenDiv.style.border = getComputedStyle(contentsEl).border;
        hiddenDiv.style.width = `${contentsEl.offsetWidth}px`;
        hiddenDiv.style.height = `${contentsEl.offsetHeight}px`;
        hiddenDiv.style.wordBreak = getComputedStyle(contentsEl).wordBreak;
        hiddenDiv.style.position = 'absolute';
        hiddenDiv.style.pointerEvents = 'none';
        hiddenDiv.style.whiteSpace = 'pre-wrap';
        hiddenDiv.style.overflowY = 'auto';
        hiddenDiv.style.visibility = 'hidden';
    });
    onUnmounted(() => {
        if (hiddenDiv) {
            hiddenDiv.remove();
            hiddenDiv = null;
        }
    });

    const popupStyle = computed(() => ({
        top: `${popupPosition.top}px`,
        left: `${popupPosition.left}px`,
        width: 'auto',
        minWidth: `${POPUP_MIN_WIDTH}px`,
        maxWidth: `${popupPosition.width}px`,
    }));

    // sync scroll of hidden div with textarea
    const syncScroll = throttle(() => {
        const contentsEl = contentEditableDivRef.value as HTMLDivElement;

        if (contentsEl && hiddenDiv) {
            hiddenDiv.scrollTop = contentsEl.scrollTop;
        }
    }, 100);

    onMounted(() => {
        document.addEventListener('mousedown', handleGlobalClick);
    });
    onUnmounted(() => {
        document.removeEventListener('mousedown', handleGlobalClick);
    });
    useIgnoreWindowArrowKeydownEvents({ predicate: showSuggestions });


    return {
        showSuggestions,
        popupPosition,
        handleInput,
        handleKeydown,
        selectSuggestion,
        handleMenuEsc,
        reset,
        focusOnInput,
        popupStyle,
        syncScroll,
        keyword,
        getRawContents,
    };
};
