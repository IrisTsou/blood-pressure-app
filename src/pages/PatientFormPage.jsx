import { useState } from "react";

function PatientFormPage({ onSave, onCancel }) {
  const [displayName, setDisplayName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [note, setNote] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    onSave({
      displayName,
      birthYear: birthYear ? Number(birthYear) : null,
      note,
    });
  }

  return (
    <section className="summary-card">
      <p className="eyebrow">被照護者</p>
      <h1>建立被照護者檔案</h1>

      <form className="record-form" onSubmit={handleSubmit}>
        <label>
          姓名或稱呼
          <input
            type="text"
            placeholder="例如：王媽媽"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            required
          />
        </label>

        <label>
          出生年份
          <input
            type="number"
            inputMode="numeric"
            placeholder="例如：1948"
            value={birthYear}
            onChange={(event) => setBirthYear(event.target.value)}
          />
        </label>

        <label>
          備註
          <textarea
            rows="3"
            placeholder="例如：高血壓用藥、平時由女兒協助記錄"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </label>

        <div className="button-row">
          <button type="submit">建立檔案</button>
          <button className="secondary-button" type="button" onClick={onCancel}>
            取消
          </button>
        </div>
      </form>
    </section>
  );
}

export default PatientFormPage;
