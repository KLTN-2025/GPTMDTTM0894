"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { API_CONFIG } from "@/config/api";

function VerifyOtpContent() {
  const [timeLeft, setTimeLeft] = useState(180);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const inputsRef = useRef([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneOrEmail = searchParams.get("phoneOrEmail"); // nhận lại từ query

  // Đếm ngược thời gian
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const countdown = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(countdown);
  }, [timeLeft]);

  // Xử lý nhập từng ô
  const handleChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        inputsRef.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        const enteredOtp = otp.join("");

        if (enteredOtp.length < 6 || otp.includes("")) {
            setError("Vui lòng nhập đầy đủ 6 chữ số OTP.");
            return;
        }

        try {
            const response = await fetch(API_CONFIG.getApiUrl("/customers/forgot/verify-otp"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phoneOrEmail, otp: enteredOtp }),
            });

            const data = await response.json();

            if (!response.ok) {
            throw new Error(data.message || "Mã OTP không chính xác hoặc đã hết hạn.");
            }

            // ✅ Lưu token khi xác minh OTP thành công
            localStorage.setItem("resetIdentity", phoneOrEmail);

            setMessage("Xác minh thành công. Đang chuyển hướng...");
            setTimeout(() => {
            router.push(`/reset-password?phoneOrEmail=${encodeURIComponent(phoneOrEmail)}`);
            }, 1000);
        } catch (err) {
            setError(err.message);
        }
    };


  const handleResend = async () => {
    setError("");
    setMessage("");
    try {
      const response = await fetch(API_CONFIG.getApiUrl("/customers/forgot/send-otp"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneOrEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không gửi lại được mã OTP.");
      }

      setMessage("Đã gửi lại mã OTP.");
      setOtp(["", "", "", "", "", ""]);
      setTimeLeft(180);
      setCanResend(false);
      inputsRef.current[0]?.focus();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatTime = () => {
    const m = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const s = String(timeLeft % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <section className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow p-4">
            <h3 className="text-center mb-4">Nhập Mã OTP</h3>

            <form onSubmit={handleSubmit}>
              <div className="d-flex justify-content-between mb-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputsRef.current[index] = el)}
                    type="text"
                    maxLength="1"
                    className="form-control text-center otp-input"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    inputMode="numeric"
                  />
                ))}
              </div>

              <div className="text-center mb-3">
                <span>
                  Thời gian còn lại:{" "}
                  <span className="fw-bold" style={{ color: timeLeft === 0 ? "red" : "inherit" }}>
                    {timeLeft === 0 ? "Hết hạn" : formatTime()}
                  </span>
                </span>
              </div>

              {error && <div className="alert alert-danger">{error}</div>}
              {message && <div className="alert alert-success">{message}</div>}

              <div className="d-grid mb-3">
                <button type="submit" className="btn btn-primary">
                  Xác Nhận
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  className="btn btn-link"
                  disabled={!canResend}
                >
                  Gửi lại mã
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .otp-input {
          width: 3rem;
          height: 3rem;
          font-size: 1.5rem;
          margin: 0 0.25rem;
        }
      `}</style>
    </section>
  );
}

// Loading component
function VerifyOtpLoading() {
  return (
    <section className="section-content padding-y" style={{ minHeight: "84vh" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
              <p className="mt-3">Đang tải...</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Main component with Suspense wrapper
export default function VerifyOtp() {
  return (
    <Suspense fallback={<VerifyOtpLoading />}>
      <VerifyOtpContent />
    </Suspense>
  );
}
