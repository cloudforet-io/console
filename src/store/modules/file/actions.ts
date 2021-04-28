import { ExcelDataField, FileState } from '@/store/modules/file/type';
import { SpaceConnector } from '@/lib/space-connector';
import { Action } from 'vuex';
import config from '@/lib/config';

interface ExcelPayload {
    url: string;
    param: any;
    fields: ExcelDataField[];
    // eslint-disable-next-line camelcase
    sheet_name?: string;
}

export const downloadExcel: Action<FileState, any> = async ({ commit, rootState }, payload: ExcelPayload[] | ExcelPayload): Promise<void> => {
    try {
        let params;
        if (Array.isArray(payload)) {
            params = payload.map(({
                // eslint-disable-next-line camelcase
                url, param, fields, sheet_name,
            }) => ({
                source: {
                    url,
                    param,
                },
                template: {
                    options: {
                        fileType: 'xlsx', // will be deprecated
                        timezone: rootState.user.timezone,
                        // eslint-disable-next-line camelcase
                        sheet_name,
                    },
                    data_source: fields, // will be deprecated
                    fields,
                },
            }));
        } else {
            params = {
                source: {
                    url: payload.url,
                    param: payload.param,
                },
                template: {
                    options: {
                        fileType: 'xlsx', // will be deprecated
                        timezone: rootState.user.timezone,
                        // eslint-disable-next-line camelcase
                        sheet_name: payload.sheet_name,
                    },
                    data_source: payload.fields, // will be deprecated
                    fields: payload.fields,
                },
            };
        }

        const res = await SpaceConnector.client.addOns.excel.export(params);

        if (typeof res === 'string') { // defensive code for case of unexpected response from the server. will be removed
            commit('setDownloadSource', config.get('CONSOLE_API.ENDPOINT') + res);
        } else {
            commit('setDownloadSource', config.get('CONSOLE_API.ENDPOINT') + res.file_link);
        }
    } catch (e) {
        console.error(e);
    }
};
