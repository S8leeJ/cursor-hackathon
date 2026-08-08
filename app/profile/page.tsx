"use client";

import { useClerk } from "@clerk/nextjs";
import { useAction, useConvexAuth, useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { CodePane } from "@/components/CodePane";
import { ChipIcon, UserIcon, VerifiedBadge } from "@/components/icons";
import { Avatar } from "@/components/Identicon";
import {
  Button,
  ButtonLink,
  Chip,
  EmptyState,
  Label,
  Loading,
  Panel,
} from "@/components/ui";
import { api } from "@/convex/_generated/api";
import {
  computePersona,
  fingerprintChips,
  handleOf,
  snippetFilename,
  snippetForProfile,
  type ModelMix,
  type TokenBurnBand,
} from "@/lib/swender";

export default function Profile() {
  const { signOut } = useClerk();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const me = useQuery(api.users.current, isAuthenticated ? {} : "skip");

  const fingerprint =
    me?.hasFingerprint && me.preferredAgents && me.modelMix && me.typicalTokenBurn
      ? {
          preferredAgents: me.preferredAgents,
          modelMix: me.modelMix,
          typicalTokenBurn: me.typicalTokenBurn,
        }
      : null;

  return (
    <AppShell
      path="~/profile"
      branch={me && fingerprint ? `feat/${handleOf(me.name)}` : "main"}
      status={
        fingerprint ? (
          <span className="text-added">fingerprint synced</span>
        ) : undefined
      }
    >
      {authLoading || (isAuthenticated && me === undefined) ? (
        <Loading what="reading profile" />
      ) : !isAuthenticated ? (
        <EmptyState
          glyph={<UserIcon className="h-5 w-5" />}
          code="401 unauthorized"
          title="Sign in to view your profile"
          body="your fingerprint lives on your account, so nothing shows until you're in."
          href="/sign-in"
          cta="Sign in"
        />
      ) : !me || !fingerprint ? (
        <EmptyState
          glyph={<UserIcon className="h-5 w-5" />}
          code="404 fingerprint not found"
          title="Nothing committed yet"
          body="run onboarding to write your fingerprint and join the campus index."
          href="/onboarding"
          cta="Build my fingerprint"
        />
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <Avatar
                id={me._id}
                name={me.name}
                src={me.avatarUrl}
                size={64}
              />
              <div className="min-w-0">
                <p className="flex items-center gap-1.5">
                  <span className="truncate text-[19px] font-semibold leading-tight tracking-[-0.02em] text-ink">
                    {me.name}
                  </span>
                  <VerifiedBadge className="h-4 w-4 shrink-0 text-kw" />
                </p>
                <p className="mt-1 truncate text-[11px] text-ink-3">
                  @{handleOf(me.name)}
                  {me.school ? ` · ${me.school}` : ""}
                </p>
                {me.linkedinUrl && (
                  <a
                    href={me.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-[11px] text-kw underline-offset-2 hover:underline"
                  >
                    LinkedIn profile →
                  </a>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void signOut({ redirectUrl: "/" })}
            >
              sign out
            </Button>
          </div>

          <ProfileBody
            id={me._id}
            name={me.name}
            school={me.school}
            bio={me.bio}
            avatarUrl={me.avatarUrl}
            linkedinUrl={me.linkedinUrl}
            preferredAgents={me.preferredAgents}
            modelMix={me.modelMix}
            typicalTokenBurn={me.typicalTokenBurn}
          />
        </>
      )}
    </AppShell>
  );
}

function ProfileBody({
  id,
  name,
  school,
  bio,
  avatarUrl,
  linkedinUrl,
  preferredAgents,
  modelMix,
  typicalTokenBurn,
}: {
  id: string;
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
    <div className="rise mt-5 flex flex-col gap-3">
      <div className="border-l-2 border-kw/50 pl-3">
        <p className="text-[13px] font-semibold text-kw">{persona.title}</p>
        <p className="mt-1 text-[11.5px] leading-relaxed text-ink-3">
          {persona.tagline}
        </p>
      </div>

      <Panel filename={snippetFilename(name)} bodyClassName="pb-3">
        <CodePane
          rows={snippetForProfile({
            name,
            preferredAgents,
            modelMix,
            typicalTokenBurn,
          })}
          textSize="text-[10.5px]"
        />
        <div className="mt-3 flex flex-wrap gap-1.5 px-3">
          {chips.map((chip) => (
            <Chip key={chip.label}>
              <ChipIcon chip={chip} />
              {chip.label}
            </Chip>
          ))}
        </div>
      </Panel>

      {bio && (
        <Panel filename="README.md" bodyClassName="px-3.5 py-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-ink-4">
            # hot take
          </p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-2">
            {bio}
          </p>
        </Panel>
      )}

      <LinkedInSection
        linkedinUrl={linkedinUrl}
        currentName={name}
        currentSchool={school}
        currentBio={bio}
        currentAvatarUrl={avatarUrl}
      />

      <div className="mt-1 flex gap-2">
        <ButtonLink href="/onboarding" variant="ghost" size="lg" className="flex-1">
          Edit fingerprint
        </ButtonLink>
        <ButtonLink href="/wrapped" size="lg" className="flex-1">
          Release card
        </ButtonLink>
      </div>
      <p className="text-center text-[10px] text-ink-4">
        id {id.slice(0, 8)} · indexed for RAG search
      </p>
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
    <Panel filename="linkedin.toml" bodyClassName="px-3.5 py-3">
      <Label>linkedin</Label>
      <p className="mt-2 text-[11.5px] leading-relaxed text-ink-3">
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
        className="mt-3 w-full rounded-sm border border-rule bg-inset px-3 py-2.5 text-[12px] text-ink placeholder:text-ink-4 focus:border-fn/60"
      />
      <div className="mt-3 flex gap-2">
        <Button
          type="button"
          variant="ghost"
          size="md"
          onClick={() => void saveLink()}
          disabled={saving || importing}
          className="flex-1"
        >
          {saving ? "Saving…" : "Save link"}
        </Button>
        <Button
          type="button"
          size="md"
          onClick={() => void runImport()}
          disabled={saving || importing || (!draft.trim() && !linkedinUrl)}
          className="flex-1"
        >
          {importing ? "Importing…" : "Import preview"}
        </Button>
      </div>

      <button
        type="button"
        onClick={() => setShowPaste((v) => !v)}
        className="mt-3 text-[11px] text-ink-3 underline-offset-2 hover:text-ink hover:underline"
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
            className="w-full resize-none rounded-sm border border-rule bg-inset px-3 py-2.5 text-[12px] leading-relaxed text-ink placeholder:text-ink-4 focus:border-fn/60"
          />
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={() => void runPasteImport()}
            disabled={
              saving ||
              importing ||
              !pasteText.trim() ||
              (!draft.trim() && !linkedinUrl)
            }
            className="w-full"
          >
            {importing ? "Parsing…" : "Parse paste"}
          </Button>
        </div>
      )}

      {error && (
        <p className="mt-3 text-[11px] leading-relaxed text-deleted">{error}</p>
      )}
      {status && !error && (
        <p className="mt-3 text-[11px] leading-relaxed text-ink-3">{status}</p>
      )}

      {preview && preview.source !== "none" && (
        <div className="mt-4 space-y-3 border-t border-rule pt-4">
          <Label tone="accent">import preview</Label>
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
          <Button
            type="button"
            size="md"
            onClick={() => void applyPreview()}
            disabled={
              applying ||
              (!applyName && !applySchool && !applyBio && !applyAvatar)
            }
            className="w-full"
          >
            {applying ? "Applying…" : "Apply selected"}
          </Button>
        </div>
      )}
    </Panel>
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
        className="mt-1 accent-[var(--kw)]"
      />
      <span className="min-w-0 flex-1">
        <span className="text-[10px] uppercase tracking-[0.2em] text-ink-4">
          {label}
        </span>
        <span className="mt-0.5 block text-[12px] leading-snug text-ink">
          {value}
        </span>
        {current && current !== value && (
          <span className="mt-0.5 block text-[10px] text-ink-4">
            now: {current}
          </span>
        )}
      </span>
    </label>
  );
}
