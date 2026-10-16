"""Per-person ceilings on paid provider calls.

In-memory and per process, which is enough for a single API instance. A Google
Cloud budget alert is the backstop for spend.
"""

import time
from collections import defaultdict, deque

from fastapi import HTTPException

_WINDOW_SECONDS = 3600
_calls: dict[tuple[str, str], deque[float]] = defaultdict(deque)


def check_rate(kind: str, profile_id: str, per_hour: int) -> None:
    now = time.monotonic()
    window = _calls[(kind, profile_id)]
    while window and window[0] <= now - _WINDOW_SECONDS:
        window.popleft()
    if len(window) >= per_hour:
        raise HTTPException(status_code=429, detail="Too many requests. Try again in a bit.")
    window.append(now)


def reset() -> None:
    _calls.clear()
