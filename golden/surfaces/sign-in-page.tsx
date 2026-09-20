"use client";

import { useState } from "react";
import { z } from "zod";
import { AppButton } from "@/components/app/app-button";
import { AppCard } from "@/components/app/app-card";
import { AppForm } from "@/components/app/app-form";
import { AppInput } from "@/components/app/app-input";
import { AppPage } from "@/components/app/app-page";
import { SessionProvider, useSession } from "@/shared/auth/session";
import { signInWithEmail, signInWithGoogle } from "@/shared/auth/sign-in";
import { T } from "@/components/i18n";

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function SignInCard() {
  const { user, loading, signOutEverywhere } = useSession();
  const [values, setValues] = useState({ email: "", password: "" });
  if (loading) return null;
  if (user) {
    return (
      <AppCard titleKey="auth_signed_in_as">
        <p>{user.email}</p>
        <AppButton onClick={() => void signOutEverywhere()}>
          <T k="action_sign_in" />
        </AppButton>
      </AppCard>
    );
  }
  return (
    <AppCard titleKey="sign_in_title">
      <AppForm schema={Schema} values={values} onChange={setValues} onSubmit={(next) => void signInWithEmail(next)} submitKey="action_sign_in" formId="golden-sign-in">
        {({ field }) => {
          const email = field("email");
          const password = field("password");
          return (
            <>
              <label htmlFor={email.bind.id}>
                <T k="auth_email" />
              </label>
              <AppInput fieldError={email.error} {...email.bind} type="email" />
              <label htmlFor={password.bind.id}>
                <T k="auth_password" />
              </label>
              <AppInput fieldError={password.error} {...password.bind} type="password" />
            </>
          );
        }}
      </AppForm>
      <AppButton onClick={() => void signInWithGoogle()}>
        <T k="auth_continue_google" />
      </AppButton>
    </AppCard>
  );
}

/** Golden demo surface: sign in through the emulator, no real OAuth. */
export default function GoldenSignInPage() {
  return (
    <SessionProvider>
      <AppPage titleKey="sign_in_title">
        <SignInCard />
      </AppPage>
    </SessionProvider>
  );
}
