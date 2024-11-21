import { reactive } from 'vue';

import { defineStore } from 'pinia';

import type { TaskTypeModel } from '@/schema/opsflow/task-type/model';

import getRandomId from '@/lib/random-id-generator';

interface UseTaskTypeStoreState {
    taskTypes?: TaskTypeModel[];
}

export const useTaskTypeDataStore = defineStore('task-type', () => {
    const state = reactive<UseTaskTypeStoreState>({
        taskTypes: [
            {
                task_type_id: 'task_type_1',
                name: 'Account',
                description: '계정과 관련된 문의사항',
                assignee: 'wanjin@mz.co.kr',
                fields: [
                    {
                        field_id: getRandomId(),
                        name: '제목',
                        field_type: 'TEXT',
                        is_required: true,
                        is_primary: true,
                    },
                    {
                        field_id: getRandomId(),
                        name: '설명',
                        field_type: 'PARAGRAPH',
                        is_required: false,
                        is_primary: true,
                    },
                ],
                category_id: 'category_1',
                tags: {},
                domain_id: '1',
                created_at: '2021-09-01T00:00:00',
                updated_at: '2021-09-01T00:00:00',
            },
            {
                task_type_id: 'task_type_2',
                name: 'Invoice',
                description: '청구서와 관련된 문의사항',
                assignee: 'bokjang@mz.co.kr',
                fields: [
                    {
                        field_id: getRandomId(),
                        name: '제목',
                        field_type: 'TEXT',
                        is_required: true,
                        is_primary: true,
                    },
                    {
                        field_id: getRandomId(),
                        name: '설명',
                        field_type: 'PARAGRAPH',
                        is_required: true,
                        is_primary: true,
                    },
                    {
                        field_id: getRandomId(),
                        name: '서비스',
                        field_type: 'DROPDOWN',
                        options: ['서비스1', '서비스2', '서비스3'],
                        is_required: false,
                    },
                    {
                        field_id: getRandomId(),
                        name: '연결된 자산',
                        field_type: 'ASSET',
                        is_required: false,
                    },
                    {
                        field_id: getRandomId(),
                        name: '담당자',
                        field_type: 'USER',
                        is_required: false,
                    },
                ],
                category_id: 'category_1',
                tags: {},
                domain_id: '1',
                created_at: '2021-09-01T00:00:00',
                updated_at: '2021-09-01T00:00:00',
            },
            {
                task_type_id: 'task_type_3',
                name: 'Billing',
                description: '빌링과 관련된 문의사항',
                fields: [
                    {
                        field_id: getRandomId(),
                        name: '제목',
                        field_type: 'TEXT',
                        is_required: true,
                        is_primary: true,
                    },
                    {
                        field_id: getRandomId(),
                        name: '설명',
                        field_type: 'PARAGRAPH',
                        is_required: false,
                        is_primary: false,
                    },
                ],
                category_id: 'category_2',
                tags: {},
                domain_id: '1',
                created_at: '2021-09-01T00:00:00',
                updated_at: '2021-09-01T00:00:00',
            },
        ],
    }) as UseTaskTypeStoreState;
    const actions = {};
    return {
        state,
        ...actions,
    };
});
