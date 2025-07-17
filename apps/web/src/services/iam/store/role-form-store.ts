import { reactive } from 'vue';

import { defineStore } from 'pinia';

export const useRoleFormStore = defineStore('role-form', () => {
    const state = reactive({
        form: {
            name: '',
            role_type: '',
            permissions: [] as string[],
            page_access: [] as string[],
            role_id: '',
        },
    });

    const actions = reactive({
        setName(name: string) {
            state.form.name = name;
        },
        setRoleType(roleType: string) {
            state.form.role_type = roleType;
        },
        setPermissions(permissions: string[]) {
            state.form.permissions = permissions;
        },
        setPageAccess(pageAccess: string[]) {
            state.form.page_access = pageAccess;
        },
        setRoleId(roleId: string) {
            state.form.role_id = roleId;
        },
    });

    return {
        state,
        actions,
    };
});
