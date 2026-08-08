import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-10">
      <p className="text-[10px] text-ink-4">
        <span className="text-cmt">$ </span>swender auth signup
      </p>
      <p className="mt-2 text-[11.5px] leading-relaxed text-ink-3">
        Bring your campus email. Your fingerprint comes next.
      </p>
      <div className="mt-6 flex justify-center">
        <SignUp />
      </div>
    </main>
  );
}
