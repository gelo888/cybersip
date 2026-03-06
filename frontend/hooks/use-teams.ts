import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, del } from "@/lib/api";
import type { TeamMember, TeamMemberPayload, TerritoryMemberPayload } from "@/lib/types";

export function useTeamMembers() {
    return useQuery({
        queryKey: ["team-members"],
        queryFn: () => get<TeamMember[]>("/api/team-members"),
    });
}

export function useCreateTeamMember() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: TeamMemberPayload) =>
            post<TeamMember>("/api/team-members", data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["team-members"] }),
    });
}

export function useAssignMemberTerritory() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: TerritoryMemberPayload) =>
            post<TerritoryMemberPayload>("/api/territory-members", data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["territories"] });
            qc.invalidateQueries({ queryKey: ["territory-members"] });
        },
    });
}

export function useUnassignMemberTerritory() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ team_member_id, territory_id }: TerritoryMemberPayload) =>
            del(`/api/territory-members/${team_member_id}/${territory_id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["territories"] });
            qc.invalidateQueries({ queryKey: ["territory-members"] });
        },
    });
}
