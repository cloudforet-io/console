import { computed, type Ref } from 'vue';

import { useCategoriesQuery } from './use-categories-query';

export const useAssociatedCategoriesToPackage = ({
    packageId,
}: {
  packageId: Ref<string|undefined>
}) => {
    const { categories } = useCategoriesQuery();
    const associatedCategoriesToPackage = computed(() => categories.value?.filter((c) => c.state !== 'DELETED' && c.package_id === packageId.value) ?? []);

    return {
        associatedCategoriesToPackage,
    };
};
