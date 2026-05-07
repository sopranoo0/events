import { useAuthBootstrap } from "@/hooks/use-auth-butstrap"
import { Navigate } from "react-router-dom"

export const RootRedirect = () => {
  const user = useAuthBootstrap()

  return <Navigate to={user ? '/events' : '/login'} replace/>
}
