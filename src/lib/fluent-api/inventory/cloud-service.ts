/* eslint-disable camelcase */
import {
    CreateAction,
    GetAction, GetDataAction, ListAction, MemberListAction,
    Resource,
    ResourceActions, SingleDeleteAction, UpdateAction,
} from '@/lib/fluent-api/toolset';
import {
    CollectionInfo, DefaultMetaData,
    ListType, ReferenceInfo, Tags, TimeStamp,
} from '@/lib/fluent-api/type';
import Li from '@/components/atoms/lists/orun-list/Li.vue';

const idField = 'cloud_service_id';
const idsField = 'cloud_services';

interface IdParameter {
    cloud_service_id: string;
}

export interface CloudServiceModel extends IdParameter, Tags {
    cloud_service_type: string;
    provider: string;
    cloud_service_group: string;
    data: any;
    metadata: DefaultMetaData;
    reference: ReferenceInfo;
    collection_info: CollectionInfo;
    region_info: any;
    project_id: string;
    domain_id: string;
    created_at: TimeStamp;
    updated_at: TimeStamp;
    console_force_data?:any
}

export type CloudServiceListResp = ListType<CloudServiceModel>

interface CreateParameter extends Tags{
    name: string;
}
interface UpdateParameter extends Tags, IdParameter{
    name: string;
}

class Create extends CreateAction<CreateParameter, any> {}
class Update extends UpdateAction<UpdateParameter, any> {}
class Delete extends SingleDeleteAction<IdParameter, any> {
    protected idField = idField;
}
class Get extends GetAction<IdParameter, CloudServiceModel> {
    protected idField = idField;
}
class GetData extends GetDataAction<any, ListType<any>> {
    protected idField = idField
}

class List extends ListAction<any, CloudServiceListResp> {}

class MemberList extends MemberListAction<any,any>{
    protected idsField = idsField;
}

export default class CloudService extends Resource implements ResourceActions<'create'|'update'|'delete'|'get'|'list'|'getData'|'memberList'> {
    protected name = 'cloud-service';

    create() { return new Create(this.baseUrl); }

    update() { return new Update(this.baseUrl); }

    delete() { return new Delete(this.baseUrl); }

    get() { return new Get(this.baseUrl); }

    getData(): GetData { return new GetData(this.baseUrl); }

    list() { return new List(this.baseUrl); }

    memberList():MemberList{return  new MemberList(this.baseUrl)}

}
