function DeleteConfirmModal({ record, onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        <p className="eyebrow">刪除確認</p>
        <h2 id="delete-modal-title">確定要刪除這筆紀錄嗎？</h2>
        <p className="modal-description">
          {record.date} {record.time}，收縮壓 {record.systolic}、舒張壓{" "}
          {record.diastolic}、心跳 {record.pulse}
        </p>

        <div className="button-row">
          <button
            className="danger-button"
            type="button"
            onClick={() => onConfirm(record.id)}
          >
            確認刪除
          </button>
          <button className="secondary-button" type="button" onClick={onCancel}>
            取消
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
