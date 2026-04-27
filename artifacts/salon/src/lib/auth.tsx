import { createContext, useContext, useCallback, type ReactNode } from "react";
import {
  useGetMe,
  useLogin as useApiLogin,
  useRegister as useApiRegister,
  useLogout as useApiLogout,
  getGetMeQueryKey,
  getListAppointmentsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export interface SessionCustomer {
  id: string;
  email: string;
  name: string;
  phone: string;
  emailVerifiedAt: string | null;
  createdAt: string;
}

interface AuthContextValue {
  customer: SessionCustomer | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    email: string;
    password: string;
    name: string;
    phone: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const meQuery = useGetMe({
    query: { staleTime: 1000 * 60, retry: false },
  });
  const loginMut = useApiLogin();
  const registerMut = useApiRegister();
  const logoutMut = useApiLogout();

  const customer = (meQuery.data?.customer ?? null) as SessionCustomer | null;

  const invalidate = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
    await queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
  }, [queryClient]);

  const login = useCallback(
    async (email: string, password: string) => {
      await loginMut.mutateAsync({ data: { email, password } });
      await invalidate();
    },
    [loginMut, invalidate],
  );

  const register = useCallback(
    async (input: { email: string; password: string; name: string; phone: string }) => {
      await registerMut.mutateAsync({ data: input });
      await invalidate();
    },
    [registerMut, invalidate],
  );

  const logout = useCallback(async () => {
    await logoutMut.mutateAsync();
    await invalidate();
  }, [logoutMut, invalidate]);

  const value: AuthContextValue = {
    customer,
    isLoading: meQuery.isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
