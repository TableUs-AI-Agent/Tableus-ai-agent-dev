"""Bounded, registered Maestro/XCTest observations; no native commands or signals here."""
from __future__ import annotations

import datetime as dt
import hashlib
import itertools
import json
import os
import re
import shlex
import signal
import stat
import tempfile
from pathlib import Path

MAX_FILES = 512
MAX_DEPTH = 20
MAX_LOG_BYTES = 512 * 1024
MAX_RETAINED_FILES = 32
MAX_RETAINED_BYTES = 8 * 1024 * 1024
MAX_SNAPSHOTS = 512
MAX_SNAPSHOT_BYTES = 32 * 1024 * 1024
MAX_OBSERVATION_BYTES = 256 * 1024
MAX_INVOCATION_BYTES = 16 * 1024
FAILURES = (
    'Test crashed with signal kill before establishing connection',
    'Early unexpected exit, operation never finished bootstrapping',
)
SIMCTL = '/Library/Developer/PrivateFrameworks/CoreSimulator.framework/Versions/A/Resources/bin/simctl'
_LATCHED: dict[str, dict] = {}


class EvidenceError(RuntimeError):
    """Evidence or ownership cannot be established; caller must stop."""


def _real_directory(path: Path) -> Path:
    if path.is_symlink() or not path.is_dir():
        raise EvidenceError(f'unsafe or missing registered directory: {path}')
    real = path.resolve(strict=True)
    if real.stat().st_mode & 0o077:
        raise EvidenceError('registered flow directory is not private')
    return real


def _no_symlink(path: Path, root: Path) -> None:
    if not path.is_relative_to(root):
        raise EvidenceError('path escapes registered root')
    for part in (root, *[root.joinpath(*path.relative_to(root).parts[:n])
                         for n in range(1, len(path.relative_to(root).parts) + 1)]):
        try:
            if stat.S_ISLNK(part.lstat().st_mode):
                raise EvidenceError(f'symlink within registered root: {part}')
        except FileNotFoundError:
            continue


def _bounded_json(path: Path, limit: int = MAX_INVOCATION_BYTES) -> dict:
    if not path.is_file() or path.stat().st_size > limit:
        raise EvidenceError(f'missing or oversized registration: {path}')
    value = json.loads(path.read_bytes())
    if not isinstance(value, dict):
        raise EvidenceError('registration must be an object')
    return value


def registration(flow_root: str | Path) -> dict:
    root = _real_directory(Path(flow_root))
    invocation = root / 'operator-invocation.json'
    _no_symlink(invocation, root)
    value = _bounded_json(invocation)
    if value.get('schema_version') != 1:
        raise EvidenceError('unsupported invocation schema')
    device = value.get('device_id')
    when = value.get('started_at')
    flow = value.get('flow_path')
    digest = value.get('flow_sha256')
    if not (isinstance(device, str) and re.fullmatch(r'[0-9A-Fa-f]{8}(?:-[0-9A-Fa-f]{4}){3}-[0-9A-Fa-f]{12}', device) and
            isinstance(when, str) and isinstance(flow, str) and
            isinstance(digest, str) and re.fullmatch(r'[0-9a-f]{64}', digest)):
        raise EvidenceError('registration missing exact device/time/flow/hash')
    try:
        started = dt.datetime.fromisoformat(when.replace('Z', '+00:00'))
    except ValueError as error:
        raise EvidenceError('invalid invocation start time') from error
    if started.tzinfo is None or not Path(flow).is_absolute():
        raise EvidenceError('invocation needs timezone and absolute flow path')
    for key, expected in (('root', root), ('tmp_root', root/'tmp'), ('debug_root', root/'debug-output')):
        if key in value and Path(value[key]).resolve(strict=False) != expected:
            raise EvidenceError(f'{key} registration binding mismatch')
    flow_path = Path(flow)
    if flow_path.is_symlink() or not flow_path.is_file() or flow_path.stat().st_size > 2 * 1024 * 1024:
        raise EvidenceError('unsafe or missing registered flow')
    if hashlib.sha256(flow_path.read_bytes()).hexdigest() != digest:
        raise EvidenceError('registered flow hash changed')
    for name in ('tmp', 'debug-output', 'xctest-observation.json', 'xctest-collector-cleanup.json'):
        _no_symlink(root / name, root)
    return {'root': root, 'tmp': root / 'tmp', 'debug': root / 'debug-output',
            'declared_root': Path(flow_root), 'declared_tmp': Path(flow_root) / 'tmp',
            'device_id': device, 'started_at': started.astimezone(dt.timezone.utc),
            'flow_path': str(flow_path), 'flow_sha256': digest}


def _write_private(path: Path, value: dict) -> None:
    _no_symlink(path, path.parent)
    raw = (json.dumps(value, sort_keys=True, indent=2) + '\n').encode()
    fd, temp = tempfile.mkstemp(prefix='.xctest-', dir=path.parent)
    try:
        os.fchmod(fd, 0o600)
        with os.fdopen(fd, 'wb') as output:
            output.write(raw)
            output.flush()
            os.fsync(output.fileno())
        os.replace(temp, path)
    except BaseException:
        try:
            os.unlink(temp)
        except FileNotFoundError:
            pass
        raise


def _recognized_logs(reg: dict) -> list[Path]:
    roots = (reg['tmp'], reg['debug'])
    paths: list[Path] = []
    visited = 0
    for top in roots:
        if not top.exists():
            continue
        _no_symlink(top, reg['root'])
        if not top.is_dir():
            raise EvidenceError('diagnostic root is not a directory')
        for directory, dirs, files in os.walk(top, followlinks=False):
            parent = Path(directory)
            visited += len(dirs) + len(files)
            if visited > MAX_FILES or len(parent.relative_to(top).parts) > MAX_DEPTH:
                raise EvidenceError('diagnostic scan bound exceeded')
            for name in dirs + files:
                _no_symlink(parent / name, reg['root'])
            if top == reg['tmp']:
                rel = parent.relative_to(top)
                if rel.parts and not rel.parts[0].startswith('maestro_xctestrunner_xcodebuild_output'):
                    dirs[:] = []
                    continue
            for name in files:
                if name == 'scheduling.log' or (name.startswith('Session') and name.endswith('.log')):
                    paths.append(parent / name)
    return paths


def _snapshot_log(reg: dict, raw: bytes) -> tuple[str, str]:
    """Create immutable content-addressed evidence before acknowledging the log."""
    root = reg['root']
    directory = root / 'xctest-retained-logs'
    _no_symlink(directory, root)
    if not directory.exists():
        directory.mkdir(mode=0o700)
    if not directory.is_dir() or directory.is_symlink() or directory.stat().st_mode & 0o077:
        raise EvidenceError('unsafe retained XCTest log directory')
    existing = list(itertools.islice(directory.iterdir(), MAX_SNAPSHOTS + 1))
    if len(existing) > MAX_SNAPSHOTS:
        raise EvidenceError('retained XCTest snapshot count exceeded')
    accumulated = 0
    for item in existing:
        _no_symlink(item, root)
        if not item.is_file() or not re.fullmatch(r'[0-9a-f]{64}\.log', item.name):
            raise EvidenceError('unexpected retained XCTest snapshot entry')
        accumulated += item.stat().st_size
    if accumulated > MAX_SNAPSHOT_BYTES:
        raise EvidenceError('retained XCTest snapshot byte budget exceeded')
    digest = hashlib.sha256(raw).hexdigest()
    path = directory / (digest + '.log')
    _no_symlink(path, root)
    if path.exists():
        if path.stat().st_size != len(raw) or hashlib.sha256(path.read_bytes()).hexdigest() != digest:
            raise EvidenceError('retained XCTest log collision or partial write')
    else:
        if len(existing) >= MAX_SNAPSHOTS or accumulated + len(raw) > MAX_SNAPSHOT_BYTES:
            raise EvidenceError('retained XCTest snapshot accumulation bound reached')
        with path.open('xb') as output:
            os.fchmod(output.fileno(), 0o600)
            output.write(raw)
            output.flush()
            os.fsync(output.fileno())
    return str(path.relative_to(root)), digest


def observe_invocation(flow_root: str | Path) -> dict:
    """Return a latched startup-failure state; never equate no marker with a pass."""
    reg = registration(flow_root)
    root = reg['root']
    previous = root / 'xctest-observation.json'
    if previous.exists():
        _no_symlink(previous, root)
        saved = _bounded_json(previous, MAX_OBSERVATION_BYTES)
        if (saved.get('device_id') != reg['device_id'] or
                saved.get('registered_flow_sha256') != reg['flow_sha256'] or
                saved.get('invocation_started_at') != reg['started_at'].isoformat()):
            raise EvidenceError('existing observation belongs to another registered invocation')
        if (str(root) not in _LATCHED and saved.get('state') == 'startup_failure_latched' and
                isinstance(saved.get('failure'), dict)):
            _LATCHED[str(root)] = saved['failure']
    found = _recognized_logs(reg)
    if len(found) > MAX_RETAINED_FILES:
        raise EvidenceError('too many recognized XCTest logs for retention')
    markers = []
    inventory = []
    aggregate = 0
    for path in found:
        descriptor = os.open(path, os.O_RDONLY | getattr(os, 'O_NOFOLLOW', 0))
        try:
            if not stat.S_ISREG(os.fstat(descriptor).st_mode):
                raise EvidenceError('recognized XCTest log is not a regular file')
            raw = os.read(descriptor, MAX_LOG_BYTES + 1)
        finally:
            os.close(descriptor)
        size = len(raw)
        if size > MAX_LOG_BYTES:
            raise EvidenceError(f'recognized XCTest log exceeds {MAX_LOG_BYTES} bytes: {path}')
        aggregate += size
        if aggregate > MAX_RETAINED_BYTES:
            raise EvidenceError('XCTest retained log byte budget exceeded')
        retained, digest = _snapshot_log(reg, raw)
        content = raw.decode('utf-8', 'replace')
        inventory.append({'path': str(path.relative_to(root)), 'bytes': size,
                          'observed_sha256': digest, 'retained_path': retained})
        for phrase in FAILURES:
            if phrase in content:
                markers.append({'path': str(path.relative_to(root)), 'signature': phrase})
    key = str(root)
    if markers and key not in _LATCHED:
        _LATCHED[key] = {'markers': markers, 'first_seen_at': dt.datetime.now(dt.timezone.utc).isoformat()}
    latched = _LATCHED.get(key)
    result = {'state': 'startup_failure_latched' if latched else
              ('no_startup_failure_observed' if found else 'pending_no_recognized_logs'),
              'registered_flow_sha256': reg['flow_sha256'], 'device_id': reg['device_id'],
              'invocation_started_at': reg['started_at'].isoformat(),
              'recognized_log_count': len(found), 'logs': inventory,
              'failure': latched, 'acceptance': False}
    _write_private(root / 'xctest-observation.json', result)
    return result


def parse_process_rows(ps_text: str) -> list[dict]:
    """Parse `ps -axo pid=,ppid=,pgid=,lstart=,args=` output (LC_ALL=C)."""
    rows = []
    for line in ps_text.splitlines():
        parts = line.strip().split(maxsplit=8)
        if len(parts) != 9 or not all(p.isdigit() for p in parts[:3]):
            if 'simctl diagnose' in line:
                raise EvidenceError('unparseable simctl diagnose process row')
            continue
        lstart = ' '.join(parts[3:8])
        try:
            local = dt.datetime.strptime(lstart, '%a %b %d %H:%M:%S %Y')
            timestamp = local.replace(tzinfo=dt.datetime.now().astimezone().tzinfo).timestamp()
        except ValueError:
            if 'simctl diagnose' in line:
                raise EvidenceError('unparseable simctl diagnose start time')
            continue
        rows.append({'pid': int(parts[0]), 'ppid': int(parts[1]), 'pgid': int(parts[2]),
                     'lstart': lstart, 'started_epoch': timestamp, 'argv': parts[8]})
    return rows


def _flag(args: list[str], name: str) -> str | None:
    matches = [arg[len(name)+1:] for arg in args if arg.startswith(name+'=')]
    matches += [args[i+1] for i,arg in enumerate(args[:-1]) if arg == name]
    if len(matches) > 1:
        raise EvidenceError('collector matches multiple registrations')
    return matches[0] if matches else None


def _collector_registration(row: dict, registrations: list[dict]) -> dict | None:
    try:
        args = shlex.split(row['argv'])
    except (ValueError, KeyError):
        return None
    if len(args) < 4 or args[0] != SIMCTL or args[1] != 'diagnose':
        return None
    uuid, output = _flag(args, '--udid'), _flag(args, '--output')
    if not uuid or not output or not Path(output).is_absolute():
        return None
    matches = []
    for reg in registrations:
        base = reg['declared_tmp']
        target = Path(os.path.normpath(output))
        if uuid != reg['device_id'] or target.name != 'simctl_diagnostics' or not target.is_relative_to(base):
            continue
        rel = target.relative_to(base)
        if len(rel.parts) < 3 or not rel.parts[0].startswith('maestro_xctestrunner_xcodebuild_output'):
            continue
        if row['started_epoch'] + 1 < reg['started_at'].timestamp():
            raise EvidenceError('collector predates registered invocation')
        _no_symlink(target, reg['declared_root'])
        matches.append(reg)
    return matches[0] if len(matches) == 1 else None


def select_owned_collectors(rows: list[dict], registrations: list[dict]) -> dict:
    """Selection is evidence only; always re-read and revalidate before signaling."""
    owned, ambiguous = [], []
    by_pid = {}
    for row in rows:
        by_pid.setdefault(row.get('pid'), []).append(row)
    for pid, records in by_pid.items():
        if len(records) != 1:
            ambiguous.append({'pid': pid, 'reason': 'duplicate_pid_rows'})
            continue
        row = records[0]
        try:
            reg = _collector_registration(row, registrations)
        except EvidenceError as error:
            ambiguous.append({'pid': pid, 'reason': str(error)})
            continue
        if reg:
            owned.append({'pid': pid, 'lstart': row['lstart'], 'argv': row['argv'],
                          'flow_root': str(reg['root']), 'device_id': reg['device_id'],
                          'ppid': row['ppid'], 'pgid': row['pgid']})
    return {'owned': owned, 'ambiguous': ambiguous}


def cleanup_collectors(rows: list[dict], registrations: list[dict], *, read_rows,
                       send_signal, monotonic, sleep, deadline: float, interrupted=lambda: False) -> dict:
    """Signal per proven PID only, with fresh identity proof immediately beforehand."""
    selection = select_owned_collectors(rows, registrations)
    result = {'stopped': [], 'pending': list(selection['ambiguous']), 'signal_attempts': []}
    by_root = {str(reg['root']): reg for reg in registrations}
    def fresh_rows():
        remaining = deadline-monotonic()
        if interrupted() or remaining <= 0:
            raise EvidenceError('collector cleanup deadline or interruption')
        return read_rows(timeout=remaining)
    def record(root: str):
        _write_private(by_root[root]['root'] / 'xctest-collector-cleanup.json', result)
    for candidate in selection['owned']:
        root = candidate['flow_root']
        for sig in (signal.SIGTERM, signal.SIGKILL):
            if interrupted() or monotonic() >= deadline:
                result['pending'].append({'pid': candidate['pid'], 'reason': 'interrupted_or_deadline'})
                break
            try:
                fresh = select_owned_collectors(fresh_rows(), registrations)
            except Exception:
                result['pending'].append({'pid': candidate['pid'], 'reason': 'fresh_process_check_unavailable'})
                break
            if interrupted() or monotonic() >= deadline:
                result['pending'].append({'pid': candidate['pid'], 'reason': 'deadline_after_process_check'})
                break
            same = [item for item in fresh['owned'] if item['pid'] == candidate['pid']]
            if len(same) != 1 or any(same[0][key] != candidate[key] for key in ('lstart','argv','flow_root','device_id','pgid')):
                result['pending'].append({'pid': candidate['pid'], 'reason': 'identity_changed_or_unavailable'})
                break
            intent = {'pid': candidate['pid'], 'signal': sig.name, 'lstart': candidate['lstart'],
                      'argv': candidate['argv'], 'flow_root': root}
            result['signal_attempts'].append(intent)
            record(root)  # Failure to retain evidence prevents the signal.
            if interrupted() or monotonic() >= deadline:
                result['pending'].append({'pid': candidate['pid'], 'reason': 'deadline_after_evidence_write'})
                record(root)
                break
            try:
                send_signal(candidate['pid'], sig)
            except OSError as error:
                result['pending'].append({'pid': candidate['pid'], 'reason': f'signal_failed:{type(error).__name__}'})
                record(root)
                break
            if monotonic() < deadline:
                sleep(min(0.5, max(0, deadline-monotonic())))
            try:
                after = [item for item in fresh_rows() if item.get('pid') == candidate['pid']]
            except Exception:
                result['pending'].append({'pid': candidate['pid'], 'reason': 'post_signal_check_unavailable'})
                record(root)
                break
            if not after:
                result['stopped'].append(candidate['pid'])
                record(root)
                break
            if len(after) != 1 or after[0].get('lstart') != candidate['lstart'] or after[0].get('argv') != candidate['argv']:
                result['pending'].append({'pid': candidate['pid'], 'reason': 'post_signal_identity_ambiguous'})
                record(root)
                break
        else:
            result['pending'].append({'pid': candidate['pid'], 'reason': 'still_present_after_sigkill'})
            record(root)
    result['cleanup_complete'] = not result['pending'] and len(result['stopped']) == len(selection['owned'])
    return result
