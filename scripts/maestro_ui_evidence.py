"""Pure, bounded review aid for a Settings Maestro flow; never grants acceptance."""
from __future__ import annotations

import datetime as dt
import re

APP = 'com.apple.Preferences'
EVENT = re.compile(
    r"^(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d\.\d+[+-]\d{4}).*"
    r"\[(Start|Done)\] View hierarchy snapshot for Application '([^']+)'"
)


def _result(disposition, reasons, **detail):
    return {'acceptance': False, 'disposition': disposition, 'reasons': reasons, **detail}


def _metadata(item):
    if not isinstance(item, dict) or not isinstance(item.get('command'), dict):
        raise ValueError('command entry is not an object')
    meta = item.get('metadata')
    if not isinstance(meta, dict):
        raise ValueError('command metadata missing')
    stamp, duration = meta.get('timestamp'), meta.get('duration')
    if (type(stamp) is not int or not 946684800000 <= stamp <= 4102444800000 or
            type(duration) is not int or not 0 <= duration <= 120000):
        raise ValueError('command timestamp or duration invalid')
    if len(item['command']) != 1:
        raise ValueError('command shape invalid')
    return next(iter(item['command'])), meta, stamp, duration


def _get(value, *keys):
    for key in keys:
        if not isinstance(value, dict):
            return None
        value = value.get(key)
    return value


def assess_settings_evidence(commands, xctest_log):
    """Require matched, timed Preferences hierarchy work; visual proof stays separate."""
    if (not isinstance(commands, list) or not 1 <= len(commands) <= 64 or
            not isinstance(xctest_log, str) or len(xctest_log) > 2 * 1024 * 1024):
        return _result('invalid_evidence', ['input type or size bound violated'])
    parsed = []
    try:
        for item in commands:
            name, meta, stamp, duration = _metadata(item)
            parsed.append((name, item['command'][name], meta, stamp, duration))
        if any(parsed[i][3] + parsed[i][4] > parsed[i+1][3] for i in range(len(parsed)-1)):
            raise ValueError('command timestamps overlap or are not monotonic')
        if any(not isinstance(row[1], dict) for row in parsed):
            raise ValueError('command payload is not an object')
        for name, payload, *_ in parsed:
            if name == 'applyConfigurationCommand' and not isinstance(payload.get('config'), dict):
                raise ValueError('configuration payload malformed')
            if name == 'assertConditionCommand' and not isinstance(_get(payload, 'condition', 'visible'), dict):
                raise ValueError('assertion condition malformed')
    except ValueError as error:
        return _result('invalid_evidence', [str(error)])
    if any(row[2].get('status') != 'COMPLETED' for row in parsed):
        return _result('failed_command', ['one or more Maestro commands did not complete'])
    names = [row[0] for row in parsed]
    core = names[1:] if names and names[0] == 'defineVariablesCommand' else names
    if core not in (['applyConfigurationCommand','assertConditionCommand','takeScreenshotCommand'],
                    ['applyConfigurationCommand','launchAppCommand','assertConditionCommand','takeScreenshotCommand']):
        return _result('invalid_evidence', ['unsupported Settings command sequence'])
    config = parsed[1] if names[0] == 'defineVariablesCommand' else parsed[0]
    if _get(config[1], 'config', 'appId') != APP:
        return _result('insufficient_evidence', ['Preferences configuration missing'])
    index = names.index('assertConditionCommand')
    assertion = parsed[index]
    if _get(assertion[1], 'condition', 'visible', 'textRegex') != 'Settings':
        return _result('insufficient_evidence', ['Settings-title assertion missing'])
    if str(assertion[1].get('timeout')) != '5000':
        return _result('insufficient_evidence', ['Settings assertion timeout differs from 5000 ms'])
    screenshot = parsed[-1]
    if screenshot[1].get('path') != 'settings-probe-1':
        return _result('insufficient_evidence', ['following completed Settings screenshot metadata missing'])
    launches = [row for row in parsed if row[0] == 'launchAppCommand']
    if launches and launches[0][1].get('appId') != APP:
        return _result('insufficient_evidence', ['unexpected launchApp command'])
    start_ms, end_ms = assertion[3], assertion[3] + assertion[4]
    if screenshot[3] < end_ms:
        return _result('invalid_evidence', ['screenshot precedes assertion completion'])
    lines = xctest_log.splitlines()
    if len(lines) > 20000 or any(len(line) > 4096 for line in lines):
        return _result('invalid_evidence', ['XCTest log line bound violated'])
    pending = {}
    pairs = []
    prior_ms = None
    try:
        for number, line in enumerate(lines, 1):
            match = EVENT.search(line)
            if not match and ('[Start] View hierarchy snapshot for Application' in line or
                              '[Done] View hierarchy snapshot for Application' in line):
                raise ValueError(f'malformed hierarchy event at line {number}')
            if not match:
                continue
            stamp, phase, app = match.groups()
            moment = int(dt.datetime.strptime(stamp, '%Y-%m-%d %H:%M:%S.%f%z').timestamp() * 1000)
            if prior_ms is not None and moment < prior_ms:
                raise ValueError('XCTest hierarchy timestamps are not monotonic')
            prior_ms = moment
            if phase == 'Start':
                if app in pending:
                    raise ValueError('overlapping hierarchy starts for one application')
                pending[app] = (number, moment)
            elif app in pending:
                first_line, first_ms = pending.pop(app)
                if moment < first_ms:
                    raise ValueError('XCTest snapshot finish precedes start')
                pairs.append({'app': app, 'start_line': first_line, 'done_line': number,
                              'start_ms': first_ms, 'done_ms': moment})
    except ValueError as error:
        return _result('invalid_evidence', [f'XCTest timestamp invalid: {error}'])
    detail = {'assertion_start_ms': start_ms, 'assertion_end_ms': end_ms,
              'screenshot_command_ms': screenshot[3]}
    matching = [pair for pair in pairs if pair['app'] == APP and
                pair['start_ms'] >= start_ms and pair['done_ms'] <= end_ms]
    if not matching:
        return _result('insufficient_evidence',
                       ['no completed Preferences hierarchy snapshot lies within Settings assertion; this does not prove launch or matching failed'],
                       **detail)
    return _result('requires_visual_review',
                   ['Preferences hierarchy work lies within the assertion, but command and log evidence do not prove rendered UI'],
                   preferences_snapshot=matching[0], **detail)
