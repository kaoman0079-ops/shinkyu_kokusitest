#!/usr/bin/env python3
"""Summaries/*.md を summaries.json に変換し、data.csv の分類キーと照合する。"""
import csv, glob, json, re, sys

def parse_md(path):
    subj = None
    sections = {}  # (dai, chu) -> {hitokoto, yoten[], hikkake[]}
    cur = None
    mode = None
    for line in open(path, encoding='utf-8'):
        line = line.rstrip('\n')
        if line.startswith('# '):
            subj = line[2:].strip()
        elif line.startswith('## '):
            head = line[3:].strip().replace('＞', '>')
            parts = head.split(' > ', 1)
            if len(parts) != 2:
                print(f'WARN heading parse fail: {path}: {head}')
                cur = None
                continue
            cur = {'hitokoto': '', 'yoten': [], 'hikkake': []}
            sections[(parts[0].strip(), parts[1].strip())] = cur
            mode = None
        elif cur is not None:
            if line.startswith('ひとことで：'):
                cur['hitokoto'] = line[len('ひとことで：'):].strip()
                mode = None
            elif line.startswith('要点：'):
                mode = 'yoten'
            elif line.startswith('引っかけ：'):
                mode = 'hikkake'
            elif line.startswith('- ') and mode:
                cur[mode].append(line[2:].strip())
    return subj, sections

def main():
    expected = {}
    for r in csv.DictReader(open('data.csv', encoding='utf-8-sig')):
        expected.setdefault(r['教科'], set()).add((r['大項目'], r['中項目']))
    data = {}
    total_have = 0
    for path in sorted(glob.glob('Summaries/*.md')):
        subj, sections = parse_md(path)
        if not subj:
            print(f'WARN no subject title: {path}')
            continue
        exp = expected.get(subj, set())
        got = set(sections)
        missing = exp - got
        extra = got - exp
        empty = [k for k, v in sections.items() if not v['hitokoto'] or not v['yoten']]
        print(f'{subj}: {len(got)}/{len(exp)} 分野'
              + (f' 不足{len(missing)}' if missing else '')
              + (f' 余分{len(extra)}' if extra else '')
              + (f' 空欄{len(empty)}' if empty else ''))
        for k in sorted(extra):
            print(f'  EXTRA: {k}')
        for k in sorted(missing):
            print(f'  MISSING: {k}')
        data[subj] = {f'{d} > {c}': v for (d, c), v in sections.items()}
        total_have += len(got & exp)
    total_exp = sum(len(v) for v in expected.values())
    with open('summaries.json', 'w', encoding='utf-8') as fh:
        json.dump(data, fh, ensure_ascii=False, indent=1)
    print(f'TOTAL: {total_have}/{total_exp} 分野を summaries.json に出力')

if __name__ == '__main__':
    main()
