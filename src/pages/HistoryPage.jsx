import { useState } from "react";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import TrendChart from "../components/TrendChart";
import { getBloodPressureStatus } from "../utils/bloodPressureStatus";

function HistoryPage({ records, notificationSettings, onEditRecord, onDeleteRecord, onBack }) {
  const [recordToDelete, setRecordToDelete] = useState(null);

  function handleConfirmDelete(recordId) {
    onDeleteRecord(recordId);
    setRecordToDelete(null);
  }

  return (
    <section className="summary-card history-card">
      <p className="eyebrow">歷史紀錄</p>
      <h1>血壓紀錄總覽</h1>

      {records.length === 0 ? (
        <p className="empty-message">目前還沒有血壓紀錄。</p>
      ) : (
        <>
          <TrendChart records={records} notificationSettings={notificationSettings} />

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>日期</th>
                  <th>時間</th>
                  <th>收縮壓</th>
                  <th>舒張壓</th>
                  <th>心跳</th>
                  <th>狀態</th>
                  <th>備註</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => {
                  const status = getBloodPressureStatus(record, notificationSettings);

                  return (
                    <tr className={`record-row status-${status.level}`} key={record.id}>
                      <td>{record.date}</td>
                      <td>{record.time}</td>
                      <td>{record.systolic}</td>
                      <td>{record.diastolic}</td>
                      <td>{record.pulse}</td>
                      <td>
                        <span className={`status-pill status-${status.level}`}>
                          {status.label}
                        </span>
                      </td>
                      <td>{record.note || "無"}</td>
                      <td>
                        <div className="table-actions">
                          {onEditRecord && (
                            <button
                              className="secondary-button table-button"
                              type="button"
                              onClick={() => onEditRecord(record)}
                            >
                              修改
                            </button>
                          )}
                          {onDeleteRecord && (
                            <button
                              className="danger-button table-button"
                              type="button"
                              onClick={() => setRecordToDelete(record)}
                            >
                              刪除
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <button className="secondary-button" type="button" onClick={onBack}>
        返回今日狀態
      </button>

      {recordToDelete && (
        <DeleteConfirmModal
          record={recordToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => setRecordToDelete(null)}
        />
      )}
    </section>
  );
}

export default HistoryPage;
