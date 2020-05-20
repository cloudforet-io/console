from string import ascii_uppercase
from typing import List

from gspread import Worksheet

try:
    from sheet import origin_sheet, language_pack, find_lang_col, make_sort_lang, remove_keys,ID_FIELD
except Exception as e:
    from .sheet import origin_sheet, language_pack, find_lang_col, make_sort_lang, remove_keys, ID_FIELD


def add_keys(keys: List[str]):
    origin_sheet.append_rows([[k] for k in keys])


def get_range():
    col_len = len(origin_sheet.row_values(1)) - 1
    last_col = ascii_uppercase[col_len]

    def make_acel(col):
        c = col + 1
        return f'C{c}:{last_col}{c}'

    return make_acel


def make_values(lang_code: List, data: dict):
    return [[data[l] for l in lang_code]]


def make_update_records_data(worksheet: Worksheet, lang_index: dict):
    update_records_data = []
    get_acel = get_range()
    sort_lang = make_sort_lang(lang_index)
    print(sort_lang)
    for i, record in enumerate(worksheet.get_all_records()):
        data = {
            'range': get_acel(i + 1),
            'values': make_values(sort_lang, language_pack.get_all_language_value(record[ID_FIELD]))
        }
        update_records_data.append(data)
    return update_records_data


if __name__ == '__main__':
    sheet_keys = set(origin_sheet.col_values(1)[1:])
    pack_keys = set(language_pack.get_key_list())

    remove_key_ids = sheet_keys - pack_keys
    print(f'remove {len(remove_key_ids)} keys', remove_key_ids)
    remove_keys(origin_sheet, remove_key_ids)

    add_key_ids = pack_keys - sheet_keys
    print(f'add {len(add_key_ids)} keys', add_key_ids)
    add_keys(add_key_ids)

    # print(data_sheet.get_all_values())
    lang_index = find_lang_col(origin_sheet)
    print('get language index')
    print(lang_index)
    data = make_update_records_data(origin_sheet, lang_index)
    origin_sheet.batch_update(data)
    print('update all translation!\n', len(data), ' items is updated')
