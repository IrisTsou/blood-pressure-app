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

  useEffect(() => {
    onLoadMembers();
  }, [onLoadMembers]);

  function handleCreateSubmit(event) {
    event.preventDefault();
    onCreateMember(newMember);
    setNewMember(defaultPermissions);
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
      <p className="eyebrow">照護者管理</p>
      <h1>{patient?.displayName ?? "被照護者"} 的照護者</h1>

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
            onChange={(event) => setNewMember({ ...newMember, role: event.target.value })}
          >
            <option value="manager">主要照護者</option>
            <option value="caregiver">照護者</option>
            <option value="viewer">只查看</option>
            <option value="patient">被照護者本人</option>
          </select>
        </label>

        <PermissionFields value={newMember} onChange={setNewMember} />

        <button type="submit">加入照護者</button>
      </form>

      <div className="member-list">
        {members.map((member) => {
          const editableMember = getEditableMember(member);

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
                    updateEditableMember(member.id, {
                      ...editableMember,
                      role: event.target.value,
                    })
                  }
                >
                  <option value="manager">主要照護者</option>
                  <option value="caregiver">照護者</option>
                  <option value="viewer">只查看</option>
                  <option value="patient">被照護者本人</option>
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
    </section>
  );
}

export default MembersPage;
