/* eslint-disable camelcase */
import {
    ActionAPI,
    CreateAction, GetAction, ListAction, RawParameterAction, Resource,
    ResourceActions, SingleDeleteAction, UpdateAction,
} from '@/lib/fluent-api/toolset';
import {
    DataSourceItem,
    FilterItem,
    ListType, QueryActionState, Tags, TimeStamp,
} from '@/lib/fluent-api/type';

export type ExportType = 'xlsx' | 'csv';

export interface ExcelExportOptions {
    timeZone?:string
    fileType?: ExportType
    numberColumn?: boolean
    fileName?:string
    includeDate?:boolean
    sheetName?:string
    currentPage?: boolean
}

export interface ExcelExportApiState {
    url: string;
    param:any;
    templateOptions: ExcelExportOptions;
    dataSource: DataSourceItem[];
}

export interface ExcelExportResp {
    file_link:string
}



export class Export extends ActionAPI<any, ExcelExportResp> {
    path = 'export';

    protected apiState: ExcelExportApiState ;

    constructor(baseUrl: string, initState:ExcelExportApiState={} as ExcelExportApiState, transformer: null|((any) => any) = null) {
        super(baseUrl, undefined, transformer);
        this.apiState = {
            url: '',
            param:{},
            templateOptions:{},
            dataSource:[],
            ...initState
        };
    }

    getParameter = ()=>{
        return {
            source:{
                url:this.apiState.url,
                param:this.apiState.param
            },
            template:{
                options:this.apiState.templateOptions,
                data_source:this.apiState.dataSource
            }

        }
    };

    setUrl(url: string){
        this.apiState.url =  url;
        return this.clone();
    }
    setParam(param: any){
        this.apiState.param =  param;
        return this.clone();
    }
    setTimeZone(timeZone: string){
        this.apiState.templateOptions.timeZone = timeZone;
        return this.clone();
    }
    setFileType(fileType: ExportType){
        this.apiState.templateOptions.fileType = fileType;
        return this.clone();
    }
    setNumberColumn(value: boolean){
        this.apiState.templateOptions.numberColumn = value;
        return this.clone();
    }
    setFileName(fileName: string){
        this.apiState.templateOptions.fileName = fileName;
        return this.clone();
    }
    setIncludeDate(value: boolean){
        this.apiState.templateOptions.includeDate = value;
        return this.clone();
    }
    setSheetName(sheetName: string) {
        this.apiState.templateOptions.sheetName = sheetName;
        return this.clone();
    }
    setCurrentPage(value: boolean){
        this.apiState.templateOptions.currentPage = value;
        return this.clone();
    }

    setDataSource(dataSource: DataSourceItem[]){
        this.apiState.dataSource = dataSource;
        return this.clone();
    }
}
export default class Excel extends Resource implements ResourceActions<'export'> {
    protected name = 'excel';

    export() { return new Export(this.baseUrl); }

}
