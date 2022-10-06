import type { Getter } from 'vuex';

import type { CloudServiceTypeReferenceMap } from '@/store/modules/reference/cloud-service-type/type';
import type { CollectorReferenceMap } from '@/store/modules/reference/collector/type';
import type { PluginReferenceMap } from '@/store/modules/reference/plugin/type';
import type { ProjectGroupReferenceMap } from '@/store/modules/reference/project-group/type';
import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';
import type { ProtocolReferenceMap } from '@/store/modules/reference/protocol/type';


export const projectItems: Getter<any, any> = (state): ProjectReferenceMap => state.project?.items ?? {};

export const projectGroupItems: Getter<any, any> = (state): ProjectGroupReferenceMap => state.projectGroup?.items ?? {};

export const protocolItems: Getter<any, any> = (state): ProtocolReferenceMap => state.protocol?.items ?? {};

export const cloudServiceTypeItems: Getter<any, any> = (state): CloudServiceTypeReferenceMap => state.cloudServiceType?.items ?? {};

export const collectorItems: Getter<any, any> = (state): CollectorReferenceMap => state.collector?.items ?? {};

export const pluginItems: Getter<any, any> = (state): PluginReferenceMap => state.plugin?.items ?? {};
