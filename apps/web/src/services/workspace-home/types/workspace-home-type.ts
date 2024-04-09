import type { WORKSPACE_HOME_DATA_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';

export type WorkspaceHomeDataType = typeof WORKSPACE_HOME_DATA_TYPE[keyof typeof WORKSPACE_HOME_DATA_TYPE];
