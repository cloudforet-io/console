# this file for sync translation in github workflow
import base64
import json
import os
import tempfile
from operator import itemgetter
from os import path, environ
from string import ascii_uppercase
from typing import List

import gspread
from gspread import Worksheet

SHEET_URL = environ.get('SHEET_URL',
                        'https://docs.google.com/spreadsheets/d/1K81JbXNLtui93caZu_MyQdy8lv5qxyo69AvlKRA98bM')
CREDENTIAL_BASE64 = environ.get('CREDENTIAL_BASE64')
if not CREDENTIAL_BASE64:
    raise Exception('you must set google service account json key encode to base64 and set CREDENTIAL_BASE64 Env')

DATA_SHEET_NAME = environ.get('DATA_SHEET_NAME', 'origin')
SYNC_SHEET_NAME = environ.get('SYNC_SHEET_NAME', 'data')
META_SHEET_NAME = environ.get('META_SHEET_NAME', 'meta')
UNSYNC_FIELD = environ.get('UNSYNC_FIELD', 'unsync')
ID_FIELD = environ.get('ID_FIELD', 'Translation ID')
_lazy_gc = None


def load_credential():
    key_path = path.join(tempfile.gettempdir(), 'key.json')
    txt = base64.b64decode(CREDENTIAL_BASE64.encode('UTF-8')).decode('UTF-8')
    with open(key_path, mode='w') as f:
        f.write(txt)

    return key_path


CREDENTIAL_PATH = load_credential()


def get_client():
    global _lazy_gc
    if not _lazy_gc:
        _lazy_gc = gspread.service_account(CREDENTIAL_PATH)
    return _lazy_gc


def get_sheet(url: str):
    gc = get_client()
    return gc.open_by_url(url)


LANGUAGE_DIR = path.join(path.dirname(path.abspath(__file__)), 'language-pack')


def load_pack(filename):
    with open(filename, mode='r') as f:
        data = json.load(f)
    return data


def get_all_nested_keys(obj: dict, prefix: str = None):
    if type(obj) == str:
        return [prefix]
    keys = []
    for k in obj.keys():
        if prefix:
            keys += [f"{prefix}.{x}" for x in get_all_nested_keys(obj[k], k)]
        else:
            keys += get_all_nested_keys(obj[k], k)
    return keys


class LanguagePack:
    def get_language_file_path(self, lang: str):
        return path.join(LANGUAGE_DIR, f"{lang}.json")

    def __init__(self):
        self.languages = []
        for f in os.listdir(LANGUAGE_DIR):
            name, ext = f.split('.')
            if ext == 'json':
                self.languages.append(name)
        self.packs = {
            lang: load_pack(self.get_language_file_path(lang)) for lang in self.languages
        }
        self.key_list = None

    def get_value(self, lang: str, key: str):
        key_path = key.split('.')
        value = self.packs[lang]
        for p in key_path:
            try:
                value = value[p]
            except KeyError as e:
                return None
        if type(value) != str:
            return None
        return value

    def set_value(self, lang: str, key: str, value: str):
        key_path = key.split('.')
        dic = self.packs[lang]
        for key in key_path[:-1]:
            dic = dic.setdefault(key, {})
        dic[key_path[-1]] = value

    def save(self):
        for lang in self.languages:
            with open(self.get_language_file_path(lang), mode='w') as fp:
                json.dump(self.packs[lang], fp, ensure_ascii=False, sort_keys=True, indent='\t', separators=(',', ': '))

    def get_all_language_value(self, key: str):
        return {
            lang: self.get_value(lang, key) for lang in self.languages
        }

    def get_translation_value(self, lang: str, key: str):
        key_path = key.split('.')
        value = self.packs[lang]
        for p in key_path:
            try:
                value = value[p]
            except KeyError as e:
                return None
        if type(value) != str:
            return None
        return value

    def get_key_list(self):
        if not self.key_list:
            self.key_list = get_all_nested_keys(self.packs.get('en') or self.packs.get(self.languages[0]))
        return self.key_list


language_pack = LanguagePack()
print(language_pack.packs)
spread_sheet = get_sheet(SHEET_URL)


def get_work_sheet(name):
    return get_sheet(SHEET_URL).worksheet(name)


origin_sheet = get_work_sheet(DATA_SHEET_NAME)
sync_sheet = get_work_sheet(SYNC_SHEET_NAME)
meta_sheet = get_work_sheet(META_SHEET_NAME)


def find_lang_start_col(sheet: Worksheet):
    raw_sheet_lang = sheet.row_values(1)
    min_index = None
    for x in language_pack.languages:
        try:
            i = raw_sheet_lang.index(x)
            min_index = i if min_index > i else min_index
        except Exception as e:
            pass
    if min_index:
        start_lang_idx = min_index + 1
    else:
        start_lang_idx = len(raw_sheet_lang) + 1
    return start_lang_idx


def sync_lang(sheet: Worksheet):
    raw_sheet_lang = sheet.row_values(1)
    sheet_lang = set(raw_sheet_lang)
    origin_lang = set(language_pack.languages)
    empty_langs = origin_lang - sheet_lang
    if empty_langs:
        data = [raw_sheet_lang + list(empty_langs)]
        acell = f'A1:{ascii_uppercase[len(data[0]) - 1]}1'
        print(f'update {acell} to ', data)
        sheet.update(acell, data)


def find_lang_col(sheet: Worksheet, sync=True):
    if sync:
        sync_lang(sheet)
    return {
        lang: sheet.find(lang, in_row=1).col for lang in language_pack.languages
    }


def make_sort_lang(lang_index: dict):
    sort_data = sorted([{'lang': k, 'index': v} for k, v in lang_index.items()], key=itemgetter('index'))
    return [i['lang'] for i in sort_data]


def remove_keys(sheet: Worksheet, keys: List[str]):
    rows = []
    remove_keys = []
    for k in keys:
        try:
            cell = sheet.find(k, in_column=1)
            rows.append(cell.row)
            remove_keys.append(k)
        except Exception as e:
            pass
    if rows:
        sheet.delete_rows(rows)
        print(f'remove {len(rows)} keys')
        print(remove_keys)
