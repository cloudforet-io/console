import {
    ComponentRenderProxy,
    computed, getCurrentInstance, onMounted, onUnmounted, reactive, watch,
} from '@vue/composition-api';
import { throttle } from 'lodash';
import { Vue } from 'vue/types/vue';
import { makeOptionalProxy } from '@/util/composition-helpers';

export interface ContextMenuFixedStyleProps {
    useFixedMenuStyle?: boolean;
    visibleMenu?: boolean;
}

const isScrollable = (ele: Element) => {
    const hasScrollableContent = ele.scrollHeight > ele.clientHeight;

    const overflowYStyle = window.getComputedStyle(ele).overflowY;
    const isOverflowHidden = overflowYStyle.indexOf('hidden') !== -1;

    return hasScrollableContent && !isOverflowHidden;
};

const getScrollableParent = (ele?: Element|null): Element => {
    if (!ele || ele === document.body) return document.body;
    return isScrollable(ele) ? ele : getScrollableParent(ele.parentElement);
};

export const useContextMenuFixedStyle = (
    props: ContextMenuFixedStyleProps,
) => {
    const vm = getCurrentInstance() as ComponentRenderProxy;
    const state = reactive({
        proxyVisibleMenu: makeOptionalProxy('visibleMenu', vm, false),
        targetRef: null as Vue|Element|null,
        targetElement: computed<Element|null>(() => (state.targetRef as Vue)?.$el ?? state.targetRef),
        contextMenuStyle: computed(() => {
            if (!state.proxyVisibleMenu || !state.targetRef) return {};

            const targetRects: DOMRect = state.targetElement?.getBoundingClientRect();

            const contextMenuStyle: Partial<CSSStyleDeclaration> = {
                overflowY: 'auto',
                height: 'auto',
                minHeight: '32px',
            };

            if (props.useFixedMenuStyle) {
                contextMenuStyle.position = 'fixed';
                contextMenuStyle.width = 'auto';
                contextMenuStyle.minWidth = `${targetRects.width}px`;
                contextMenuStyle.maxWidth = '100%'
            }

            if (window.innerHeight * 0.9 > (targetRects.bottom)) {
                const height = window.innerHeight - targetRects.bottom - 12;
                contextMenuStyle.maxHeight = `${height < 0 ? 0 : height}px`;
                if (props.useFixedMenuStyle) contextMenuStyle.top = `${targetRects.bottom}px`;
                else contextMenuStyle.top = `${targetRects.height}px`;
            } else {
                const height = targetRects.top - 12;
                contextMenuStyle.maxHeight = `${height < 0 ? 0 : height}px`;
                if (props.useFixedMenuStyle) contextMenuStyle.bottom = `${targetRects.top}px`;
                else contextMenuStyle.bottom = `${targetRects.height}px`;
            }

            return contextMenuStyle;
        }),
    });

    const hideMenu = throttle(() => {
        if (state.proxyVisibleMenu) state.proxyVisibleMenu = false;
    }, 300);


    if (props.useFixedMenuStyle) {
        let scrollParent: Element|undefined;
        watch(() => state.targetElement, (targetElement) => {
            if (targetElement) {
                scrollParent = getScrollableParent(targetElement);
                if (scrollParent) {
                    scrollParent.addEventListener('scroll', hideMenu);
                }
            } else if (scrollParent) {
                scrollParent.removeEventListener('scroll', hideMenu);
            }
        });

        onMounted(() => {
            window.addEventListener('resize', hideMenu);
        });

        onUnmounted(() => {
            window.removeEventListener('resize', hideMenu);
        });
    }


    return {
        state,
    };
};
