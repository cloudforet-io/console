import { DomainState, AuthSystem } from './type';

export const isInternalAuth = (state: DomainState): boolean => (state.authType === 'INTERNAL');
export const getAuthSystem = (state: DomainState): string => {
    if (state.authSystem === 'GOOGLE_OAUTH2') {
        return 'google_oauth2';
    }

    return 'local';
};
