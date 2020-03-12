/* eslint-disable camelcase */
import { AxiosResponse } from 'axios';
import { getDataAPI } from '@/lib/api/toolset';
// @ts-ignore
import { ClassTypeOf } from '@/lib/type';
import TreeItem, { TreeToolSet } from '@/components/molecules/tree-new/ToolSet';


export abstract class BaseTreeAPI<
        initData = any,
        node extends TreeItem = TreeItem,
        responses =any,
        T extends TreeToolSet<initData > = TreeToolSet<initData >
    > extends getDataAPI {
    public abstract ts: T;

    protected setFetchData() {
        // @ts-ignore
        this.ts.state.options?.fetchData = this.getData;
    }

    protected abstract requestData: (node?:any)=>any;

    protected abstract toNode:(data: any)=>node[];

    public getData = async (node?:any):Promise<node[]> => {
        this.ts.state.loading = true;
        let result :node[] = [];
        try {
            const resp = await this.requestData(node);
            result = this.toNode(resp);
        } catch (e) {
            console.error(e);
        }
        this.ts.state.loading = false;
        return result;
    };
}

export interface ProjectItemResp {
    id:string,
    name:string,
    has_child:boolean,
    item_type: 'PROJECT_GROUP'|'PROJECT',
}
export interface ProjectGroupItem {
    project_group_id:string
    name:string
    text:string
}

export interface ProjectNode extends TreeItem{
    data:ProjectItemResp;
}


export class ProjectTreeAPI<
        initData = any,
        initSyncData = any,
        node extends ProjectNode = ProjectNode,
        responses =any,
        T extends TreeToolSet<initData > = TreeToolSet<initData >
        > extends BaseTreeAPI<initData, node, responses, T> {
        public ts: T;


        public constructor(ToolSet:ClassTypeOf<T> = null as unknown as ClassTypeOf<T>, initData?:initData, initSyncData?:initSyncData) {
            super();
            // @ts-ignore
            this.ts = ToolSet ? new ToolSet(initData, initSyncData) : TreeToolSet(initData);
            console.log(this.ts);
            this.setFetchData();
        }


        protected requestData = async (node:node) => {
            let url:string = '';
            let data:any = {};
            let cb: (resp:AxiosResponse<any>) => Promise<any[]> = null as unknown as (resp:AxiosResponse<any>) => Promise<any[]>;
            console.debug('request node', node);
            if (node.id !== 'root') {
                url = '/identity/project/tree';
                data = {
                    item_id: node.data.id,
                    item_type: node.data.item_type,
                    sort: {
                        key: 'name',
                    },
                };
                cb = resp => Promise.resolve(resp.data.items);
            } else { // root tree
                url = '/identity/project-group/list';
                data = {
                    query: {
                        minimal: true,
                        filter: [{ k: 'parent_project_group', v: null, o: 'eq' }],
                    },
                };
                cb = resp => Promise.resolve(resp.data.results);
            }
            const resp = await this.$http.post(url, data).then(cb);
            console.debug('tree result', resp);
            return resp;
        };

        protected toNode = (data:ProjectItemResp[]|ProjectGroupItem[]) => {
            console.log(data);
            // @ts-ignore
            return data.map((item) => {
                if (item.item_type) {
                    return new TreeItem(item.name, item, undefined, undefined, undefined, item.item_type === 'PROJECT_GROUP');
                }
                return new TreeItem(item.name, {
                    id: item.project_group_id,
                    name: item.name,
                    has_child: true,
                    item_type: 'PROJECT_GROUP',

                }, undefined, undefined, undefined, true);
            });
        };
}
