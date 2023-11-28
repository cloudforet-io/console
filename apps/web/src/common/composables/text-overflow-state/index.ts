import type { Ref } from 'vue';
import { computed } from 'vue';
import type { Vue } from 'vue/types/vue';

interface UseEllipsisOptions {
    targetRef: Ref<Vue|HTMLElement|undefined|null | (Vue|HTMLElement|undefined|null)[]>;
    targetClass?: string; // if target is not the element itself, but the child element, you can use this option
    lineClamp?: boolean; // in case of using line-clamp, you can use this option
}
const LINE_CLAMP_PADDING = 2;

/**
 * @description this composable is used to check whether the element is overflowed or not.
 * @param targetRef
 * @param targetClass
 * @param lineClamp
 */
export const useTextOverflowState = ({ targetRef, targetClass, lineClamp }: UseEllipsisOptions) => {
    const getElementFromTarget = (target: Vue | HTMLElement): HTMLElement|undefined => {
        let targetElement;
        if ((target as Vue).$el) {
            targetElement = (target as Vue)?.$el as HTMLElement|undefined;
            if (!targetElement) return undefined;
        } else {
            targetElement = target as HTMLElement;
        }

        if (targetClass) {
            targetElement = targetElement.getElementsByClassName(targetClass)[0] as HTMLElement|undefined;
        }

        return targetElement;
    };
    const isOverflow = (element: HTMLElement): boolean => {
        if (lineClamp) {
            return element.scrollHeight > (element.offsetHeight + LINE_CLAMP_PADDING);
        }

        return element.offsetWidth < element.scrollWidth;
    };
    const getTextOverflowState = (index?: number): boolean => {
        if (!targetRef.value) return false;

        if (index === undefined) {
            if (Array.isArray(targetRef.value)) return false;
            if (!targetRef.value) return false;

            const element = getElementFromTarget(targetRef.value);
            return element ? isOverflow(element) : false;
        }

        if (Array.isArray(targetRef.value)) {
            const target = targetRef.value[index];
            if (!target) return false;

            const element = getElementFromTarget(target);

            return element ? isOverflow(element) : false;
        }
        return false;
    };

    const isTextOverflow = computed<boolean>(() => {
        if (!targetRef.value) return false;
        if (Array.isArray(targetRef.value)) return false;

        const element = getElementFromTarget(targetRef.value);

        return element ? isOverflow(element) : false;
    });

    const isTextOverflowList = computed<boolean[]>(() => {
        if (!targetRef.value) return [];
        if (!Array.isArray(targetRef.value)) return [isTextOverflow.value];

        return targetRef.value.map((target) => {
            if (!target) return false;

            const element = getElementFromTarget(target);
            return element ? isOverflow(element) : false;
        });
    });

    return {
        isTextOverflow,
        isTextOverflowList,
        getTextOverflowState,
    };
};
