"use client";

import { useState } from "react";
import { Users, X, Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    useTeamMembers,
    useCreateTeamMember,
    useAssignMemberTerritory,
    useUnassignMemberTerritory,
} from "@/hooks/use-teams";
import type { Territory, MemberRole } from "@/lib/types";

interface TeamAssignmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    territory: Territory;
}

export function TeamAssignmentDialog({
    open,
    onOpenChange,
    territory,
}: TeamAssignmentDialogProps) {
    const { data: allMembers = [] } = useTeamMembers();
    const createMemberMutation = useCreateTeamMember();
    const assignMutation = useAssignMemberTerritory();
    const unassignMutation = useUnassignMemberTerritory();

    const [selectedMemberId, setSelectedMemberId] = useState("");
    const [showNewMember, setShowNewMember] = useState(false);
    const [newFirstName, setNewFirstName] = useState("");
    const [newLastName, setNewLastName] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newPosition, setNewPosition] = useState("");
    const [newRole, setNewRole] = useState<MemberRole>("sales_team");

    const members = territory.members ?? [];
    const assignedIds = new Set(members.map((m) => m.id));
    const availableMembers = allMembers.filter((m) => !assignedIds.has(m.id));

    async function handleAssign() {
        if (!selectedMemberId) return;
        await assignMutation.mutateAsync({
            team_member_id: selectedMemberId,
            territory_id: territory.id,
        });
        setSelectedMemberId("");
    }

    async function handleUnassign(memberId: string) {
        await unassignMutation.mutateAsync({
            team_member_id: memberId,
            territory_id: territory.id,
        });
    }

    async function handleCreateAndAssign() {
        if (!newFirstName.trim() || !newLastName.trim() || !newEmail.trim() || !newPosition.trim()) return;
        const member = await createMemberMutation.mutateAsync({
            first_name: newFirstName.trim(),
            last_name: newLastName.trim(),
            email: newEmail.trim(),
            position: newPosition.trim(),
            role: newRole,
        });
        await assignMutation.mutateAsync({
            team_member_id: member.id,
            territory_id: territory.id,
        });
        resetNewForm();
    }

    function resetNewForm() {
        setNewFirstName("");
        setNewLastName("");
        setNewEmail("");
        setNewPosition("");
        setNewRole("sales_team");
        setShowNewMember(false);
    }

    const isPending =
        assignMutation.isPending ||
        unassignMutation.isPending ||
        createMemberMutation.isPending;

    const ROLE_LABELS: Record<string, string> = {
        sales_team: "Sales",
        leadership: "Leadership",
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="size-4" />
                        Members &mdash; {territory.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                            Assigned Members ({members.length})
                        </Label>
                        {members.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-2">
                                No members assigned yet.
                            </p>
                        ) : (
                            <div className="space-y-1.5">
                                {members.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between rounded-md border px-3 py-2"
                                    >
                                        <div className="min-w-0">
                                            <div className="text-sm font-medium truncate">
                                                {member.first_name} {member.last_name}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground truncate">
                                                {member.position} &middot;{" "}
                                                {ROLE_LABELS[member.role] ?? member.role}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-7 shrink-0 text-destructive hover:text-destructive"
                                            onClick={() => handleUnassign(member.id)}
                                            disabled={isPending}
                                        >
                                            <X className="size-3.5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="border-t pt-4 space-y-3">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                            Add Member
                        </Label>

                        {!showNewMember ? (
                            <div className="flex gap-2">
                                <Select
                                    value={selectedMemberId}
                                    onValueChange={setSelectedMemberId}
                                    disabled={availableMembers.length === 0}
                                >
                                    <SelectTrigger className="flex-1">
                                        <SelectValue
                                            placeholder={
                                                availableMembers.length === 0
                                                    ? "All members assigned"
                                                    : "Select a member"
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableMembers.map((m) => (
                                            <SelectItem key={m.id} value={m.id}>
                                                {m.first_name} {m.last_name} — {m.position}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    size="sm"
                                    onClick={handleAssign}
                                    disabled={!selectedMemberId || isPending}
                                    className="shrink-0"
                                >
                                    Assign
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2 rounded-md border p-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        value={newFirstName}
                                        onChange={(e) => setNewFirstName(e.target.value)}
                                        placeholder="First name"
                                    />
                                    <Input
                                        value={newLastName}
                                        onChange={(e) => setNewLastName(e.target.value)}
                                        placeholder="Last name"
                                    />
                                </div>
                                <Input
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="Email"
                                    type="email"
                                />
                                <Input
                                    value={newPosition}
                                    onChange={(e) => setNewPosition(e.target.value)}
                                    placeholder="Position (e.g. Account Executive)"
                                />
                                <Select
                                    value={newRole}
                                    onValueChange={(v) => setNewRole(v as MemberRole)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sales_team">Sales Team</SelectItem>
                                        <SelectItem value="leadership">Leadership</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={resetNewForm}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleCreateAndAssign}
                                        disabled={
                                            !newFirstName.trim() ||
                                            !newLastName.trim() ||
                                            !newEmail.trim() ||
                                            !newPosition.trim() ||
                                            isPending
                                        }
                                    >
                                        Create & Assign
                                    </Button>
                                </div>
                            </div>
                        )}

                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs gap-1.5 h-7"
                            onClick={() => setShowNewMember(!showNewMember)}
                        >
                            <Plus className="size-3" />
                            {showNewMember ? "Pick existing member" : "Create new member"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
