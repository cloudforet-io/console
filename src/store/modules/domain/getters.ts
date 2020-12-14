import { extendedAuthTypes } from '@/store/modules/domain/config';
import { DomainState } from './type';

export const isInternalAuth = (state: DomainState): boolean => (state.authType === 'INTERNAL');
export const getAuthSystem = (state: DomainState): string => {
    if (state.authSystem === 'GOOGLE_OAUTH2') {
        return 'google_oauth2';
    }

    return 'local';
};
export const extendedAuthTypeLabel = (state: DomainState): string => extendedAuthTypes[state.extendedAuthType as string] || state.extendedAuthType;
