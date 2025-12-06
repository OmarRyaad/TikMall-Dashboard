"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { BASE_API_URL } from "../../config/apiConfig";
import { useLanguage } from "../../context/LanguageContext";

export default function SignInForm() {
  const { lang } = useLanguage();
  const isRTL = lang === "ar";
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    phone?: string;
    password?: string;
  }>({});

  const validate = () => {
    const errors: { phone?: string; password?: string } = {};

    // Phone validation
    if (!phone.trim()) {
      errors.phone =
        lang === "ar" ? "رقم الجوال مطلوب" : "Phone number is required";
    } else {
      const phoneRegex = /^\+?\d{12,13}$/;
      if (!phoneRegex.test(phone.trim())) {
        errors.phone =
          lang === "ar"
            ? "رقم الجوال يجب أن يكون 12 أو 13 رقمًا"
            : "Phone number must be 12 or 13 digits";
      }
    }

    // Password validation
    if (!password.trim()) {
      errors.password =
        lang === "ar" ? "كلمة المرور مطلوبة" : "Password is required";
    } else if (password.trim().length < 6) {
      errors.password =
        lang === "ar"
          ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل"
          : "Password must be at least 6 characters long";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setLoading(true);

    try {
      const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;

      const res = await fetch(`${BASE_API_URL}/auth/login/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formattedPhone, password }),
      });

      const data = await res.json();

      if (!res.ok)
        throw new Error(
          data.message || (lang === "ar" ? "فشل تسجيل الدخول" : "Login failed")
        );

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));

        localStorage.setItem("permissions", JSON.stringify(data.permissions));

        localStorage.setItem(
          "user",
          JSON.stringify({ ...data.user, permissions: data.permissions })
        );
        navigate("/");
      } else {
        setError(
          lang === "ar"
            ? "استجابة تسجيل دخول غير صالحة"
            : "Invalid login response"
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error)
        setError(
          err.message ||
            (lang === "ar"
              ? "حدث خطأ غير متوقع"
              : "An unexpected error occurred")
        );
      else
        setError(
          lang === "ar" ? "حدث خطأ غير متوقع" : "An unexpected error occurred"
        );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              {lang === "ar" ? "تسجيل الدخول" : "Sign In"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {lang === "ar"
                ? "أدخل رقم الجوال وكلمة المرور لتسجيل الدخول!"
                : "Enter your phone number and password to sign in!"}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <Label>
                  {lang === "ar" ? "رقم الجوال" : "Phone"}{" "}
                  <span className="text-error-500">*</span>
                </Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={lang === "ar" ? "05XXXXXXXX" : "05XXXXXXXX"}
                  type="tel"
                  className={`text-right ${
                    isRTL ? "placeholder:text-right" : "placeholder:text-left"
                  }`}
                />
                {validationErrors.phone && (
                  <p className="text-sm text-red-500 mt-1">
                    {validationErrors.phone}
                  </p>
                )}
              </div>

              <div>
                <Label>
                  {lang === "ar" ? "كلمة المرور" : "Password"}{" "}
                  <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      lang === "ar" ? "أدخل كلمة المرور" : "Enter your password"
                    }
                    className={`${
                      isRTL ? "placeholder:text-right" : "placeholder:text-left"
                    }`}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute z-30 -translate-y-1/2 cursor-pointer top-1/2 ${
                      isRTL ? "left-4" : "right-4"
                    }`}
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )}
                  </span>
                </div>
                {validationErrors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {validationErrors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox checked={isChecked} onChange={setIsChecked} />
                  <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                    {lang === "ar"
                      ? "إبقني مسجلاً الدخول"
                      : "Keep me logged in"}
                  </span>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <div>
                <Button
                  className="w-full"
                  size="sm"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? lang === "ar"
                      ? "جاري تسجيل الدخول..."
                      : "Signing in..."
                    : lang === "ar"
                    ? "تسجيل الدخول"
                    : "Sign in"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
