import type { Ref } from 'vue';
import { computed } from 'vue';

import { usePackagesQuery } from './use-packages-query';


export const useDefaultPackage = (ops?: {
    enabled?: Ref<boolean>;
}) => {
    const { packages, isLoading } = usePackagesQuery(ops);

    const defaultPackage = computed(() => packages.value?.find((p) => p.is_default));

    return {
        defaultPackage,
        isLoading,
    };
};
