import { ensureAuthBootstraped } from "@/app/auth-bootsrap";
import { useAuthStore } from "@/stores/auth-store";
import { use } from "react";

export function useAuthBootstrap() {
    use(ensureAuthBootstraped())

    return useAuthStore(state => state.user)
}