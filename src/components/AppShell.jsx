import {
  Bell,
  CalendarDays,
  ClipboardList,
  LogOut,
  Menu,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

function AppShell({
  children,
  canManageMembers,
  onOpenToday,
  onOpenHistory,
  onAddPatient,
  onManageMembers,
  onOpenNotificationSettings,
  onEditProfile,
  onSignOut,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  function handleNavigate(action) {
    action();
    setIsSidebarOpen(false);
  }

  return (
    <div className="app-shell">
      <header className="top-bar">
        <button
          className="icon-button"
          type="button"
          aria-label={isSidebarOpen ? "關閉選單" : "開啟選單"}
          onClick={() => setIsSidebarOpen((current) => !current)}
        >
          {isSidebarOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

        <div className="top-actions">
          <button
            className="icon-button"
            type="button"
            aria-label="個人資料"
            title="個人資料"
            onClick={onEditProfile}
          >
            <User size={24} />
          </button>
          <button
            className="icon-button"
            type="button"
            aria-label="登出"
            title="登出"
            onClick={onSignOut}
          >
            <LogOut size={24} />
          </button>
        </div>
      </header>

      {isSidebarOpen && (
        <button
          className="sidebar-backdrop"
          type="button"
          aria-label="關閉選單"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${isSidebarOpen ? "is-open" : ""}`}>
        <section>
          <p className="sidebar-section-title">主要功能</p>
          <button type="button" onClick={() => handleNavigate(onOpenToday)}>
            <CalendarDays size={22} />
            今日紀錄
          </button>
          <button type="button" onClick={() => handleNavigate(onOpenHistory)}>
            <ClipboardList size={22} />
            歷史紀錄
          </button>
        </section>

        <section>
          <p className="sidebar-section-title">照護管理</p>
          <button type="button" onClick={() => handleNavigate(onAddPatient)}>
            <UserPlus size={22} />
            新增被照護者
          </button>
          {canManageMembers && (
            <button type="button" onClick={() => handleNavigate(onManageMembers)}>
              <Users size={22} />
              管理照護者
            </button>
          )}
        </section>

        <section>
          <p className="sidebar-section-title">異常通知</p>
          <button type="button" onClick={() => handleNavigate(onOpenNotificationSettings)}>
            <Bell size={22} />
            通知設定
          </button>
        </section>
      </aside>

      <main>{children}</main>
    </div>
  );
}

export default AppShell;
