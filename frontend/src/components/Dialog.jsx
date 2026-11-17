import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

/*
 * 사이트 안에서 띄우는 확인/알림 창.
 * 브라우저 기본 window.confirm / alert 는 환경에 따라(인앱 브라우저, 미리보기 창 등)
 * 아예 뜨지 않고 바로 '취소'로 처리되는 경우가 있어서 직접 만든 창을 쓴다.
 *
 *   const { confirm, notify } = useDialog();
 *   if (!(await confirm("삭제할까요?", { confirmLabel: "삭제", danger: true }))) return;
 *   await notify("삭제하지 못했어요.");
 */

const DialogContext = createContext(null);

export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState(null); // { message, confirmLabel, danger, alertOnly, resolve }
  const confirmBtn = useRef(null);

  const confirm = useCallback(
    (message, options = {}) => new Promise((resolve) => setDialog({ message, ...options, resolve })),
    []
  );

  const notify = useCallback(
    (message) => new Promise((resolve) => setDialog({ message, alertOnly: true, resolve })),
    []
  );

  const close = useCallback(
    (result) => {
      setDialog((current) => {
        current?.resolve(result);
        return null;
      });
    },
    []
  );

  // 열리면 확인 버튼에 포커스, Esc로 취소
  useEffect(() => {
    if (!dialog) return undefined;
    confirmBtn.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") close(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialog, close]);

  return (
    <DialogContext.Provider value={{ confirm, notify }}>
      {children}
      {dialog && (
        <div className="modal-backdrop" onClick={() => close(false)}>
          <div
            className="modal"
            role="alertdialog"
            aria-modal="true"
            aria-describedby="dialog-message"
            onClick={(e) => e.stopPropagation()}
          >
            <p id="dialog-message" style={{ whiteSpace: "pre-wrap", fontSize: 15 }}>
              {dialog.message}
            </p>
            <div className="modal-actions">
              {!dialog.alertOnly && (
                <button type="button" className="btn btn-ghost" onClick={() => close(false)}>
                  취소
                </button>
              )}
              <button
                ref={confirmBtn}
                type="button"
                className={`btn ${dialog.danger ? "btn-danger" : "btn-primary"}`}
                onClick={() => close(true)}
              >
                {dialog.alertOnly ? "확인" : dialog.confirmLabel || "확인"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog는 DialogProvider 안에서만 쓸 수 있어요.");
  return ctx;
}
