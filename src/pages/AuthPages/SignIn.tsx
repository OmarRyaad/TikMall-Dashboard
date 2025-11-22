import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";
import { useLanguage } from "../../context/LanguageContext";

export default function SignIn() {
  const { lang } = useLanguage();
  const isRTL = lang === "ar";

  return (
    <>
      <div dir={isRTL ? "rtl" : "ltr"}>
        <AuthLayout>
          <SignInForm />
        </AuthLayout>
      </div>
    </>
  );
}
