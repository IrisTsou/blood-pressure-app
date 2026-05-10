import { useCallback, useEffect, useRef, useState } from "react";
import {
  createRecord,
  deleteRecord,
  fetchRecords,
  updateRecord,
} from "./api/recordsApi";
import {
  createPatientMember,
  deletePatientMember,
  fetchPatientMembers,
  updatePatientMember,
} from "./api/membersApi";
import {
  createLineBindingCode,
  sendPendingLineNotifications,
} from "./api/lineApi";
import { createPatient, fetchAccessiblePatients } from "./api/patientsApi";
import { fetchMyProfile, updateMyProfile } from "./api/profilesApi";
import {
  fetchNotificationSettings,
  updateNotificationSettings,
} from "./api/settingsApi";
import { supabaseAuth } from "./auth/supabaseAuthClient";
import AuthPage from "./pages/AuthPage";
import AppShell from "./components/AppShell";
import HistoryPage from "./pages/HistoryPage";
import MembersPage from "./pages/MembersPage";
import NotificationSettingsPage from "./pages/NotificationSettingsPage";
import PatientFormPage from "./pages/PatientFormPage";
import ProfilePage from "./pages/ProfilePage";
import RecordFormPage from "./pages/RecordFormPage";
import TodayPage from "./pages/TodayPage";

function sortRecords(records) {
  return [...records].sort((firstRecord, secondRecord) =>
    `${secondRecord.date} ${secondRecord.time}`.localeCompare(
      `${firstRecord.date} ${firstRecord.time}`
    )
  );
}

function App() {
  const [currentView, setCurrentView] = useState("summary");
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [members, setMembers] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState(null);
  const [lineBindingCode, setLineBindingCode] = useState(null);
  const [profile, setProfile] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [recordToEdit, setRecordToEdit] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPatientsLoading, setIsPatientsLoading] = useState(false);
  const [isRecordsLoading, setIsRecordsLoading] = useState(false);
  const [recordsLoadedPatientId, setRecordsLoadedPatientId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const sessionUserIdRef = useRef(null);
  const latestRecord = records[0];

  useEffect(() => {
    function preventNumberInputWheelChange(event) {
      if (event.target instanceof HTMLInputElement && event.target.type === "number") {
        event.target.blur();
      }
    }

    window.addEventListener("wheel", preventNumberInputWheelChange, { capture: true });

    return () => {
      window.removeEventListener("wheel", preventNumberInputWheelChange, { capture: true });
    };
  }, []);

  useEffect(() => {
    async function loadSession() {
      const { data } = await supabaseAuth.auth.getSession();

      sessionUserIdRef.current = data.session?.user?.id ?? null;
      setIsPatientsLoading(Boolean(data.session));
      setSession(data.session);
      setIsLoading(false);
    }

    const { data: authListener } = supabaseAuth.auth.onAuthStateChange(
      (event, nextSession) => {
        const currentUserId = sessionUserIdRef.current;
        const nextUserId = nextSession?.user?.id;

        sessionUserIdRef.current = nextUserId ?? null;
        setSession(nextSession);

        if (currentUserId && currentUserId === nextUserId) {
          return;
        }

        setRecords([]);
        setPatients([]);
        setMembers([]);
        setNotificationSettings(null);
        setLineBindingCode(null);
        setProfile(null);
        setSelectedPatientId("");
        setIsPatientsLoading(Boolean(nextSession));
        setIsRecordsLoading(false);
        setRecordsLoadedPatientId("");
        setCurrentView("summary");
        setRecordToEdit(null);
      }
    );

    loadSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }

    async function loadPatientsFromApi() {
      setIsPatientsLoading(true);

      try {
        const [apiPatients, apiProfile] = await Promise.all([
          fetchAccessiblePatients(session.access_token),
          fetchMyProfile(session.access_token),
        ]);

        setPatients(apiPatients);
        setProfile(apiProfile);
        setSelectedPatientId((currentPatientId) => currentPatientId || apiPatients[0]?.id || "");
        setErrorMessage("");
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsPatientsLoading(false);
      }
    }

    loadPatientsFromApi();
  }, [session?.access_token]);

  const loadRecordsAndSettings = useCallback(async () => {
    if (!session?.access_token || !selectedPatientId) {
      return;
    }

    setIsRecordsLoading(true);

    try {
      const [apiRecords, apiSettings] = await Promise.all([
        fetchRecords(session.access_token, selectedPatientId),
        fetchNotificationSettings(selectedPatientId, session.access_token),
      ]);

      setRecords(sortRecords(apiRecords));
      setNotificationSettings(apiSettings);
      setRecordsLoadedPatientId(selectedPatientId);
      setErrorMessage("");
    } catch (error) {
      setRecordsLoadedPatientId(selectedPatientId);
      setErrorMessage(error.message);
    } finally {
      setIsRecordsLoading(false);
    }
  }, [session?.access_token, selectedPatientId]);

  useEffect(() => {
    loadRecordsAndSettings();
  }, [loadRecordsAndSettings]);

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId);
  const selectedPermissions = selectedPatient?.permissions ?? {};

  async function handleSaveRecord(newRecord) {
    try {
      const savedRecord = await createRecord(newRecord, session.access_token, selectedPatientId);
      const nextRecords = sortRecords([savedRecord, ...records]);

      setRecords(nextRecords);
      setErrorMessage("");
      setCurrentView("summary");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleSavePatient(newPatient) {
    try {
      const savedPatient = await createPatient(newPatient, session.access_token);

      setPatients((currentPatients) => [...currentPatients, savedPatient]);
      setSelectedPatientId(savedPatient.id);
      setRecords([]);
      setRecordsLoadedPatientId("");
      setErrorMessage("");
      setCurrentView("summary");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleSaveProfile(nextProfile) {
    try {
      const savedProfile = await updateMyProfile(nextProfile, session.access_token);

      setProfile(savedProfile);
      setErrorMessage("");
      setCurrentView("summary");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  const handleLoadMembers = useCallback(async () => {
    if (!selectedPatientId) {
      return;
    }

    try {
      const apiMembers = await fetchPatientMembers(selectedPatientId, session.access_token);

      setMembers(apiMembers);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }, [selectedPatientId, session?.access_token]);

  function handleOpenToday() {
    setCurrentView("summary");
  }

  function handleOpenHistory() {
    setCurrentView("history");
  }

  async function handleCreateMember(member) {
    try {
      const savedMember = await createPatientMember(selectedPatientId, member, session.access_token);

      setMembers((currentMembers) => [...currentMembers, savedMember]);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleUpdateMember(memberId, member) {
    try {
      const savedMember = await updatePatientMember(
        selectedPatientId,
        memberId,
        member,
        session.access_token
      );

      setMembers((currentMembers) =>
        currentMembers.map((currentMember) =>
          currentMember.id === savedMember.id ? savedMember : currentMember
        )
      );
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleDeleteMember(memberId) {
    try {
      await deletePatientMember(selectedPatientId, memberId, session.access_token);

      setMembers((currentMembers) => currentMembers.filter((member) => member.id !== memberId));
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleLoadNotificationSettings() {
    if (!selectedPatientId) {
      return;
    }

    try {
      const apiSettings = await fetchNotificationSettings(selectedPatientId, session.access_token);

      setNotificationSettings(apiSettings);
      setErrorMessage("");
      setCurrentView("notification-settings");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleSaveNotificationSettings(settings) {
    try {
      const savedSettings = await updateNotificationSettings(
        selectedPatientId,
        settings,
        session.access_token
      );

      setNotificationSettings(savedSettings);
      setErrorMessage("");
      setCurrentView("summary");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleCreateLineBindingCode() {
    try {
      const bindingCode = await createLineBindingCode(selectedPatientId, session.access_token);

      setLineBindingCode(bindingCode);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleSendPendingLineNotifications() {
    try {
      const result = await sendPendingLineNotifications(selectedPatientId, session.access_token);
      const errorSummary = result.failedCount > 0 ? `，${result.failedCount} 筆失敗` : "";

      setErrorMessage(
        `LINE 發送完成：${result.sentCount} 筆已送出${errorSummary}，待通知 ${result.pendingCount} 筆，綁定對象 ${result.bindingCount} 個`
      );
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleUpdateRecord(updatedRecord) {
    try {
      const savedRecord = await updateRecord(updatedRecord, session.access_token);
      const nextRecords = sortRecords(
        records.map((record) => (record.id === savedRecord.id ? savedRecord : record))
      );

      setRecords(nextRecords);
      setErrorMessage("");
      setRecordToEdit(null);
      setCurrentView("history");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleDeleteRecord(recordId) {
    try {
      await deleteRecord(recordId, session.access_token);
      const nextRecords = records.filter((record) => record.id !== recordId);

      setRecords(nextRecords);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  if (isLoading) {
    return (
      <main>
        <section className="summary-card">
          <p className="eyebrow">資料載入中</p>
          <h1>正在讀取血壓紀錄</h1>
        </section>
      </main>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  const isSelectedPatientDataLoading = selectedPatientId
    && recordsLoadedPatientId !== selectedPatientId;

  if (isPatientsLoading || isSelectedPatientDataLoading) {
    return (
      <AppShell
        canManageMembers={false}
        onOpenToday={() => setCurrentView("summary")}
        onOpenHistory={() => setCurrentView("history")}
        onAddPatient={() => setCurrentView("patient-form")}
        onManageMembers={() => setCurrentView("members")}
        onOpenNotificationSettings={handleLoadNotificationSettings}
        onEditProfile={() => setCurrentView("profile")}
        onSignOut={() => supabaseAuth.auth.signOut()}
      >
        <section className="summary-card">
          <p className="eyebrow">資料載入中</p>
          <h1>正在讀取血壓紀錄</h1>
          <p className="status-description">請稍候，正在同步最新資料。</p>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell
      canManageMembers={Boolean(selectedPermissions.canManageMembers)}
      onOpenToday={handleOpenToday}
      onOpenHistory={handleOpenHistory}
      onAddPatient={() => setCurrentView("patient-form")}
      onManageMembers={() => setCurrentView("members")}
      onOpenNotificationSettings={handleLoadNotificationSettings}
      onEditProfile={() => setCurrentView("profile")}
      onSignOut={() => supabaseAuth.auth.signOut()}
    >
      {errorMessage && <p className="error-banner">{errorMessage}</p>}

      {currentView === "summary" && (
        <TodayPage
          latestRecord={latestRecord}
          notificationSettings={notificationSettings}
          patients={patients}
          selectedPatientId={selectedPatientId}
          onSelectPatient={(patientId) => {
            setSelectedPatientId(patientId);
            setRecords([]);
            setRecordsLoadedPatientId("");
            setMembers([]);
            setNotificationSettings(null);
            setLineBindingCode(null);
            setRecordToEdit(null);
          }}
          canCreate={Boolean(selectedPermissions.canCreate)}
          onAddRecord={() => {
            if (selectedPatientId) {
              setRecordToEdit(null);
              setCurrentView("form");
            }
          }}
          onViewHistory={() => setCurrentView("history")}
        />
      )}

      {currentView === "profile" && (
        <ProfilePage
          profile={profile}
          onSave={handleSaveProfile}
          onBack={() => setCurrentView("summary")}
        />
      )}

      {currentView === "members" && (
        <MembersPage
          patient={selectedPatient}
          members={members}
          onLoadMembers={handleLoadMembers}
          onCreateMember={handleCreateMember}
          onUpdateMember={handleUpdateMember}
          onDeleteMember={handleDeleteMember}
          onBack={() => setCurrentView("summary")}
        />
      )}

      {currentView === "notification-settings" && (
        <NotificationSettingsPage
          patient={selectedPatient}
          settings={notificationSettings}
          lineBindingCode={lineBindingCode}
          canEdit={Boolean(selectedPermissions.canManageMembers)}
          onSave={handleSaveNotificationSettings}
          onCreateLineBindingCode={handleCreateLineBindingCode}
          onSendPendingLineNotifications={handleSendPendingLineNotifications}
          onBack={() => setCurrentView("summary")}
        />
      )}

      {currentView === "patient-form" && (
        <PatientFormPage
          onSave={handleSavePatient}
          onCancel={() => setCurrentView("summary")}
        />
      )}

      {currentView === "form" && (
        <RecordFormPage
          recordToEdit={recordToEdit}
          onSave={recordToEdit ? handleUpdateRecord : handleSaveRecord}
          onCancel={() => {
            setRecordToEdit(null);
            setCurrentView(recordToEdit ? "history" : "summary");
          }}
        />
      )}

      {currentView === "history" && (
        <HistoryPage
          records={records}
          notificationSettings={notificationSettings}
          onEditRecord={
            selectedPermissions.canUpdate
              ? (record) => {
                  setRecordToEdit(record);
                  setCurrentView("form");
                }
              : null
          }
          onDeleteRecord={selectedPermissions.canDelete ? handleDeleteRecord : null}
          onBack={() => setCurrentView("summary")}
        />
      )}
    </AppShell>
  );
}

export default App;
