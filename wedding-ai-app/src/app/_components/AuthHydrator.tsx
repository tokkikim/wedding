"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAuthStore } from "@/store/useAuthStore";

export function AuthHydrator() {
  const { data: session } = useSession();
  const setUser = useAuthStore((state) => state.setUser);
  const updateCredits = useAuthStore((state) => state.updateCredits);

  useEffect(() => {
    if (session?.user) {
      const { id, name, email, image, credits } = session.user;

      const authUser = {
        id,
        name: name ?? null,
        email: email ?? null,
        image: image ?? null,
        credits: credits ?? 0,
      };

      setUser(authUser);
      updateCredits(authUser.credits);
    } else {
      setUser(null);
    }
  }, [session, setUser, updateCredits]);

  return null;
}
