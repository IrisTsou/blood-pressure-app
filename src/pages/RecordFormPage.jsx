import { useState } from "react";
import { getCurrentTime, getTodayDate } from "../storage";

function RecordFormPage({ recordToEdit, onSave, onCancel }) {
  const isEditing = Boolean(recordToEdit);
  const [formData, setFormData] = useState({
    date: recordToEdit?.date ?? getTodayDate(),
    time: recordToEdit?.time ?? getCurrentTime(),
    systolic: recordToEdit?.systolic ?? "",
    diastolic: recordToEdit?.diastolic ?? "",
    pulse: recordToEdit?.pulse ?? "",
    note: recordToEdit?.note ?? "",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const savedRecord = {
      id: recordToEdit?.id ?? crypto.randomUUID(),
      date: formData.date,
      time: formData.time,
      systolic: Number(formData.systolic),
      diastolic: Number(formData.diastolic),
      pulse: Number(formData.pulse),
      note: formData.note,
      createdAt: recordToEdit?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(savedRecord);
  }

  return (
    <section className="summary-card">
      <p className="eyebrow">{isEditing ? "修改紀錄" : "新增紀錄"}</p>
      <h1>{isEditing ? "更新這筆血壓" : "輸入這次的血壓"}</h1>

      <form className="record-form" onSubmit={handleSubmit}>
        <label>
          日期
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          時間
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          收縮壓
          <input
            type="number"
            name="systolic"
            inputMode="numeric"
            placeholder="例如 128"
            value={formData.systolic}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          舒張壓
          <input
            type="number"
            name="diastolic"
            inputMode="numeric"
            placeholder="例如 82"
            value={formData.diastolic}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          心跳
          <input
            type="number"
            name="pulse"
            inputMode="numeric"
            placeholder="例如 76"
            value={formData.pulse}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          備註
          <textarea
            rows="3"
            name="note"
            placeholder="例如：早餐後、已吃藥"
            value={formData.note}
            onChange={handleChange}
          />
        </label>

        <div className="button-row">
          <button type="submit">{isEditing ? "儲存修改" : "儲存紀錄"}</button>
          <button className="secondary-button" type="button" onClick={onCancel}>
            取消
          </button>
        </div>
      </form>
    </section>
  );
}

export default RecordFormPage;
