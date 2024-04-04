import type { Ref } from 'vue';
import { nextTick } from 'vue';

export interface UseLastItemObserverOptions {
    containerRef: Ref<HTMLElement|null>;
    onAppeared: () => Promise<void>;
}
/**
    @description This composable is used to load more items when the user scrolls to the bottom of the container.
    It uses IntersectionObserver to detect when the last item is visible and calls loadMore callback.

    @example You can use it like this:
    const { disconnectObserver, connectObserver } = useInfiniteLoader({
        containerRef: ref(null),
        loadMore: () => {
            // load more items
        },
    });
    const async init = () => {
        // load initial items
        connectObserver(); // connect observer after initializing items
    };
    const async refresh = () => {
        disconnectObserver(); // disconnect observer before refreshing items to prevent unnecessary loadMore calls
        // refresh items
        connectObserver(); // connect observer after refreshing items
    };

    onMounted(() => {
        init();
    });
    onUnmounted(() => {
        disconnectObserver();
    });
 */

export const useLastItemObserver = ({ onAppeared, containerRef }: UseLastItemObserverOptions) => {
    let lastItemElement: HTMLElement|null = null;
    const getLastItemElement = (): HTMLElement|null => {
        if (containerRef.value) {
            const children = containerRef.value.children;
            return children[children.length - 1] as HTMLElement;
        }
        console.error('[useInfiniteLoadOnLastItemView] Container is not found');
        return null;
    };
    let loading = false;
    const intersectionObserver = new IntersectionObserver((entries) => {
        if (loading) return;

        // If intersectionRatio is 0, the target is out of view and we do not need to do anything.
        if (entries[0].intersectionRatio <= 0) return;

        loading = true;
        onAppeared().then(() => {
            loading = false;
        });
    });
    const disconnectObserver = () => {
        intersectionObserver.disconnect();
        lastItemElement = null;
        loading = false;
    };
    const connectObserver = () => {
        nextTick(() => { // wait for the next tick to make sure that the last item is rendered
            lastItemElement = getLastItemElement();
            if (lastItemElement) {
                intersectionObserver.observe(lastItemElement);
            }
        });
    };

    return {
        disconnectObserver,
        connectObserver,
        intersectionObserver,
    };
};
