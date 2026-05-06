import { useState } from "react";

function ProfilePage({ profile, onSave, onBack }) {
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");

  function handleSubmit(event) {
    event.preventDefault();
    onSave({ displayName, phone });
  }

  return (
    <section className="summary-card">
      <p className="eyebrow">個人資料</p>
      <h1>設定顯示名稱</h1>

      <form className="record-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" value={profile?.email ?? ""} disabled />
        </label>

        <label>
          顯示名稱
          <input
            type="text"
            placeholder="例如：Iris"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            required
          />
        </label>

        <label>
          電話
          <input
            type="tel"
            placeholder="可留空"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </label>

        <div className="button-row">
          <button type="submit">儲存資料</button>
          <button className="secondary-button" type="button" onClick={onBack}>
            返回
          </button>
        </div>
      </form>
    </section>
  );
}

export default ProfilePage;
