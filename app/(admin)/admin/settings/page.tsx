"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Settings,
  Save,
  Globe,
  Share2,
  Shield,
  MessageSquare,
  FileText,
  AlertTriangle,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DualImagePicker } from "@/components/admin/DualImagePicker";

export default function AdminSettingsPage() {
  // 1. Identification & Press Registration State
  const [siteName, setSiteName] = useState("Nepal Editorial News Portal");
  const [siteNameNp, setSiteNameNp] = useState("नेपाल सम्पादकीय न्युज पोर्टल");
  const [tagline, setTagline] = useState("सत्य, निष्पक्ष र भरपर्दो समाचार कोसेढुङ्गा");
  const [pressCouncilReg, setPressCouncilReg] = useState("५६७/०८०-८१");
  const [deptInfoReg, setDeptInfoReg] = useState("१२३४/०८०-८१");
  const [logoUrl, setLogoUrl] = useState("");

  // 2. Editorial & Commenting System State
  const [commentMode, setCommentMode] = useState<"everyone" | "registered" | "disabled">("registered");
  const [autoModerateComments, setAutoModerateComments] = useState(true);
  const [defaultAuthorArticleStatus, setDefaultAuthorArticleStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");

  // 3. Global SEO & Social Sharing Defaults
  const [defaultMetaTitle, setDefaultMetaTitle] = useState("Nepal News Portal - Latest Politics, Economy, Sports & Breaking Updates");
  const [defaultMetaDesc, setDefaultMetaDesc] = useState("Nepal's premier digital news destination delivering real-time breaking news, political analysis, economic reports, and cultural features.");
  const [canonicalUrl, setCanonicalUrl] = useState("https://nepalnews.com.np");
  const [ogImageUrl, setOgImageUrl] = useState("");

  // 4. Contact & Social Channels State
  const [contactEmail, setContactEmail] = useState("newsroom@nepalnews.com.np");
  const [contactPhone, setContactPhone] = useState("+977 1 4234567 / 4234568");
  const [address, setAddress] = useState("New Baneshwor, Kathmandu, Nepal");
  const [facebookUrl, setFacebookUrl] = useState("https://facebook.com/nepalnewsportal");
  const [twitterUrl, setTwitterUrl] = useState("https://x.com/nepalnewsportal");

  // 5. Emergency Banner & Maintenance State
  const [emergencyAlertText, setEmergencyAlertText] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success || !json.data) return;
        const d = json.data;
        if (d.site_name) setSiteName(d.site_name);
        if (d.site_name_np) setSiteNameNp(d.site_name_np);
        if (d.site_tagline) setTagline(d.site_tagline);
        if (d.press_council_reg) setPressCouncilReg(d.press_council_reg);
        if (d.dept_info_reg) setDeptInfoReg(d.dept_info_reg);
        if (d.site_logo_url) setLogoUrl(d.site_logo_url);
        if (d.contact_email) setContactEmail(d.contact_email);
        if (d.contact_phone) setContactPhone(d.contact_phone);
        if (d.comment_mode) setCommentMode(d.comment_mode as "everyone" | "registered" | "disabled");
        if (d.default_author_status) setDefaultAuthorArticleStatus(d.default_author_status as "DRAFT" | "PUBLISHED");
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_name: siteName,
          site_name_np: siteNameNp,
          site_tagline: tagline,
          press_council_reg: pressCouncilReg,
          dept_info_reg: deptInfoReg,
          site_logo_url: logoUrl,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          comment_mode: commentMode,
          default_author_status: defaultAuthorArticleStatus,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Portal settings saved successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  return (
    <div className="w-full space-y-3 px-4 py-3 pb-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2">
        <div>
          <h1 className="text-base font-bold tracking-tight text-foreground font-serif flex items-center gap-2">
            <Settings className="h-5 w-5 text-[#027081]" />
            <span>Portal Global Settings & System Config</span>
          </h1>
        </div>

        <Button
          onClick={handleSave}
          className="h-8 rounded-lg bg-brand hover:bg-[#0B3F8A] text-white shadow-xs text-[11px] font-bold px-3 py-1 flex items-center gap-1.5 transition-all duration-200"
        >
          <Save className="h-3.5 w-3.5" />
          <span>Save Settings</span>
        </Button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* SECTION 1: Portal Identification & Press Registration */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-3">
            <Globe className="h-4 w-4 text-[#027081]" />
            <span>Portal Identification & Government Press Registration</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-muted-foreground uppercase">English Portal Title *</label>
              <input
                type="text"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full bg-background border rounded-lg px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-[#027081]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-muted-foreground uppercase">Nepali Title *</label>
              <input
                type="text"
                required
                value={siteNameNp}
                onChange={(e) => setSiteNameNp(e.target.value)}
                className="w-full bg-background border rounded-lg px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-[#027081]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-muted-foreground uppercase">Slogan / Tagline *</label>
            <input
              type="text"
              required
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full bg-background border rounded-lg px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-[#027081]"
            />
          </div>

          {/* Press Registrations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="font-semibold text-muted-foreground uppercase flex items-center gap-1">
                <Award className="h-3 w-3 text-[#027081]" />
                <span>Dept. of Information Reg. No.</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 1234/080-81"
                value={deptInfoReg}
                onChange={(e) => setDeptInfoReg(e.target.value)}
                className="w-full bg-background border rounded-lg px-3 py-1.5 text-xs font-mono outline-none focus:border-[#027081]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-muted-foreground uppercase flex items-center gap-1">
                <Award className="h-3 w-3 text-[#027081]" />
                <span>Press Council Reg. No.</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 567/080-81"
                value={pressCouncilReg}
                onChange={(e) => setPressCouncilReg(e.target.value)}
                className="w-full bg-background border rounded-lg px-3 py-1.5 text-xs font-mono outline-none focus:border-[#027081]"
              />
            </div>
          </div>

          {/* Logos */}
          <div className="space-y-3 pt-2">
            <DualImagePicker
              value={logoUrl}
              onChange={setLogoUrl}
              folder="general"
              label="Header Portal Logo"
            />
          </div>
        </div>

        {/* SECTION 2: Editorial & Comment Moderation Controls */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-3">
            <Shield className="h-4 w-4 text-[#027081]" />
            <span>Editorial Moderation & Commenting Controls</span>
          </h2>

          <div className="space-y-1.5">
            <label className="font-semibold text-muted-foreground uppercase flex items-center gap-1">
              <MessageSquare className="h-3 w-3 text-[#027081]" />
              <span>Public Comments Permission</span>
            </label>
            <select
              value={commentMode}
              onChange={(e) => setCommentMode(e.target.value as "everyone" | "registered" | "disabled")}
              className="w-full bg-background border rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-[#027081] cursor-pointer"
            >
              <option value="registered">Registered Signed-In Readers Only</option>
              <option value="everyone">Allow Everyone (Public)</option>
              <option value="disabled">Disable Reader Comments Completely</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
            <div>
              <p className="font-bold text-foreground">Require Admin Comment Moderation</p>
              <p className="text-[10px] text-muted-foreground">Comments must be reviewed before appearing under news articles</p>
            </div>
            <input
              type="checkbox"
              checked={autoModerateComments}
              onChange={(e) => setAutoModerateComments(e.target.checked)}
              className="h-4 w-4 rounded border-border text-[#027081] focus:ring-[#027081]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-muted-foreground uppercase flex items-center gap-1">
              <FileText className="h-3 w-3 text-[#027081]" />
              <span>Default Article Status for Author Submissions</span>
            </label>
            <select
              value={defaultAuthorArticleStatus}
              onChange={(e) => setDefaultAuthorArticleStatus(e.target.value as "DRAFT" | "PUBLISHED")}
              className="w-full bg-background border rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-[#027081] cursor-pointer"
            >
              <option value="DRAFT">Draft (Requires Senior Editor Approval)</option>
              <option value="PUBLISHED">Direct Publish (Instant Release)</option>
            </select>
          </div>
        </div>

        {/* SECTION 3: Global SEO & OpenGraph Social Sharing */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-3">
            <Globe className="h-4 w-4 text-[#027081]" />
            <span>Global SEO Defaults & Social OpenGraph Share Card</span>
          </h2>

          <div className="space-y-1.5">
            <label className="font-semibold text-muted-foreground uppercase">Default Index Meta Title</label>
            <input
              type="text"
              value={defaultMetaTitle}
              onChange={(e) => setDefaultMetaTitle(e.target.value)}
              className="w-full bg-background border rounded-lg px-3 py-2 text-xs outline-none focus:border-[#027081]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-muted-foreground uppercase">Default Meta Search Description</label>
            <textarea
              rows={2}
              value={defaultMetaDesc}
              onChange={(e) => setDefaultMetaDesc(e.target.value)}
              className="w-full bg-background border rounded-lg px-3 py-2 text-xs outline-none focus:border-[#027081]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-muted-foreground uppercase">Canonical Domain URL</label>
            <input
              type="url"
              value={canonicalUrl}
              onChange={(e) => setCanonicalUrl(e.target.value)}
              className="w-full bg-background border rounded-lg px-3 py-1.5 text-xs font-mono outline-none focus:border-[#027081]"
            />
          </div>

          <DualImagePicker
            value={ogImageUrl}
            onChange={setOgImageUrl}
            folder="general"
            label="Default Facebook / Viber OpenGraph Share Image"
          />
        </div>

        {/* SECTION 4: Contact Info & Emergency Banner */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-3">
            <Share2 className="h-4 w-4 text-[#027081]" />
            <span>Contact Details, Social Channels & Emergency Alert</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground uppercase">Newsroom Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full bg-background border rounded-lg px-3 py-1.5 text-xs font-mono outline-none focus:border-[#027081]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground uppercase">Hotline Phone</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full bg-background border rounded-lg px-3 py-1.5 text-xs font-mono outline-none focus:border-[#027081]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground uppercase">Physical Office Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-background border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#027081]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground uppercase">Facebook Page URL</label>
              <input
                type="url"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                className="w-full bg-background border rounded-lg px-3 py-1.5 text-xs font-mono outline-none focus:border-[#027081]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground uppercase">Twitter / X URL</label>
              <input
                type="url"
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                className="w-full bg-background border rounded-lg px-3 py-1.5 text-xs font-mono outline-none focus:border-[#027081]"
              />
            </div>
          </div>

          {/* Emergency Alert Banner */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            <div className="flex items-center justify-between">
              <label className="font-bold text-rose-600 flex items-center gap-1.5 uppercase">
                <AlertTriangle className="h-4 w-4 text-rose-600 animate-pulse" />
                <span>Top Header Emergency Announcement Banner</span>
              </label>
            </div>
            <input
              type="text"
              placeholder="e.g. ⚠️ SPECIAL BROADCAST: National Security Alert in Effect"
              value={emergencyAlertText}
              onChange={(e) => setEmergencyAlertText(e.target.value)}
              className="w-full bg-background border border-rose-300 dark:border-rose-900 rounded-lg px-3 py-2 text-xs text-rose-600 font-semibold outline-none focus:border-rose-500"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
