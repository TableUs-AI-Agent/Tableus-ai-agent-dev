"""Read-only, process-free identity check for a pinned Maestro installation."""
from __future__ import annotations

import hashlib
from pathlib import Path
import re
import zipfile

RESOURCE = 'version.properties'
MAX_RESOURCE_BYTES = 4096
VERSION = re.compile(r'[0-9]+\.[0-9]+\.[0-9]+')

class ToolchainIdentityError(ValueError):
    pass

def _sha(path: Path) -> str:
    digest=hashlib.sha256()
    with path.open('rb') as source:
        while chunk:=source.read(1024*1024):digest.update(chunk)
    return digest.hexdigest()

def read_identity(launcher, launcher_realpath, launcher_sha256, cli_jar, cli_jar_sha256,
                  expected_version='2.8.0'):
    """Validate pinned bytes and a single small CLI version resource; never start Java/Maestro."""
    launcher=Path(launcher); expected_real=Path(launcher_realpath); jar=Path(cli_jar)
    if (not launcher.is_absolute() or not expected_real.is_absolute() or not jar.is_absolute() or
            not re.fullmatch(r'[0-9a-f]{64}',launcher_sha256) or
            not re.fullmatch(r'[0-9a-f]{64}',cli_jar_sha256) or
            not VERSION.fullmatch(expected_version)):
        raise ToolchainIdentityError('invalid pinned identity input')
    try:
        real=launcher.resolve(strict=True)
        if real!=expected_real or not real.is_file() or jar.is_symlink() or not jar.is_file():
            raise ToolchainIdentityError('launcher/JAR path identity mismatch')
        if _sha(real)!=launcher_sha256 or _sha(jar)!=cli_jar_sha256:
            raise ToolchainIdentityError('launcher/JAR SHA-256 mismatch')
        with zipfile.ZipFile(jar) as archive:
            matches=[info for info in archive.infolist() if info.filename==RESOURCE]
            if len(matches)!=1 or matches[0].is_dir() or matches[0].file_size>MAX_RESOURCE_BYTES:
                raise ToolchainIdentityError('missing, duplicate, or oversized version.properties')
            with archive.open(matches[0]) as source:
                raw=source.read(MAX_RESOURCE_BYTES+1)
        if len(raw)>MAX_RESOURCE_BYTES:raise ToolchainIdentityError('oversized version.properties')
        try:lines=raw.decode('ascii').splitlines()
        except UnicodeDecodeError as error:raise ToolchainIdentityError('non-ASCII version.properties') from error
        values=[]
        for line in lines:
            line=line.strip()
            if not line or line.startswith(('#','!')):continue
            if not line.startswith('version=') or not VERSION.fullmatch(line.removeprefix('version=')):
                raise ToolchainIdentityError('malformed version.properties')
            values.append(line.removeprefix('version='))
        if values!=[expected_version]:raise ToolchainIdentityError('version.properties mismatch or duplicate')
    except (OSError,zipfile.BadZipFile) as error:
        raise ToolchainIdentityError(f'unreadable pinned Maestro identity: {type(error).__name__}') from error
    return {'version':expected_version,'version_resource':RESOURCE,'launcher_realpath':str(real),
            'launcher_sha256':launcher_sha256,'cli_jar_path':str(jar),'cli_jar_sha256':cli_jar_sha256,
            'method':'static_pinned_bytes_and_jar_resource','process_started':False}
