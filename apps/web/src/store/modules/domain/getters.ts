import type { Getter } from 'vuex';

import { extendedAuthTypes } from '@/store/modules/domain/config';

import type { DomainState } from './type';
import { DOMAIN_CONFIG_TYPE } from './type';

export const extendedAuthTypeLabel = (state: DomainState): string => extendedAuthTypes[state.extendedAuthType as string] || state.extendedAuthType;

export const domainExtraMenu: Getter<DomainState, any> = (state): any => state.config?.[DOMAIN_CONFIG_TYPE.EXTRA_MENU];
