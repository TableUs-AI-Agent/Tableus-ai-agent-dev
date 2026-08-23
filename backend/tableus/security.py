import hashlib
import secrets
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

import jwt

from .config import get_settings


def hash_value(value: str) -> str:
    return hashlib.sha256(value.strip().encode("utf-8")).hexdigest()


def new_share_token() -> str:
    return secrets.token_urlsafe(32)


@dataclass(frozen=True)
class RedemptionGrant:
    invite_id: str
    email_hash: str | None
    pending_validation_id: str | None


def issue_redemption_token(
    invite_id: str, email: str | None = None, pending_validation_id: str | None = None
) -> str:
    settings = get_settings()
    now = datetime.now(UTC)
    payload = {
        "sub": invite_id,
        "purpose": "invite-redemption",
        "iat": now,
        "exp": now + timedelta(minutes=20),
    }
    if email:
        payload["email_hash"] = hash_value(email.lower())
    if pending_validation_id:
        payload["pending_validation_id"] = pending_validation_id
    return jwt.encode(
        payload,
        settings.tableus_app_secret,
        algorithm="HS256",
    )


def decode_redemption_token(token: str) -> RedemptionGrant:
    settings = get_settings()
    payload = jwt.decode(token, settings.tableus_app_secret, algorithms=["HS256"])
    if payload.get("purpose") != "invite-redemption":
        raise jwt.InvalidTokenError("Invalid token purpose")
    return RedemptionGrant(
        invite_id=str(payload["sub"]),
        email_hash=str(payload["email_hash"]) if payload.get("email_hash") else None,
        pending_validation_id=str(payload["pending_validation_id"])
        if payload.get("pending_validation_id")
        else None,
    )
