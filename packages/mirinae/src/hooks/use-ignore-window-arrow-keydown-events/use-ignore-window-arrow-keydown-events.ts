import type { ComputedRef, Ref } from 'vue';
import { isRef, onMounted, onUnmounted } from 'vue';

interface UseIgnoreWindowArrowKeydownEventsOptions {
 predicate: { (): boolean }|Ref<boolean>|ComputedRef<boolean>|boolean;
}
export const useIgnoreWindowArrowKeydownEvents = ({ predicate }: UseIgnoreWindowArrowKeydownEventsOptions) => {
    const onWindowKeydown = (e: KeyboardEvent) => {
        if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
            if (typeof predicate === 'boolean' && predicate) e.preventDefault();
            else if (typeof predicate === 'function' && predicate()) e.preventDefault();
            else if (isRef(predicate) && predicate.value) e.preventDefault();
        }
    };
    onMounted(() => {
        window.addEventListener('keydown', onWindowKeydown, false);
    });
    onUnmounted(() => {
        window.removeEventListener('keydown', onWindowKeydown, false);
    });
};
