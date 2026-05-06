import { formatMeasuredAt } from "../storage";
import { getBloodPressureStatus } from "../utils/bloodPressureStatus";

function TodayPage({
  latestRecord,
  notificationSettings,
  patients,
  selectedPatientId,
  onSelectPatient,
  canCreate,
  onAddRecord,
  onViewHistory,
}) {
  const status = getBloodPressureStatus(latestRecord, notificationSettings);

  return (
    <section className={`summary-card status-${status.level}`}>
      <p className="eyebrow">今日血壓</p>
      <h1>{status.label}</h1>
      <p className="status-description">{status.description}</p>

      {patients.length > 0 ? (
        <label className="patient-selector">
          目前紀錄對象
          <select
            value={selectedPatientId}
            onChange={(event) => onSelectPatient(event.target.value)}
          >
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.displayName}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p className="empty-message">請先建立一位被照護者檔案。</p>
      )}

      <div className="reading-grid" aria-label="最新血壓紀錄">
        <div>
          <span>收縮壓</span>
          <strong>{latestRecord?.systolic ?? "--"}</strong>
          <small>mmHg</small>
        </div>
        <div>
          <span>舒張壓</span>
          <strong>{latestRecord?.diastolic ?? "--"}</strong>
          <small>mmHg</small>
        </div>
        <div>
          <span>心跳</span>
          <strong>{latestRecord?.pulse ?? "--"}</strong>
          <small>次 / 分</small>
        </div>
      </div>

      <p className="measured-time">
        {latestRecord ? `最近測量：${formatMeasuredAt(latestRecord)}` : "請先新增第一筆血壓紀錄"}
      </p>

      <div className="button-row">
        {canCreate && (
          <button type="button" onClick={onAddRecord}>
            新增血壓紀錄
          </button>
        )}
        <button className="secondary-button" type="button" onClick={onViewHistory}>
          查看歷史紀錄
        </button>
      </div>
    </section>
  );
}

export default TodayPage;
