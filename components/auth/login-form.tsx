"use client";

import { useActionState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { login } from "@/app/actions/auth";
import type { LoginFormState } from "@/lib/validation";

const initialFormState: LoginFormState = {};

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, action, pending] = useActionState(login, initialFormState);

  return (
    <form
      action={action}
      className="rounded-lg bg-surface-1 border border-hairline p-6 space-y-4"
      noValidate
    >
      <input type="hidden" name="redirectTo" value={redirectTo ?? ""} />

      {state.message && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-hairline-strong bg-surface-2 px-3 py-2 text-sm text-ink-muted"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
          <span>{state.message}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm text-ink-muted">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={Boolean(state.errors?.email)}
          aria-describedby={state.errors?.email ? "email-error" : undefined}
          placeholder="anda@dbherunk.id"
          className="w-full rounded-md bg-surface-2 border border-hairline px-3 py-2 text-base text-ink placeholder:text-ink-tertiary outline-none focus-visible:border-hairline-strong focus-visible:outline-2 focus-visible:outline-primary-focus/50"
        />
        {state.errors?.email && (
          <p id="email-error" className="text-sm text-ink-subtle">
            {state.errors.email[0]}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm text-ink-muted">
          Kata sandi
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(state.errors?.password)}
          aria-describedby={state.errors?.password ? "password-error" : undefined}
          placeholder="••••••••"
          className="w-full rounded-md bg-surface-2 border border-hairline px-3 py-2 text-base text-ink placeholder:text-ink-tertiary outline-none focus-visible:border-hairline-strong focus-visible:outline-2 focus-visible:outline-primary-focus/50"
        />
        {state.errors?.password && (
          <p id="password-error" className="text-sm text-ink-subtle">
            {state.errors.password[0]}
          </p>
        )}
      </div>

      <SubmitButton pending={pending} />
    </form>
  );
}

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover active:bg-primary-focus disabled:cursor-not-allowed disabled:opacity-60 min-h-[40px]"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {pending ? "Sedang masuk…" : "Masuk"}
    </button>
  );
}
