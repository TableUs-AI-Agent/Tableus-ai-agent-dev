from tableus.security import decode_redemption_token, hash_value, issue_redemption_token


def test_redemption_token_is_bound_to_normalized_email() -> None:
    token = issue_redemption_token("invite-1", "Diner@Example.COM")
    grant = decode_redemption_token(token)
    assert grant.invite_id == "invite-1"
    assert grant.email_hash == hash_value("diner@example.com")
    assert grant.pending_validation_id is None


def test_demo_redemption_token_does_not_require_email() -> None:
    grant = decode_redemption_token(issue_redemption_token("invite-2"))
    assert grant.invite_id == "invite-2"
    assert grant.email_hash is None
    assert grant.pending_validation_id is None


def test_redemption_token_carries_pending_validation_id() -> None:
    grant = decode_redemption_token(
        issue_redemption_token("invite-3", "diner@example.com", "pending-1")
    )
    assert grant.pending_validation_id == "pending-1"
