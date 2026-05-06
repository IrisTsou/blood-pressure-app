import { useState } from "react";

function NotificationSettingsPage({
  patient,
  settings,
  lineBindingCode,
  canEdit,
  onSave,
  onCreateLineBindingCode,
  onSendPendingLineNotifications,
  onBack,
}) {
  const [formData, setFormData] = useState({
    highSystolic: settings?.highSystolic ?? 140,
    highDiastolic: settings?.highDiastolic ?? 90,
    lowSystolic: settings?.lowSystolic ?? 90,
    lowDiastolic: settings?.lowDiastolic ?? 60,
    dailySummaryEnabled: settings?.dailySummaryEnabled ?? false,
    dailySummaryTime: settings?.dailySummaryTime ?? "21:00",
  });

  function updateField(field, value) {
    setFormData({
      ...formData,
      [field]: value,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSave(formData);
  }

  return (
    <section className="summary-card">
      <p className="eyebrow">通知設定</p>
      <h1>{patient?.displayName ?? "被照護者"} 的警示規則</h1>

      <form className="record-form" onSubmit={handleSubmit}>
        <label>
          收縮壓偏高門檻
          <input
            type="number"
            value={formData.highSystolic}
            disabled={!canEdit}
            onChange={(event) => updateField("highSystolic", Number(event.target.value))}
          />
        </label>

        <label>
          舒張壓偏高門檻
          <input
            type="number"
            value={formData.highDiastolic}
            disabled={!canEdit}
            onChange={(event) => updateField("highDiastolic", Number(event.target.value))}
          />
        </label>

        <label>
          收縮壓偏低門檻
          <input
            type="number"
            value={formData.lowSystolic}
            disabled={!canEdit}
            onChange={(event) => updateField("lowSystolic", Number(event.target.value))}
          />
        </label>

        <label>
          舒張壓偏低門檻
          <input
            type="number"
            value={formData.lowDiastolic}
            disabled={!canEdit}
            onChange={(event) => updateField("lowDiastolic", Number(event.target.value))}
          />
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={formData.dailySummaryEnabled}
            disabled={!canEdit}
            onChange={(event) => updateField("dailySummaryEnabled", event.target.checked)}
          />
          啟用每日總結
        </label>

        <label>
          每日總結時間
          <input
            type="time"
            value={formData.dailySummaryTime}
            disabled={!canEdit}
            onChange={(event) => updateField("dailySummaryTime", event.target.value)}
          />
        </label>

        <div className="button-row">
          {canEdit && <button type="submit">儲存設定</button>}
          <button className="secondary-button" type="button" onClick={onBack}>
            返回
          </button>
        </div>
      </form>

      {canEdit && (
        <section className="line-binding-panel">
          <h2>LINE 群組綁定</h2>
          <p>把 LINE bot 加進群組後，產生綁定碼，並在群組輸入指令完成綁定。</p>

          {lineBindingCode && (
            <div className="binding-code-box">
              <strong>{lineBindingCode.code}</strong>
              <span>{lineBindingCode.instruction}</span>
            </div>
          )}

          <div className="button-row">
            <button type="button" onClick={onCreateLineBindingCode}>
              產生綁定碼
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={onSendPendingLineNotifications}
            >
              發送待通知
            </button>
          </div>
        </section>
      )}
    </section>
  );
}

export default NotificationSettingsPage;
