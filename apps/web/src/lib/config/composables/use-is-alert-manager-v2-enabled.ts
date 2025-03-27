import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useDomainStore } from '@/store/domain/domain-store';
import { pinia } from '@/store/pinia';

import config from '@/lib/config';

/* NOTE:
*  This hook will be removed or refactored once the global config is improved.
* */

export const useIsAlertManagerV2Enabled = (): ComputedRef<boolean> => {
    const domainStore = useDomainStore(pinia);
    const domainStoreState = domainStore.state;

    const enabledDomains = config.get('ADVANCED_SERVICE')?.alert_manager_v2 ?? [];

    return computed(() => enabledDomains.includes(domainStoreState.domainId));
};
