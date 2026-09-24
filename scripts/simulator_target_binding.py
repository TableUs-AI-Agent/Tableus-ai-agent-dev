"""Pure target binding from a target-scoped simulator app launch and host process rows."""
from __future__ import annotations

import re

TARGET = re.compile(r'[0-9A-F]{8}(?:-[0-9A-F]{4}){3}-[0-9A-F]{12}')
APP = 'com.apple.Preferences'
PREFERENCES_SUFFIX = '/Applications/Preferences.app/Preferences'
SPRINGBOARD_SUFFIX = '/System/Library/CoreServices/SpringBoard.app/SpringBoard'


class BindingError(ValueError):
    """The retained rows do not prove one exact target identity."""


def _index(rows):
    values = rows.values() if isinstance(rows, dict) else rows
    if not isinstance(rows, (dict, list, tuple)):
        raise BindingError('host rows must be a mapping or sequence')
    result = {}
    for row in values:
        if (not isinstance(row, dict) or type(row.get('pid')) is not int or row['pid'] <= 0 or
                type(row.get('ppid')) is not int or row['ppid'] < 0 or
                not isinstance(row.get('lstart'), str) or not row['lstart'] or
                not isinstance(row.get('comm'), str) or not row['comm']):
            raise BindingError('malformed host process row')
        if row['pid'] in result:
            raise BindingError('duplicate host PID row')
        result[row['pid']] = {key: row[key] for key in ('pid','ppid','lstart','comm')}
    return result


def _paths(runtime_root):
    if (not isinstance(runtime_root, str) or not runtime_root.startswith('/Library/Developer/CoreSimulator/Volumes/') or
            '/RuntimeRoot' != runtime_root[-12:] or '..' in runtime_root.split('/')):
        raise BindingError('pinned runtime root malformed')
    return runtime_root + PREFERENCES_SUFFIX, runtime_root + SPRINGBOARD_SUFFIX


def bind_from_target_launch(before_rows, after_rows, launch_record, device_uuid, runtime_root):
    """Bind only after exact-UUID Preferences launch; no host-only UUID inference."""
    if not isinstance(device_uuid, str) or not TARGET.fullmatch(device_uuid):
        raise BindingError('exact target UUID malformed')
    if not isinstance(launch_record, dict):
        raise BindingError('launch record missing')
    expected = ['xcrun','simctl','launch',device_uuid,APP]
    pid = launch_record.get('settings_pid')
    seconds = launch_record.get('elapsed_seconds')
    if (launch_record.get('command') != expected or launch_record.get('exit_code') != 0 or
            launch_record.get('timed_out') is not False or launch_record.get('error') or
            type(pid) is not int or pid <= 0 or type(seconds) not in (int,float) or
            not 0 <= seconds <= 30 or
            launch_record.get('stdout','').strip() != f'{APP}: {pid}'):
        raise BindingError('target-scoped Preferences launch proof invalid')
    before, after = _index(before_rows), _index(after_rows)
    if pid in before:
        raise BindingError('launch PID existed before target launch')
    settings = after.get(pid)
    preferences_path, springboard_path = _paths(runtime_root)
    if settings is None or settings['comm'] != preferences_path:
        raise BindingError('launched Preferences PID/executable missing from host rows')
    parent = after.get(settings['ppid'])
    if parent is None or parent['comm'] != 'launchd_sim' or parent['ppid'] != 1:
        raise BindingError('launched Preferences has no unique launchd_sim parent')
    siblings = [row for row in after.values() if row['ppid'] == parent['pid'] and
                row['comm'] == springboard_path]
    if len(siblings) != 1:
        raise BindingError('expected exactly one runtime SpringBoard sibling')
    extra_settings = [row for row in after.values() if row['ppid'] == parent['pid'] and
                      row['comm'] == preferences_path]
    if len(extra_settings) != 1:
        raise BindingError('duplicate Preferences process under target parent')
    return {'device_uuid':device_uuid,'runtime_root':runtime_root,'preferences':settings,
            'springboard':siblings[0],'parent':parent,'basis':'exact_target_simctl_launch_pid_and_host_tree',
            'acceptance':False}


def recheck_bound(rows, bound):
    """Reject missing/reused/replaced process identity before an authorized stage."""
    indexed = _index(rows)
    preferences_path, springboard_path = _paths(bound['runtime_root'])
    for name in ('preferences','springboard','parent'):
        expected = bound[name]
        if indexed.get(expected['pid']) != expected:
            raise BindingError(f'{name} PID identity changed or vanished')
    parent_pid = bound['parent']['pid']
    if sum(row['ppid'] == parent_pid and row['comm'] == springboard_path for row in indexed.values()) != 1:
        raise BindingError('replacement or duplicate SpringBoard under target parent')
    if sum(row['ppid'] == parent_pid and row['comm'] == preferences_path for row in indexed.values()) != 1:
        raise BindingError('replacement or duplicate Preferences under target parent')
    return True
