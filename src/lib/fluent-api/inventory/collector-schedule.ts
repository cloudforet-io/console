/* eslint-disable camelcase */
import {
    AddAction, GetAction, ListAction, Resource, ResourceActions, SingleDeleteAction, UpdateAction,
} from '@/lib/fluent-api/toolset';
import {
    CollectorScheduleListResp,
    CollectorScheduleModel,
    ScheduleAddParameter, ScheduleDeleteParameter, ScheduleGetParameter,
    ScheduleListParameter, ScheduleUpdateParameter,
} from '@/lib/fluent-api/inventory/collector.type';

const idField = 'schedule_id';

class AddSchedule extends AddAction<ScheduleAddParameter, CollectorScheduleModel> {}

class UpdateSchedule extends UpdateAction<ScheduleUpdateParameter, undefined> {}

class DeleteSchedule extends SingleDeleteAction<ScheduleDeleteParameter, undefined> {
    idField = idField

    setCollectorId(collectorId: string): this {
        const api = this.clone();
        api.apiState.parameter.collector_id = collectorId;
        return api;
    }
}

class ListSchedule extends ListAction<ScheduleListParameter, CollectorScheduleListResp> {
    setParameter(parameter: ScheduleListParameter): this {
        const api = this.clone();
        api.apiState.extraParameter = { ...parameter };
        return api;
    }

    setCollectorId(collectorId: string): this {
        const api = this.clone();
        api.apiState.extraParameter.collector_id = collectorId;
        return api;
    }
}

class GetSchedule extends GetAction<ScheduleGetParameter, CollectorScheduleModel> {
    idField = idField

    setCollectorId(collectorId: string): this {
        const api = this.clone();
        api.apiState.parameter.collector_id = collectorId;
        return api;
    }
}

export default class CollectorSchedule extends Resource implements ResourceActions<'add'|'update'|'delete'|'list'|'get'> {
    protected name = 'schedule';

    add(): AddSchedule { return new AddSchedule(this.api, this.baseUrl); }

    update(): UpdateSchedule { return new UpdateSchedule(this.api, this.baseUrl); }

    delete(): DeleteSchedule { return new DeleteSchedule(this.api, this.baseUrl); }

    list(): ListSchedule { return new ListSchedule(this.api, this.baseUrl); }

    get(): GetSchedule { return new GetSchedule(this.api, this.baseUrl); }
}
