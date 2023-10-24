export type VariableModelLabel = 'cost'|'asset';
export interface BaseVariableModelConfig {
    key: string;
    name?: string;
    labels?: VariableModelLabel[];
}
export interface BaseListOptions {
    search?: string;
    limit?: number;
}

export abstract class BaseVariableModel<Config extends BaseVariableModelConfig, ListOptions extends BaseListOptions, > {
    key: string; // e.g. 'cost_data_source'

    name: string; // 'Data Source'

    labels: VariableModelLabel[];

    response: ListResponse = { results: [] };

    abstract modelType: VariableModelType;

    protected constructor(config: Config) {
        if (!config.key) throw new Error('VariableModelBaseConfig.key is required');
        this.key = config.key;
        this.name = config.name ?? config.key;
        this.labels = config.labels ?? [];
    }

    abstract list(options?: ListOptions): Promise<ListResponse>;
}

export interface Field {
    key: string;
    name: string;
}
export interface ListResponse {
    results: Field[];
    more?: boolean;
}
export type VariableModelType = 'COMPOUND'|'ENUM'|'SEARCH_RESOURCE';
