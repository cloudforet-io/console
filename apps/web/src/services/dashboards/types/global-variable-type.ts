// Base Model
interface DashboardGlobalVariableBase {
    management: 'custom'|'managed';
    key: string; // new_variable
    name: string; // New Variable
    type: 'text'|'number'|'reference';
}

interface ReferenceVariable extends DashboardGlobalVariableBase {
    type: 'reference';
    reference?: 'cost'|'asset';
    referenceKey: string;
    dataKey: string;
    options: {
        selectionType: 'multi'|'single';
    }
}

// 'text' type / 'any' valueType
interface TextAnyVariable extends DashboardGlobalVariableBase {
    type: 'text';
    valueType: 'any';
    options: {
        defaultValue?: string;
    }
}

// 'number' type / 'any' valueType
interface NumberAnyVariable extends DashboardGlobalVariableBase {
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
    type: 'text';
    valueType: 'enum';
    values: Array<{label: string; key: string;}>;
    options: {
        selectionType: 'multi'|'single';
    }
}

// 'number' type / 'enum' valueType
interface NumberEnumVariable extends DashboardGlobalVariableBase {
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


