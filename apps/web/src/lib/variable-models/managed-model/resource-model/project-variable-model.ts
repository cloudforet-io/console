import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';

import type { ListResponse as ApiListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { ProjectGroupListParameters } from '@/api-clients/identity/project-group/schema/api-verbs/list';
import type { ProjectGroupModel } from '@/api-clients/identity/project-group/schema/model';
import type { ProjectModel } from '@/api-clients/identity/project/schema/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';
import type { ListQuery, ListResponse, VariableModelConstructorConfig } from '@/lib/variable-models/_base/types';

import ErrorHandler from '@/common/composables/error/errorHandler';


const listProjectGroup = async (projectGroupIdList: string[]) => {
    try {
        const res = await SpaceConnector.clientV2.identity.projectGroup.list<ProjectGroupListParameters, ApiListResponse<ProjectGroupModel>>({
            query: {
                only: ['project_group_id', 'name'],
                filter: [
                    {
                        k: 'project_group_id',
                        v: projectGroupIdList,
                        o: 'in',
                    },
                ],
            },
        });
        return res?.results ?? [];
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};

export default class ProjectVariableModel extends ResourceVariableModel<ProjectModel> {
    static meta = {
        key: 'project',
        name: 'Project',
        resourceType: 'identity.Project',
        idKey: 'project_id',
        nameKey: 'name',
        _only: ['project_id', 'name', 'project_group_id'],
        _searchTargets: ['name'],
    };

    constructor(config: VariableModelConstructorConfig = {}) {
        super(config);
        this._meta = ProjectVariableModel.meta;
    }

    #response: ListResponse = { results: [] };

    #fetcher?: ReturnType<typeof getCancellableFetcher<object, { results: ProjectModel[]; total_count: number }>>;

    #nameFormatter(data: ProjectModel, projectGroupList: ProjectGroupModel[]): string {
        if (data.project_group_id) {
            const targetProjectGroup = projectGroupList.find((d) => d.project_group_id === data.project_group_id);
            if (targetProjectGroup) {
                return `${targetProjectGroup.name} > ${data.name}`;
            }
        }
        return data[this._meta.nameKey];
    }

    async list(query: ListQuery = {}): Promise<ListResponse> {
        try {
            if (!this.#fetcher) this.#fetcher = getCancellableFetcher(SpaceConnector.clientV2.identity.project.list);

            const { status, response } = await this.#fetcher(
                this._getListParams(query),
            );
            if (status === 'succeed') {
                let more = false;
                if (query.start !== undefined && query.limit !== undefined && response.total_count !== undefined) {
                    more = (query.start * query.limit) < response.total_count;
                }

                // get project group info
                const projectGroupIdList = response.results?.map((d) => d.project_group_id) ?? [];
                const projectGroupList = await listProjectGroup(projectGroupIdList);

                this.#response = {
                    results: response.results ? response.results?.map((d) => ({
                        key: d[this._meta.idKey], name: this.#nameFormatter(d, projectGroupList),
                    })) : [],
                    more,
                };
            }
            return this.#response;
        } catch (e) {
            ErrorHandler.handleError(e);
            return this.#response;
        }
    }
}
