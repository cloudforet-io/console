// Base Model
interface DashboardGlobalVariableBase {
    management: 'custom'|'managed';
    key: string; // new_variable
    name: string; // New Variable
    method: 'manual'|'dynamic';
}

interface ReferenceVariable extends DashboardGlobalVariableBase {
    method: 'dynamic';
    reference: {
        resourceType: string; // identity.User, inventory.Collector, etc..
        dataSourceId?: string;
        dataKey?: string;
    }
    options: {
        selectionType: 'multi';
    }
}

// 'text' type / 'any' valueType
interface TextAnyVariable extends DashboardGlobalVariableBase {
    method: 'manual';
    type: 'text';
    valueType: 'any';
    options: {
        defaultValue?: string;
    }
}

// 'number' type / 'any' valueType
interface NumberAnyVariable extends DashboardGlobalVariableBase {
    method: 'manual';
    type: 'number';
    valueType: 'any';
    options: {
        min: number;
        max: number;
        step?: number;
        inputType: 'input'|'slider';
    }
}

// 'text' type / 'enum' valueType
interface TextEnumVariable extends DashboardGlobalVariableBase {
    method: 'manual';
    type: 'text';
    valueType: 'enum';
    values: Array<{label: string; key: string;}>;
    options: {
        selectionType: 'multi'|'single';
    }
}

// 'number' type / 'enum' valueType
interface NumberEnumVariable extends DashboardGlobalVariableBase {
    method: 'manual';
    type: 'number';
    valueType: 'enum';
    values: Array<{label: string; key: number;}>;
    options: {
        selectionType: 'multi'|'single';
    }
}

// Model
export type DashboardGlobalVariableModel =
    | ReferenceVariable
    | TextAnyVariable
    | NumberAnyVariable
    | TextEnumVariable
    | NumberEnumVariable;


