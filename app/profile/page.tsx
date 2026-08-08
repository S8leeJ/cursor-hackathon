"use client";

import { useClerk } from "@clerk/nextjs";
import { useAction, useConvexAuth, useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { CodePicture } from "@/components/CodePicture";
import { ChipIcon, UserIcon, VerifiedBadge } from "@/components/icons";
import { api } from "@/convex/_generated/api";
import {
  computePersona,
  fingerprintChips,
  snippetFilename,
  snippetForProfile,
  type ModelMix,
  type TokenBurnBand,
} from "@/lib/swender";

export default function Profile() {
  const { signOut } = useClerk();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const me = useQuery(api.users.current, isAuthenticated ? {} : "skip");

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <main className="flex-1 px-5 pb-4 pt-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-serif text-4xl text-ink">Profile</h1>
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => void signOut({ redirectUrl: "/" })}
              className="rounded-full border border-line-bright px-3.5 py-1.5 text-[11px] tracking-wide text-muted transition hover:border-rose hover:text-rose"
            >
              Sign out
            </button>
          )}
        </div>

        {authLoading || (isAuthenticated && me === undefined) ? (
          <p className="mt-16 text-center text-xs tracking-wide text-muted">
            Loading…
          </p>
        ) : !isAuthenticated ? (
          <Empty
            body="sign in to view your twin profile"
            href="/sign-in"
            cta="Sign in"
          />
        ) : !me?.hasFingerprint ||
          !me.preferredAgents ||
          !me.modelMix ||
          !me.typicalTokenBurn ? (
          <Empty
            body="404: fingerprint not found. run onboarding to init."
            href="/onboarding"
            cta="Get started"
          />
        ) : (
          <ProfileCard
            name={me.name}
            school={me.school}
            bio={me.bio}
            avatarUrl={me.avatarUrl}
            linkedinUrl={me.linkedinUrl}
            preferredAgents={me.preferredAgents}
            modelMix={me.modelMix}
            typicalTokenBurn={me.typicalTokenBurn}
          />
        )}
      </main>
      <BottomNav />
    </div>
  );
}

function ProfileCard({
  name,
  school,
  bio,
  avatarUrl,
  linkedinUrl,
  preferredAgents,
  modelMix,
  typicalTokenBurn,
}: {
  name: string;
  school?: string;
  bio?: string;
  avatarUrl?: string;
  linkedinUrl?: string;
  preferredAgents: string[];
  modelMix: ModelMix;
  typicalTokenBurn: TokenBurnBand;
}) {
  const persona = computePersona({
    preferredAgents,
    modelMix,
    typicalTokenBurn,
  });
  const chips = fingerprintChips({
    preferredAgents,
    modelMix,
    typicalTokenBurn,
    school,
  });

  return (
    <div className="float-up mt-6">
      <div className="flex flex-col items-center rounded-3xl border border-line bg-card px-6 py-8 text-center">
        <span className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-line-bright bg-gradient-to-b from-[#2a0f16] to-[#12060a] font-serif text-4xl text-blush">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            name.charAt(0).toUpperCase() || "?"
          )}
        </span>
        <p className="mt-4 flex items-center gap-2 font-serif text-3xl text-ink">
          {name}
          <VerifiedBadge className="h-5 w-5 text-rose" />
        </p>
        {school && (
          <p className="mt-1 text-xs tracking-wide text-muted">{school}</p>
        )}
        {linkedinUrl && (
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-[11px] tracking-wide text-blush underline-offset-2 transition hover:text-rose hover:underline"
          >
            LinkedIn profile →
          </a>
        )}
        <span className="mt-3 rounded-full bg-wine px-4 py-1.5 text-[11px] font-medium tracking-wide text-ink">
          {persona.title}
        </span>
        <p className="mt-3 max-w-64 text-xs leading-relaxed tracking-wide text-muted">
          {persona.tagline}
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-card px-5 py-4">
        <p className="text-[9px] uppercase tracking-[0.3em] text-muted">
          your fingerprint
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span
              key={chip.label}
              className="flex items-center gap-1.5 rounded-full border border-line-bright px-3 py-1 text-[11px] text-ink"
            >
              <ChipIcon chip={chip} />
              {chip.label}
            </span>
          ))}
        </div>
        <CodePicture
          filename={snippetFilename(name)}
          lines={snippetForProfile({
            name,
            preferredAgents,
            modelMix,
            typicalTokenBurn,
          })}
          className="mt-4"
          textSize="text-[10px]"
        />
      </div>

      {bio && (
        <div className="mt-4 rounded-2xl border border-line bg-card px-5 py-4">
          <p className="text-[9px] uppercase tracking-[0.3em] text-rose">
            hot take
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-ink/90">
            &ldquo;{bio}&rdquo;
          </p>
        </div>
      )}

      <LinkedInSection
        linkedinUrl={linkedinUrl}
        currentName={name}
        currentSchool={school}
        currentBio={bio}
        currentAvatarUrl={avatarUrl}
      />

      <div className="mt-6 flex gap-3">
        <Link
          href="/onboarding"
          className="flex-1 rounded-full border border-line-bright py-3 text-center text-xs tracking-wide text-blush transition hover:border-rose"
        >
          Edit fingerprint
        </Link>
        <Link
          href="/wrapped"
          className="flex-1 rounded-full bg-wine py-3 text-center text-xs font-semibold tracking-wide text-ink transition hover:bg-wine-hover"
        >
          View my card
        </Link>
      </div>
    </div>
  );
}

type ImportPreview = {
  name?: string;
  school?: string;
  bio?: string;
  headline?: string;
  avatarUrl?: string;
  source: "open_graph" | "paste" | "none";
  note?: string;
  linkedinUrl: string;
};

function LinkedInSection({
  linkedinUrl,
  currentName,
  currentSchool,
  currentBio,
  currentAvatarUrl,
}: {
  linkedinUrl?: string;
  currentName: string;
  currentSchool?: string;
  currentBio?: string;
  currentAvatarUrl?: string;
}) {
  const setLinkedInUrl = useMutation(api.users.setLinkedInUrl);
  const applyImport = useMutation(api.users.applyLinkedInImport);
  const previewImport = useAction(api.linkedin.previewImport);
  const previewFromPaste = useAction(api.linkedin.previewFromPaste);

  const [draft, setDraft] = useState(linkedinUrl ?? "");
  const [pasteText, setPasteText] = useState("");
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [showPaste, setShowPaste] = useState(false);
  const [applyName, setApplyName] = useState(true);
  const [applySchool, setApplySchool] = useState(true);
  const [applyBio, setApplyBio] = useState(true);
  const [applyAvatar, setApplyAvatar] = useState(false);

  const adoptPreview = (result: ImportPreview) => {
    setDraft(result.linkedinUrl);
    setPreview(result.source === "none" ? null : result);
    setApplyName(Boolean(result.name));
    setApplySchool(Boolean(result.school));
    setApplyBio(Boolean(result.bio || result.headline));
    setApplyAvatar(false);
    setStatus(result.note ?? "Preview ready — pick what to apply.");
    if (result.source === "none") {
      setShowPaste(true);
    }
  };

  const saveLink = async () => {
    setSaving(true);
    setError(null);
    setStatus(null);
    try {
      const updated = await setLinkedInUrl({
        linkedinUrl: draft.trim() ? draft.trim() : null,
      });
      setDraft(updated.linkedinUrl ?? "");
      setStatus(updated.linkedinUrl ? "LinkedIn link saved." : "LinkedIn link cleared.");
      setPreview(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save LinkedIn URL");
    } finally {
      setSaving(false);
    }
  };

  const runImport = async () => {
    const url = draft.trim() || linkedinUrl;
    if (!url) {
      setError("Add a LinkedIn URL first");
      return;
    }

    setImporting(true);
    setError(null);
    setStatus(null);
    try {
      // Persist the link before preview so a failed fetch still keeps the URL.
      await setLinkedInUrl({ linkedinUrl: url });
      const result = await previewImport({ linkedinUrl: url });
      adoptPreview(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to import from LinkedIn");
      setShowPaste(true);
    } finally {
      setImporting(false);
    }
  };

  const runPasteImport = async () => {
    const url = draft.trim() || linkedinUrl;
    if (!url) {
      setError("Add a LinkedIn URL first");
      return;
    }
    if (!pasteText.trim()) {
      setError("Paste your LinkedIn headline or About text");
      return;
    }

    setImporting(true);
    setError(null);
    setStatus(null);
    try {
      await setLinkedInUrl({ linkedinUrl: url });
      const result = await previewFromPaste({
        linkedinUrl: url,
        pastedText: pasteText,
      });
      adoptPreview(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse pasted text");
    } finally {
      setImporting(false);
    }
  };

  const applyPreview = async () => {
    if (!preview) return;
    setApplying(true);
    setError(null);
    setStatus(null);
    try {
      const bioValue = preview.bio || preview.headline;
      await applyImport({
        linkedinUrl: preview.linkedinUrl,
        name: applyName && preview.name ? preview.name : undefined,
        school: applySchool && preview.school ? preview.school : undefined,
        bio: applyBio && bioValue ? bioValue : undefined,
        avatarUrl:
          applyAvatar && preview.avatarUrl ? preview.avatarUrl : undefined,
      });
      setStatus("Applied LinkedIn fields to your profile.");
      setPreview(null);
      setPasteText("");
      setShowPaste(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to apply import");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="mt-4 rounded-2xl border border-line bg-card px-5 py-4">
      <p className="text-[9px] uppercase tracking-[0.3em] text-muted">
        linkedin
      </p>
      <p className="mt-2 text-[11px] leading-relaxed tracking-wide text-muted">
        Add your profile link. Try a public preview import, or paste your
        headline / About if LinkedIn blocks the fetch — you choose what to apply.
      </p>
      <input
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          setError(null);
          setStatus(null);
        }}
        placeholder="linkedin.com/in/your-name"
        className="mt-3 w-full rounded-xl border border-line bg-card-2 px-4 py-3 text-sm text-ink placeholder:text-faint focus:border-rose focus:outline-none"
      />
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => void saveLink()}
          disabled={saving || importing}
          className="flex-1 rounded-full border border-line-bright py-2.5 text-[11px] tracking-wide text-blush transition hover:border-rose disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save link"}
        </button>
        <button
          type="button"
          onClick={() => void runImport()}
          disabled={saving || importing || (!draft.trim() && !linkedinUrl)}
          className="flex-1 rounded-full bg-wine py-2.5 text-[11px] font-semibold tracking-wide text-ink transition hover:bg-wine-hover disabled:opacity-40"
        >
          {importing ? "Importing…" : "Import preview"}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setShowPaste((v) => !v)}
        className="mt-3 text-[11px] tracking-wide text-muted underline-offset-2 hover:text-blush hover:underline"
      >
        {showPaste ? "Hide paste import" : "Or paste headline / About"}
      </button>

      {showPaste && (
        <div className="mt-3 space-y-2">
          <textarea
            value={pasteText}
            onChange={(e) => {
              setPasteText(e.target.value);
              setError(null);
            }}
            rows={4}
            placeholder={"Name — Headline\nYour About text from LinkedIn…"}
            className="w-full resize-none rounded-xl border border-line bg-card-2 px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-faint focus:border-rose focus:outline-none"
          />
          <button
            type="button"
            onClick={() => void runPasteImport()}
            disabled={
              saving ||
              importing ||
              !pasteText.trim() ||
              (!draft.trim() && !linkedinUrl)
            }
            className="w-full rounded-full border border-line-bright py-2.5 text-[11px] tracking-wide text-blush transition hover:border-rose disabled:opacity-40"
          >
            {importing ? "Parsing…" : "Parse paste"}
          </button>
        </div>
      )}

      {error && (
        <p className="mt-3 text-[11px] leading-relaxed text-rose">{error}</p>
      )}
      {status && !error && (
        <p className="mt-3 text-[11px] leading-relaxed text-muted">{status}</p>
      )}

      {preview && preview.source !== "none" && (
        <div className="mt-4 space-y-3 border-t border-line pt-4">
          <p className="text-[9px] uppercase tracking-[0.3em] text-rose">
            import preview
          </p>
          {preview.name && (
            <ToggleRow
              checked={applyName}
              onChange={setApplyName}
              label="Name"
              value={preview.name}
              current={currentName}
            />
          )}
          {preview.school && (
            <ToggleRow
              checked={applySchool}
              onChange={setApplySchool}
              label="School"
              value={preview.school}
              current={currentSchool}
            />
          )}
          {(preview.bio || preview.headline) && (
            <ToggleRow
              checked={applyBio}
              onChange={setApplyBio}
              label="Bio"
              value={preview.bio || preview.headline || ""}
              current={currentBio}
            />
          )}
          {preview.avatarUrl && (
            <ToggleRow
              checked={applyAvatar}
              onChange={setApplyAvatar}
              label="Photo"
              value="Use LinkedIn photo"
              current={currentAvatarUrl ? "current photo kept unless checked" : undefined}
            />
          )}
          <button
            type="button"
            onClick={() => void applyPreview()}
            disabled={
              applying ||
              (!applyName && !applySchool && !applyBio && !applyAvatar)
            }
            className="w-full rounded-full bg-wine py-2.5 text-[11px] font-semibold tracking-wide text-ink transition hover:bg-wine-hover disabled:opacity-40"
          >
            {applying ? "Applying…" : "Apply selected"}
          </button>
        </div>
      )}
    </div>
  );
}

function ToggleRow({
  checked,
  onChange,
  label,
  value,
  current,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  value: string;
  current?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 accent-rose"
      />
      <span className="min-w-0 flex-1">
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted">
          {label}
        </span>
        <span className="mt-0.5 block text-[12px] leading-snug text-ink">
          {value}
        </span>
        {current && current !== value && (
          <span className="mt-0.5 block text-[10px] text-faint">
            now: {current}
          </span>
        )}
      </span>
    </label>
  );
}

function Empty({
  body,
  href,
  cta,
}: {
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="mt-16 flex flex-col items-center text-center">
      <UserIcon className="h-12 w-12 text-line-bright" />
      <p className="mt-5 max-w-60 text-xs leading-relaxed tracking-wide text-muted">
        {body}
      </p>
      <Link
        href={href}
        className="mt-6 rounded-full bg-wine px-8 py-3 text-sm font-semibold tracking-wide text-ink transition hover:bg-wine-hover"
      >
        {cta}
      </Link>
    </div>
  );
}
