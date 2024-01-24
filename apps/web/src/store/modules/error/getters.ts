// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Getter } from 'vuex';

import type { ErrorState } from '@/store/modules/error/type';

export const grantFailStatus: Getter<ErrorState, any> = (state: ErrorState): boolean => state.grantAccessFailStatus;
