try:
    from sheet import sync_sheet, language_pack, remove_keys, UNSYNC_FIELD, ID_FIELD
except Exception as e:
    from .sheet import sync_sheet, language_pack, remove_keys, UNSYNC_FIELD, ID_FIELD

if __name__ == '__main__':
    sheet_keys = set(sync_sheet.col_values(1)[1:])
    print(sync_sheet.title,sync_sheet.url)
    pack_keys = set(language_pack.get_key_list())
    remove_keys(sync_sheet, sheet_keys - pack_keys)
    records = sync_sheet.get_all_records()
    for record in records:
        if record[ID_FIELD] and record[UNSYNC_FIELD] != 'TRUE':
            print(record)
            for k in record.keys():
                if k in language_pack.languages:
                    language_pack.set_value(k, record[ID_FIELD], record[k])
                    # print('update', k, record[ID_FIELD])
    language_pack.save()
