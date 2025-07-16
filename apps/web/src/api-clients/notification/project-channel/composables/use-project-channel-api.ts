import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { ProjectChannelCreateParameters } from '@/api-clients/notification/project-channel/schema/api-verbs/create';
import type { ProjectChannelDeleteParameters } from '@/api-clients/notification/project-channel/schema/api-verbs/delete';
import type { ProjectChannelDisableParameters } from '@/api-clients/notification/project-channel/schema/api-verbs/disable';
import type { ProjectChannelEnableParameters } from '@/api-clients/notification/project-channel/schema/api-verbs/enable';
import type { ProjectChannelGetParameters } from '@/api-clients/notification/project-channel/schema/api-verbs/get';
import type { ProjectChannelListParameters } from '@/api-clients/notification/project-channel/schema/api-verbs/list';
import type { ProjectChannelSetScheduleParameters } from '@/api-clients/notification/project-channel/schema/api-verbs/set-schedule';
import type { ProjectChannelSetSubscriptionParameters } from '@/api-clients/notification/project-channel/schema/api-verbs/set-subscription';
import type { ProjectChannelStatParameters } from '@/api-clients/notification/project-channel/schema/api-verbs/stat';
import type { ProjectChannelUpdateParameters } from '@/api-clients/notification/project-channel/schema/api-verbs/update';
import type { ProjectChannelModel } from '@/api-clients/notification/project-channel/schema/model';



export const useProjectChannelApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.notification.projectChannel.create<ProjectChannelCreateParameters, ProjectChannelModel>,
        delete: SpaceConnector.clientV2.notification.projectChannel.delete<ProjectChannelDeleteParameters>,
        disable: SpaceConnector.clientV2.notification.projectChannel.disable<ProjectChannelDisableParameters, ProjectChannelModel>,
        enable: SpaceConnector.clientV2.notification.projectChannel.enable<ProjectChannelEnableParameters, ProjectChannelModel>,
        get: SpaceConnector.clientV2.notification.projectChannel.get<ProjectChannelGetParameters, ProjectChannelModel>,
        list: SpaceConnector.clientV2.notification.projectChannel.list<ProjectChannelListParameters, ListResponse<ProjectChannelModel>>,
        setSchedule: SpaceConnector.clientV2.notification.projectChannel.setSchedule<ProjectChannelSetScheduleParameters, ProjectChannelModel>,
        setSubscription: SpaceConnector.clientV2.notification.projectChannel.setSubscription<ProjectChannelSetSubscriptionParameters, ProjectChannelModel>,
        stat: SpaceConnector.clientV2.notification.projectChannel.stat<ProjectChannelStatParameters, ProjectChannelModel>,
        update: SpaceConnector.clientV2.notification.projectChannel.update<ProjectChannelUpdateParameters, ProjectChannelModel>,
    };
    return {
        projectChannelAPI: actions,
    };
};
