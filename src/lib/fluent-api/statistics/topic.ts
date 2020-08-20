/* eslint-disable camelcase */
import { Resource, ResourceActions } from '@/lib/fluent-api/toolset';
import {
    StatTopicAction,
} from '@/lib/fluent-api/statistics/toolset';

export class CloudServiceType extends StatTopicAction<any, any> {
    path = 'cloud-service-type-page'

    showAll(show: boolean): this {
        this.apiState.extraParameter.show_all = show;
        return this.clone();
    }

    setLabels(labels: any): this {
        this.apiState.extraParameter.labels = labels;
        return this.clone();
    }
}

export class DailyUpdateServer extends StatTopicAction<any, any> {
    path = 'daily-update-server'

    setId(projectId: string): this {
        this.apiState.extraParameter.project_id = projectId;
        return this.clone();
    }
}

export class DailyUpdateCloudService extends StatTopicAction<any, any> {
    path = 'daily-update-cloud-service'

    setId(projectId: string): this {
        this.apiState.extraParameter.project_id = projectId;
        return this.clone();
    }
}

export default class Topic extends Resource implements ResourceActions<'cloudServiceType'|'dailyUpdateServer'|'dailyUpdateCloudService'> {
    name = 'topic'

    cloudServiceType() { return new CloudServiceType(this.api, this.baseUrl); }

    dailyUpdateServer() { return new DailyUpdateServer(this.api, this.baseUrl); }

    dailyUpdateCloudService() { return new DailyUpdateCloudService(this.api, this.baseUrl); }
}
