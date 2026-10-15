import secrets


def new_share_token() -> str:
    return secrets.token_urlsafe(32)
