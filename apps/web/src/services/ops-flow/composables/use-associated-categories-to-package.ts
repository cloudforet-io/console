import { computed, type Ref } from 'vue';

import { useAvailableCategories } from '@/services/ops-flow/composables/use-available-categories';

export const useAssociatedCategoriesToPackage = ({
    packageId,
}: {
  packageId: Ref<string|undefined>
}) => {
    const { availableCategories } = useAvailableCategories();
    const associatedCategoriesToPackage = computed(() => availableCategories.value?.filter((c) => c.package_id === packageId.value) ?? []);

    return {
        associatedCategoriesToPackage,
    };
};
