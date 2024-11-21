import { asyncComputed } from '@vueuse/core';
import type { Ref, DeepReadonly } from 'vue';
import { reactive } from 'vue';

import { defineStore } from 'pinia';

import type { TaskCategoryCreateParameters } from '@/schema/opsflow/task-category/api-verbs/create';
import type { TaskCategoryUpdateParameters } from '@/schema/opsflow/task-category/api-verbs/update';
import type { TaskCategoryModel } from '@/schema/opsflow/task-category/model';


interface UseTaskCategoryStoreState {
    loading: boolean;
    items?: TaskCategoryModel[];
}
interface UseTaskCategoryStoreGetters {
    taskCategories: Ref<DeepReadonly<TaskCategoryModel[]>>
}

export const useTaskCategoryStore = defineStore('task-category', () => {
    const state = reactive<UseTaskCategoryStoreState>({
        loading: false,
        items: undefined,
    }) as UseTaskCategoryStoreState;

    const getters = reactive<UseTaskCategoryStoreGetters>({
        taskCategories: asyncComputed<TaskCategoryModel[]>(async () => {
            if (state.items === undefined) {
                await actions.fetchCategories();
            }
            return state.items ?? [];
        }, [], { lazy: true }),
    });

    const actions = {
        async fetchCategories() {
            return new Promise<void>((resolve) => {
                state.loading = true;
                setTimeout(() => {
                    state.items = [
                        {
                            category_id: 'category_1',
                            package_id: 'package_1',
                            name: 'Billing and Payment',
                            description: '빌링 및 결제와 관련된 문의사항',
                            status_options: {
                                TODO: [
                                    {
                                        status_id: 'todo_1',
                                        name: '요청',
                                        color: 'gray',
                                        is_default: true,
                                    },
                                ],
                                IN_PROGRESS: [
                                    {
                                        status_id: 'in_progress_1',
                                        name: '진행중',
                                        color: 'blue',
                                        is_default: true,
                                    },
                                ],
                                COMPLETED: [
                                    {
                                        status_id: 'complete_1',
                                        name: '완료',
                                        color: 'green',
                                        is_default: true,
                                    },
                                    {
                                        status_id: 'complete_2',
                                        name: '보류',
                                        color: 'yellow',
                                        is_default: false,
                                    },
                                    {
                                        status_id: 'complete_3',
                                        name: '취소',
                                        color: 'red',
                                        is_default: false,
                                    },
                                ],
                            },
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
                            status_options: {
                                TODO: [
                                    {
                                        status_id: 'todo_1',
                                        name: '요청',
                                        color: 'gray',
                                        is_default: true,
                                    },
                                ],
                                IN_PROGRESS: [
                                    {
                                        status_id: 'in_progress_1',
                                        name: '확인중',
                                        color: 'yellow',
                                        is_default: true,
                                    },
                                    {
                                        status_id: 'in_progress_2',
                                        name: '진행중',
                                        color: 'blue',
                                        is_default: false,
                                    },
                                ],
                                COMPLETED: [
                                    {
                                        status_id: 'complete_1',
                                        name: '완료',
                                        color: 'green',
                                        is_default: true,
                                    },
                                ],
                            },
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
                            status_options: {
                                TODO: [
                                    {
                                        status_id: 'todo_1',
                                        name: '요청',
                                        color: 'gray',
                                        is_default: true,
                                    },
                                ],
                                IN_PROGRESS: [
                                    {
                                        status_id: 'in_progress_1',
                                        name: '진행중',
                                        color: 'blue',
                                        is_default: false,
                                    },
                                ],
                                COMPLETED: [
                                    {
                                        status_id: 'complete_1',
                                        name: '완료',
                                        color: 'green',
                                        is_default: true,
                                    },
                                ],
                            },
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
            return new Promise<TaskCategoryModel>((resolve) => {
                const result: TaskCategoryModel = {
                    category_id: `category_${(getters.taskCategories.length) + 1}`,
                    package_id: param.package_id,
                    name: param.name,
                    description: param.description ?? '',
                    status_options: {
                        TODO: [
                            {
                                status_id: 'todo_1',
                                name: '요청',
                                color: 'gray',
                                is_default: true,
                            },
                        ],
                        IN_PROGRESS: [
                            {
                                status_id: 'in_progress_1',
                                name: '진행중',
                                color: 'blue',
                                is_default: true,
                            },
                        ],
                        COMPLETED: [
                            {
                                status_id: 'complete_1',
                                name: '완료',
                                color: 'green',
                                is_default: true,
                            },
                        ],
                    },
                    fields: [],
                    domain_id: '1',
                    created_at: '2021-09-01T00:00:00',
                    updated_at: '2021-09-01T00:00:00',
                    tags: param.tags ?? {},
                };
                state.items?.push(result);
                resolve(result);
            });
        },
        async updateCategory(param: Omit<TaskCategoryUpdateParameters, 'status_options'>) {
            return new Promise<TaskCategoryModel>((resolve, reject) => {
                setTimeout(() => {
                    const targetCategory = state.items?.find((category) => category.category_id === param.category_id);
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
