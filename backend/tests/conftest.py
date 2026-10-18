import os

os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("TABLEUS_AUTH_MODE", "demo")
os.environ.setdefault("TABLEUS_PROVIDER_MODE", "deterministic")
os.environ.setdefault("TABLEUS_DEMO_MODE", "true")
os.environ.setdefault("PLANS_PER_PERSON_PER_DAY", "1000")
os.environ.setdefault("PLANS_PER_DAY", "1000")
