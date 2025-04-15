// Base Model
interface DashboardGlobalVariableBase {
    key: string; // new_variable
    name: string; // New Variable
    method: 'manual'|'dynamic';
    type: 'reference' | 'number' | 'text';
    created_by?: string;
    use?: boolean;
}

export interface ReferenceVariable extends DashboardGlobalVariableBase {
    method: 'dynamic';
    type: 'reference';
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
export interface TextAnyVariable extends DashboardGlobalVariableBase {
    method: 'manual';
    type: 'text';
    valueType: 'any';
    options: {
        defaultValue?: string;
    }
}

// 'number' type / 'any' valueType
export interface NumberAnyVariable extends DashboardGlobalVariableBase {
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
export interface TextEnumVariable extends DashboardGlobalVariableBase {
    method: 'manual';
    type: 'text';
    valueType: 'enum';
    values: Array<{label: string; key: string;}>;
    options: {
        selectionType: 'multi'|'single';
    }
}

// 'number' type / 'enum' valueType
export interface NumberEnumVariable extends DashboardGlobalVariableBase {
    method: 'manual';
    type: 'number';
    valueType: 'enum';
    values: Array<{label: string; key: number;}>;
    options: {
        selectionType: 'multi'|'single';
    }
}

// Model
export type ManualVariable = TextAnyVariable|NumberAnyVariable|TextEnumVariable|NumberEnumVariable;
export type DashboardGlobalVariable =
    | ReferenceVariable
    | TextAnyVariable
    | NumberAnyVariable
    | TextEnumVariable
    | NumberEnumVariable;



