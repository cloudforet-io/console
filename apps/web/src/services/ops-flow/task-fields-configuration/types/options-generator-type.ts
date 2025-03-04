import type { TaskFieldOptions } from '@/api-clients/opsflow/_types/task-field-type';

export interface OptionsGeneratorProps<Options extends TaskFieldOptions> {
    options: Options;
    editable?: boolean;
}

export interface OptionsGeneratorEmit<Options extends TaskFieldOptions> {
    (event: 'update:options', value: Options): void;
    (event: 'update:is-valid', value: boolean, invalidText?: string): void;
}
