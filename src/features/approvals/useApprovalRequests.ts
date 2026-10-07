import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "../authentication/useUser";
import { getApprovalRequests } from "../../services/apiOperationsCopilot";

export function useApprovalRequests(scope: "mine" | "inbox", status = "all", page = 1) {
  const { user } = useUser();
  const role = user?.app_metadata?.role;
  const queryClient = useQueryClient();
  useEffect(() => {
    const refresh = () => { void queryClient.invalidateQueries({ queryKey: ["approvalRequests", user?.id] }); };
    window.addEventListener("approval-requests-updated", refresh);
    return () => window.removeEventListener("approval-requests-updated", refresh);
  }, [queryClient, user?.id]);
  return useQuery({
    queryKey: ["approvalRequests", user?.id, scope, status, page],
    queryFn: ({ signal }) => getApprovalRequests({ scope, status, page }, signal),
    enabled: Boolean(user?.id) && (role === "admin" || role === "staff" && scope === "mine"),
    staleTime: 10_000,
    refetchInterval: 20_000,
    retry: false,
  });
}
