import { reactive } from 'vue';

import { defineStore } from 'pinia';

import type { TaskCategoryCreateParameters } from '@/schema/workflow/task-category/api-verbs/create';
import type { TaskCategoryUpdateParameters } from '@/schema/workflow/task-category/api-verbs/update';
import type { TaskCategoryModel } from '@/schema/workflow/task-category/model';

interface UseTaskCategoryStoreState {
    loading: boolean;
    taskCategories?: TaskCategoryModel[];
    creating: boolean;
    updating: boolean;
}

export const useTaskCategoryStore = defineStore('task-category', () => {
    const state = reactive<UseTaskCategoryStoreState>({
        loading: false,
        taskCategories: undefined,
        creating: false,
        updating: false,
    }) as UseTaskCategoryStoreState;
    const actions = {
        async fetchCategories() {
            return new Promise<void>((resolve) => {
                state.loading = true;
                setTimeout(() => {
                    state.taskCategories = [
                        {
                            category_id: 'category_1',
                            package_id: 'package_1',
                            name: 'Billing and Payment',
                            description: '빌링 및 결제와 관련된 문의사항',
                            status_options: [
                                {
                                    name: '요청',
                                    status_type: 'TODO',
                                    color: 'gray',
                                },
                                {
                                    name: '진행중',
                                    status_type: 'IN_PROGRESS',
                                    color: 'blue',
                                },
                                {
                                    name: '완료',
                                    status_type: 'COMPLETE',
                                    color: 'green',
                                },
                                {
                                    name: '보류',
                                    status_type: 'COMPLETE',
                                    color: 'yellow',
                                },
                                {
                                    name: '취소',
                                    status_type: 'COMPLETE',
                                    color: 'red',
                                },
                            ],
                            fields: [],
                            domain_id: '1',
                            created_at: '2021-09-01T00:00:00',
                            updated_at: '2021-09-01T00:00:00',
                            tags: {},
                        },
                        {
                            category_id: 'category_2',
                            package_id: 'package_1',
                            name: 'Service Limit In-Crease',
                            description: '서비스 한도 증가와 관련된 문의사항',
                            status_options: [
                                {
                                    name: '요청',
                                    status_type: 'TODO',
                                    color: 'gray',
                                },
                                {
                                    name: '확인중',
                                    status_type: 'IN_PROGRESS',
                                    color: 'yellow',
                                },
                                {
                                    name: '진행중',
                                    status_type: 'IN_PROGRESS',
                                    color: 'blue',
                                },
                                {
                                    name: '완료',
                                    status_type: 'COMPLETE',
                                    color: 'green',
                                },
                            ],
                            fields: [],
                            domain_id: '1',
                            created_at: '2021-09-01T00:00:00',
                            updated_at: '2021-09-01T00:00:00',
                            tags: {},
                        }, {
                            category_id: 'category_3',
                            package_id: 'package_2',
                            name: 'Technical Support',
                            description: '기술 지원과 관련된 문의사항',
                            status_options: [
                                {
                                    name: '요청',
                                    status_type: 'TODO',
                                    color: 'gray',
                                },
                                {
                                    name: '진행중',
                                    status_type: 'IN_PROGRESS',
                                    color: 'blue',
                                },
                                {
                                    name: '완료',
                                    status_type: 'COMPLETE',
                                    color: 'green',
                                },
                            ],
                            fields: [],
                            domain_id: '1',
                            created_at: '2021-09-01T00:00:00',
                            updated_at: '2021-09-01T00:00:00',
                            tags: {},
                        },
                    ];
                    state.loading = false;
                    resolve();
                }, 1000);
            });
        },
        async createCategory(param: Omit<TaskCategoryCreateParameters, 'status_options'>) {
            return new Promise<void>((resolve) => {
                state.creating = true;
                state.taskCategories?.push({
                    category_id: `category_${(state.taskCategories?.length ?? 0) + 1}`,
                    package_id: param.package_id,
                    name: param.name,
                    description: param.description ?? '',
                    status_options: [{
                        name: '요청',
                        status_type: 'TODO',
                        color: 'gray',
                    }, {
                        name: '진행중',
                        status_type: 'IN_PROGRESS',
                        color: 'blue',
                    }, {
                        name: '완료',
                        status_type: 'COMPLETE',
                        color: 'green',
                    }],
                    fields: [],
                    domain_id: '1',
                    created_at: '2021-09-01T00:00:00',
                    updated_at: '2021-09-01T00:00:00',
                    tags: param.tags ?? {},
                });
                state.creating = false;
                resolve();
            });
        },
        async updateCategory(param: Omit<TaskCategoryUpdateParameters, 'status_options'>) {
            return new Promise<void>((resolve) => {
                state.updating = true;
                setTimeout(() => {
                    const targetCategory = state.taskCategories?.find((category) => category.category_id === param.category_id);
                    if (targetCategory) {
                        if (param.name) targetCategory.name = param.name;
                        if (targetCategory.description) targetCategory.description = param.description ?? '';
                        if (targetCategory.tags) targetCategory.tags = param.tags ?? {};
                    }
                    state.updating = false;
                    resolve();
                }, 1000);
            });
        },
    };
    return {
        state,
        ...actions,
    };
});
