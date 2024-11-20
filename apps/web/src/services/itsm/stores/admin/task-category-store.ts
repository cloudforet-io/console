import { reactive } from 'vue';

import { defineStore } from 'pinia';

import type { TaskCategoryCreateParameters } from '@/schema/opsflow/task-category/api-verbs/create';
import type { TaskCategoryUpdateParameters } from '@/schema/opsflow/task-category/api-verbs/update';
import type { TaskCategoryModel } from '@/schema/opsflow/task-category/model';


interface UseTaskCategoryStoreState {
    loading: boolean;
    taskCategories?: TaskCategoryModel[];
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface UseTaskCategoryStoreGetters {
}

export const useTaskCategoryStore = defineStore('task-category', () => {
    const state = reactive<UseTaskCategoryStoreState>({
        loading: false,
        taskCategories: undefined,
    }) as UseTaskCategoryStoreState;

    const getters = reactive<UseTaskCategoryStoreGetters>({
    });

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
        async createCategory(param: Omit<TaskCategoryCreateParameters, 'status_options'|'package_id'>) {
            return new Promise<TaskCategoryModel>((resolve) => {
                const result: TaskCategoryModel = {
                    category_id: `category_${(state.taskCategories?.length ?? 0) + 1}`,
                    package_id: 'package_1', // default package id
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
                };
                state.taskCategories?.push(result);
                resolve(result);
            });
        },
        async updateCategory(param: Omit<TaskCategoryUpdateParameters, 'status_options'>) {
            return new Promise<TaskCategoryModel>((resolve, reject) => {
                setTimeout(() => {
                    const targetCategory = state.taskCategories?.find((category) => category.category_id === param.category_id);
                    if (targetCategory) {
                        if (param.name) targetCategory.name = param.name;
                        if (param.description) targetCategory.description = param.description ?? '';
                        if (param.tags) targetCategory.tags = param.tags ?? {};
                        if (param.package_id) targetCategory.package_id = param.package_id;
                        resolve(targetCategory);
                    } else {
                        reject(new Error('Category not found'));
                    }
                }, 1000);
            });
        },
    };
    return {
        state,
        getters,
        ...actions,
    };
});
