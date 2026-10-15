"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { SimplePage } from "../../components/simple-page";
import { api, errorMessage } from "../../lib/api";
import { captureJoinToken, forgetJoinToken } from "../../lib/join-token";
import { useMe, useSession } from "../../lib/session";

export default function JoinPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session } = useSession();
  const me = useMe();
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  // The token lives in the address bar and session storage, which only exist in the browser.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setToken(captureJoinToken(id)), [id]);

  useEffect(() => {
    if (token === undefined || token === null) return;
    const here = encodeURIComponent(`/join/${id}`);
    if (session.status === "signed-out") router.replace(`/signin?next=${here}`);
    else if (session.status === "signed-in" && me.data === null) router.replace(`/welcome?next=${here}`);
    else if (me.data) {
      let cancelled = false;
      api.joinPlan(id, token)
        .then((plan) => {
          if (cancelled) return;
          forgetJoinToken(id);
          queryClient.setQueryData(["plan", id], plan);
          router.replace(`/plans/${id}`);
        })
        .catch((failure) => { if (!cancelled) setError(errorMessage(failure)); });
      return () => { cancelled = true; };
    }
  }, [token, session.status, me.data, id, router, queryClient]);

  if (token === null || error) {
    return (
      <SimplePage title="This link didn't work" intro={error ?? "The invite link is incomplete. Ask whoever sent it for the full link."}>
        <button type="button" className="btn btn-quiet" onClick={() => router.push("/plans")}>Go to your plans</button>
      </SimplePage>
    );
  }
  return (
    <SimplePage title="Joining the plan">
      <p role="status" className="text-moss">One moment…</p>
    </SimplePage>
  );
}
