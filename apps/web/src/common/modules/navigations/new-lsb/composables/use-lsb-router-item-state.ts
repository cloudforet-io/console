import type { UnwrapRef, Ref } from 'vue';
import { computed } from 'vue';
import type { Location } from 'vue-router';
import { useRoute, useRouter } from 'vue-router/composables';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import type { LSBIcon } from '@/common/modules/navigations/new-lsb/type';

interface UseLsbRouterItemProps {
    to?: Ref<Readonly<Location>>;
    icon?: Ref<Readonly<LSBIcon>>;
    imgIcon?: Ref<Readonly<string>>;
}
export const useLsbRouterItemState = (props: UnwrapRef<UseLsbRouterItemProps>) => {
    const router = useRouter();
    const route = useRoute();

    const isSelected = computed<boolean>(() => {
        if (!props.to) return false;

        const resolved = router.resolve(props.to);
        if (!resolved) return false;

        let currentPath = route.fullPath;
        if (currentPath.indexOf('?') > 0) {
            currentPath = currentPath.slice(0, currentPath.indexOf('?'));
        }
        const resolvedHref = resolved.href;
        return currentPath === resolvedHref;
    });
    const iconName = computed<string>(() => {
        if (!props.icon) return '';
        if (typeof props.icon === 'string') return props.icon;
        return props.icon.name;
    });
    const iconColor = computed<string>(() => {
        if (!props.icon) return 'inherit';
        if (typeof props.icon === 'string') return 'inherit';
        return props.icon.color || 'inherit';
    });
    const imgIconUrl = computed<string>(() => (props.imgIcon ? assetUrlConverter(props.imgIcon) : ''));

    return {
        isSelected,
        iconName,
        iconColor,
        imgIconUrl,
    };
};
