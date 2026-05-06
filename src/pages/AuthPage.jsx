import { useState } from "react";
import { supabaseAuth } from "../auth/supabaseAuthClient";

function AuthPage() {
  const [authMode, setAuthMode] = useState("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSignUp = authMode === "sign-up";

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const { error } = isSignUp
      ? await supabaseAuth.auth.signUp({ email, password })
      : await supabaseAuth.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage(error.message);
    } else if (isSignUp) {
      setMessage("註冊完成，請確認信箱驗證信後再登入。");
    }

    setIsSubmitting(false);
  }

  return (
    <main>
      <section className="summary-card auth-card">
        <p className="eyebrow">帳號登入</p>
        <h1>{isSignUp ? "建立照護帳號" : "登入血壓紀錄"}</h1>

        <form className="record-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            密碼
            <input
              type="password"
              value={password}
              minLength="6"
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {message && <p className="form-message">{message}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "處理中" : isSignUp ? "註冊" : "登入"}
          </button>
        </form>

        <button
          className="secondary-button auth-switch-button"
          type="button"
          onClick={() => {
            setMessage("");
            setAuthMode(isSignUp ? "sign-in" : "sign-up");
          }}
        >
          {isSignUp ? "已有帳號，改用登入" : "還沒有帳號，建立新帳號"}
        </button>
      </section>
    </main>
  );
}

export default AuthPage;
