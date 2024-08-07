<script setup lang="ts">
import { reactive, computed } from 'vue';

import { PHeading, PDataTable } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

const state = reactive({
    loading: false,
    fields: computed(() => ([
        { name: 'user_id', label: 'User ID', sortable: false },
        { name: 'name', label: 'Name', sortable: false },
        { name: 'state', label: 'State', sortable: false },
    ])),
    data: computed(() => ([{
        // TODO: 임시데이터, API 개발 완료시 수정 필요
        user_id: 'user01@spaceone.org',
        name: 'User01',
        state: 'Enabled',
    }])),
});
</script>

<template>
    <div class="user-group-tab-workspaces">
        <p-heading heading-type="sub"
                   :title="i18n.t('IAM.USERGROUP.MAIN.WORKSPACE')"
        />
        <p-data-table :fields="state.fields"
                      :items="state.data"
        >
            <template #col-user_id-format="{value}">
                <span class="user-id-wrapper">
                    {{ value }}
                </span>
            </template>
            <template #col-name-format="{value}">
                {{ value }}
            </template>
            <template #col-state-format="{value}">
                {{ value }}
            </template>
        </p-data-table>
    </div>
</template>

<style lang="postcss" scoped>
.user-group-tab-workspaces {
    .toolbox-wrapper {
        .toolbox {
            @apply flex;
            gap: 0.5rem;
            .button-label {
                line-height: 1rem;
            }
        }
    }
}
</style>
