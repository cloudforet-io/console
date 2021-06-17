import {
    computed, ComputedRef, reactive, Ref,
} from '@vue/composition-api';
import { Vue } from 'vue/types/vue';

export const useContextMenuCustomStyle = (visible: Ref<boolean>|ComputedRef<boolean>) => {
    const state = reactive({
        targetRef: null as Vue|HTMLElement|null,
        contextMenuStyle: computed(() => {
            if (!visible.value || !state.targetRef) return {};

            const winHeight = window.innerHeight;
            const rects: any = ((state.targetRef as Vue).$el ?? state.targetRef).getBoundingClientRect();

            const contextMenuStyle: any = {
                position: 'fixed',
                minWidth: 'auto',
                overflowY: 'auto',
                height: 'auto',
                width: `${rects.width}px`,
            };

            if (winHeight * 0.9 > rects.top) {
                const height = window.innerHeight - rects.top - rects.height - 12;
                contextMenuStyle.maxHeight = `${height < 0 ? 0 : height}px`;
                contextMenuStyle.top = `calc(${rects.top}px + ${rects.height}px)`;
            } else {
                const height = rects.top - 12;
                contextMenuStyle.maxHeight = `${height < 0 ? 0 : height}px`;
                contextMenuStyle.bottom = `calc(100vh - ${rects.top}px)`;
            }

            return contextMenuStyle;
        }),
    });

    return {
        state,
    };
};
