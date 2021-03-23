import { ExcelDataField, FileState } from '@/store/modules/file/type';
import { SpaceConnector } from '@/lib/space-connector';
import { Action } from 'vuex';
import config from '@/lib/config';

export const downloadExcel: Action<FileState, any> = async ({ commit, rootState }, { url, param, fields }: {
    url: string;
    param: any;
    fields: ExcelDataField[];
}): Promise<void> => {
    try {
        const res = await SpaceConnector.client.addOns.excel.export({
            source: {
                url,
                param,
            },
            template: {
                options: {
                    fileType: 'xlsx', // will be deprecated
                    timezone: rootState.user.timezone,
                },
                data_source: fields, // will be deprecated
                fields,
            },
        });

        if (typeof res === 'string') { // defensive code for case of unexpected response from the server. will be removed
            commit('setDownloadSource', config.get('CONSOLE_API.ENDPOINT') + res);
        } else {
            commit('setDownloadSource', config.get('CONSOLE_API.ENDPOINT') + res.file_link);
        }
    } catch (e) {
        console.error(e);
    }
};
