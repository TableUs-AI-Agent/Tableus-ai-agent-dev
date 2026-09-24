"""Run a finite batch of due account deletion jobs."""

import argparse
import asyncio

from tableus.account_lifecycle import DEFAULT_BATCH, process_due_deletions, retry_attention_deletion


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--limit", type=int, default=DEFAULT_BATCH)
    parser.add_argument("--retry-subject-hash", help="Reset one pending row requiring operator attention")
    args = parser.parse_args()
    if args.retry_subject_hash:
        reset = asyncio.run(retry_attention_deletion(args.retry_subject_hash))
        print(f"attention_reset={reset}")
        return
    processed = asyncio.run(process_due_deletions(limit=args.limit))
    print(f"processed={processed}")


if __name__ == "__main__":
    main()
