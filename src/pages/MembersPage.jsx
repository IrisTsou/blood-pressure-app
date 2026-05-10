import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

const defaultPermissions = {
  email: "",
  role: "caregiver",
  canView: true,
  canCreate: true,
  canUpdate: true,
  canDelete: false,
  canManageMembers: false,
  notifyOnAlert: true,
  notifyOnDailySummary: false,
  status: "active",
};

const rolePermissionPresets = {
  manager: {
    canView: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canManageMembers: true,
    notifyOnAlert: true,
    notifyOnDailySummary: true,
  },
  caregiver: {
    canView: true,
    canCreate: true,
    canUpdate: true,
    canDelete: false,
    canManageMembers: false,
    notifyOnAlert: true,
    notifyOnDailySummary: false,
  },
  viewer: {
    canView: true,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canManageMembers: false,
    notifyOnAlert: true,
    notifyOnDailySummary: false,
  },
  patient: {
    canView: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canManageMembers: false,
    notifyOnAlert: false,
    notifyOnDailySummary: false,
  },
};

const caregiverRoleOptions = [
  { value: "manager", label: "主要照護者" },
  { value: "caregiver", label: "照護者" },
  { value: "viewer", label: "只查看" },
];

const patientRoleOption = { value: "patient", label: "被照護者本人" };

function applyRolePreset(member, role) {
  return {
    ...member,
    role,
    ...rolePermissionPresets[role],
  };
}

function PermissionFields({ value, onChange }) {
  function updateField(field, nextValue) {
    onChange({
      ...value,
      [field]: nextValue,
    });
  }

  return (
    <div className="permission-grid">
      <label>
        <input
          type="checkbox"
          checked={value.canView}
          onChange={(event) => updateField("canView", event.target.checked)}
        />
        可查看
      </label>
      <label>
        <input
          type="checkbox"
          checked={value.canCreate}
          onChange={(event) => updateField("canCreate", event.target.checked)}
        />
        可新增
      </label>
      <label>
        <input
          type="checkbox"
          checked={value.canUpdate}
          onChange={(event) => updateField("canUpdate", event.target.checked)}
        />
        可修改
      </label>
      <label>
        <input
          type="checkbox"
          checked={value.canDelete}
          onChange={(event) => updateField("canDelete", event.target.checked)}
        />
        可刪除
      </label>
      <label>
        <input
          type="checkbox"
          checked={value.canManageMembers}
          onChange={(event) => updateField("canManageMembers", event.target.checked)}
        />
        可管理照護者
      </label>
      <label>
        <input
          type="checkbox"
          checked={value.notifyOnAlert}
          onChange={(event) => updateField("notifyOnAlert", event.target.checked)}
        />
        接收異常通知
      </label>
      <label>
        <input
          type="checkbox"
          checked={value.notifyOnDailySummary}
          onChange={(event) => updateField("notifyOnDailySummary", event.target.checked)}
        />
        接收每日總結
      </label>
    </div>
  );
}

function MembersPage({
  patient,
  members,
  onLoadMembers,
  onCreateMember,
  onUpdateMember,
  onDeleteMember,
  onBack,
}) {
  const [newMember, setNewMember] = useState(defaultPermissions);
  const [editingMembers, setEditingMembers] = useState({});
  const [isAddingMember, setIsAddingMember] = useState(false);

  useEffect(() => {
    onLoadMembers();
  }, [onLoadMembers]);

  function handleCreateSubmit(event) {
    event.preventDefault();
    onCreateMember(newMember);
    setNewMember(defaultPermissions);
    setIsAddingMember(false);
  }

  function getEditableMember(member) {
    return editingMembers[member.id] ?? {
      role: member.role,
      status: member.status,
      ...member.permissions,
    };
  }

  function updateEditableMember(memberId, nextValue) {
    setEditingMembers({
      ...editingMembers,
      [memberId]: nextValue,
    });
  }

  return (
    <section className="summary-card history-card">
      <div className="member-page-header">
        <div>
          <p className="eyebrow">照護者管理</p>
          <h1>{patient?.displayName ?? "被照護者"} 的照護者</h1>
        </div>

        {!isAddingMember && (
          <button
            className="add-member-button"
            type="button"
            aria-label="新增照護者"
            title="新增照護者"
            onClick={() => setIsAddingMember(true)}
          >
            <Plus size={24} />
            新增照護者
          </button>
        )}
      </div>

      {isAddingMember ? (
        <form className="member-form" onSubmit={handleCreateSubmit}>
          <label>
            新增照護者 Email
            <input
              type="email"
              value={newMember.email}
              onChange={(event) => setNewMember({ ...newMember, email: event.target.value })}
              required
            />
          </label>

          <label>
            角色
            <select
              value={newMember.role}
              onChange={(event) => setNewMember(applyRolePreset(newMember, event.target.value))}
            >
              {caregiverRoleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <PermissionFields value={newMember} onChange={setNewMember} />

          <div className="button-row">
            <button type="submit">加入照護者</button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => {
                setNewMember(defaultPermissions);
                setIsAddingMember(false);
              }}
            >
              取消
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="member-list">
            {members.map((member) => {
              const editableMember = getEditableMember(member);
              const roleOptions = member.role === "patient"
                ? [...caregiverRoleOptions, patientRoleOption]
                : caregiverRoleOptions;

              return (
                <article className="member-item" key={member.id}>
                  <div>
                    <h2>{member.displayName}</h2>
                    <p>{member.email}</p>
                  </div>

                  <label>
                    角色
                    <select
                      value={editableMember.role}
                      onChange={(event) =>
                        updateEditableMember(member.id, applyRolePreset(editableMember, event.target.value))
                      }
                    >
                      {roleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <PermissionFields
                    value={editableMember}
                    onChange={(nextValue) => updateEditableMember(member.id, nextValue)}
                  />

                  <div className="button-row">
                    <button
                      type="button"
                      onClick={() => onUpdateMember(member.id, editableMember)}
                    >
                      儲存權限
                    </button>
                    <button
                      className="danger-button"
                      type="button"
                      onClick={() => onDeleteMember(member.id)}
                    >
                      移除
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <button className="secondary-button" type="button" onClick={onBack}>
            返回
          </button>
        </>
      )}
    </section>
  );
}

export default MembersPage;
