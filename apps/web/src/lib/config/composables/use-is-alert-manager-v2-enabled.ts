import { useDomainStore } from '@/store/domain/domain-store';

import config from '@/lib/config';

/* NOTE:
*  This hook will be removed or refactored once the global config is improved.
* */

export const useIsAlertManagerV2Enabled = (): boolean => {
    const domainStore = useDomainStore();
    const domainStoreState = domainStore.state;

    const enabledDomains = config.get('ADVANCED_SERVICE')?.alert_manager_v2 ?? [];

    return enabledDomains.includes(domainStoreState.domainId);
};
