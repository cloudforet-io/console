export interface RoleDeleteParameters {
    role_binding_id: string;
    workspace_id?: string;
    // TODO: will be removed after the backend is ready
    domain_id: string;
}
