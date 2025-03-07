import { computed } from 'vue';

import { usePackagesQuery } from './use-packages-query';


export const useDefaultPackageQuery = () => {
    const { packages, isLoading } = usePackagesQuery();

    const defaultPackage = computed(() => packages.value?.find((p) => p.is_default));

    return {
        defaultPackage,
        isLoading,
    };
};
