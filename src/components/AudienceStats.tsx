import { useState, useEffect } from 'react';

type Platform = 'youtube' | 'substack' | 'spotify' | 'apple';

interface Snapshot {
  id: string;
  platform: Platform;
  count: number;
  recordedOn: string;
  source: 'api' | 'manual';
}

interface PlatformSummary {
  platform: Platform;
  latest: Snapshot | null;
  previous: Snapshot | null;
}

interface Props {
  initialSummary: PlatformSummary[];
  initialHistory: Snapshot[];
  youtubeLive: boolean;
}

const PLATFORM_INFO: Record<Platform, { label: string; unit: string; dashboard: string; dashboardLabel: string }> = {
  youtube: { label: 'YouTube', unit: 'subscribers', dashboard: 'https://studio.youtube.com', dashboardLabel: 'YouTube Studio' },
  substack: { label: 'Substack', unit: 'subscribers', dashboard: 'https://aidialogos.substack.com/publish/subscribers', dashboardLabel: 'Substack dashboard' },
  spotify: { label: 'Spotify', unit: 'followers', dashboard: 'https://creators.spotify.com', dashboardLabel: 'Spotify for Creators' },
  apple: { label: 'Apple Podcasts', unit: 'followers', dashboard: 'https://podcastsconnect.apple.com', dashboardLabel: 'Apple Podcasts Connect' },
};

const fmt = (n: number) => n.toLocaleString('en-US');

const fmtDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const localToday = () => new Date().toLocaleDateString('en-CA');

const inputClass =
  'w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60';

export function AudienceStats({ initialSummary, initialHistory, youtubeLive }: Props) {
  const [summary, setSummary] = useState(initialSummary);
  const [history, setHistory] = useState(initialHistory);
  const manualPlatforms: Platform[] = youtubeLive ? ['substack', 'spotify', 'apple'] : ['substack', 'spotify', 'apple', 'youtube'];
  const [platform, setPlatform] = useState<Platform>('substack');
  const [count, setCount] = useState('');
  const [recordedOn, setRecordedOn] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set the default date on the client so it's the admin's local day, not the server's.
  useEffect(() => { setRecordedOn(localToday()); }, []);

  const combined = summary.reduce((sum, s) => sum + (s.latest?.count ?? 0), 0);
  const reporting = summary.filter((s) => s.latest).length;

  const handleSave = async () => {
    const n = Number(count.replace(/,/g, ''));
    if (!count.trim() || !Number.isInteger(n) || n < 0) {
      setError('Enter a whole number.');
      return;
    }

    setSaving(true);
    setError(null);

    const res = await fetch('/api/audience', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, count: n, recordedOn: recordedOn || undefined }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error || `Failed to save (HTTP ${res.status})`);
      setSaving(false);
      return;
    }

    setSummary(data.summary);
    setHistory(data.history);
    setCount('');
    setSaving(false);
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map(({ platform: p, latest, previous }) => {
          const info = PLATFORM_INFO[p];
          const delta = latest && previous ? latest.count - previous.count : null;
          return (
            <div key={p} className="card flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{info.label}</h2>
                {latest && (
                  <span className="rounded bg-primary/15 px-1.5 py-0.5 text-xs font-medium text-primary">
                    {latest.source === 'api' ? 'API' : 'manual'}
                  </span>
                )}
              </div>
              {latest ? (
                <>
                  <p className="text-3xl font-semibold tabular-nums text-foreground">
                    {latest.source === 'api' && <span title="YouTube rounds to 3 significant figures">≈</span>}
                    {fmt(latest.count)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {info.unit} · as of {fmtDate(latest.recordedOn)}
                  </p>
                  {delta !== null && previous && (
                    <p className={`text-xs tabular-nums ${delta > 0 ? 'text-emerald-500' : delta < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                      {delta > 0 ? '+' : ''}{fmt(delta)} since {fmtDate(previous.recordedOn)}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No data yet.</p>
              )}
              <a href={info.dashboard} target="_blank" rel="noopener noreferrer" className="mt-auto pt-2 text-xs text-primary hover:underline">
                {info.dashboardLabel} ↗
              </a>
            </div>
          );
        })}
      </div>

      <div className="card space-y-1">
        <p className="text-sm text-muted-foreground">
          Combined reach ({reporting} of 4 channels): <span className="font-semibold tabular-nums text-foreground">{fmt(combined)}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          This is a sum across platforms, not unique people — the same person may follow on several channels.
          {!youtubeLive && ' YouTube is manual entry until YOUTUBE_API_KEY is set.'}
        </p>
      </div>

      <div className="card space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Record a count</h3>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="space-y-1">
            <span className="text-sm font-medium text-foreground">Channel</span>
            <select value={platform} onChange={(e) => setPlatform(e.target.value as Platform)} className={inputClass}>
              {manualPlatforms.map((p) => (
                <option key={p} value={p}>{PLATFORM_INFO[p].label}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-foreground">
              {PLATFORM_INFO[platform].unit[0].toUpperCase() + PLATFORM_INFO[platform].unit.slice(1)}
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={count}
              placeholder="e.g. 1,250"
              onChange={(e) => setCount(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
              className={inputClass}
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-foreground">As of</span>
            <input type="date" value={recordedOn} onChange={(e) => setRecordedOn(e.target.value)} className={inputClass} />
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          Find it in{' '}
          <a href={PLATFORM_INFO[platform].dashboard} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            {PLATFORM_INFO[platform].dashboardLabel}
          </a>
          . Saving again for the same date replaces that day's number.
        </p>
        <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">History</h3>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">No snapshots yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">Channel</th>
                  <th className="py-2 pr-4 text-right font-medium">Count</th>
                  <th className="py-2 font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row.id} className="border-b border-border/50">
                    <td className="py-2 pr-4 text-muted-foreground">{fmtDate(row.recordedOn)}</td>
                    <td className="py-2 pr-4 text-foreground">{PLATFORM_INFO[row.platform].label}</td>
                    <td className="py-2 pr-4 text-right tabular-nums text-foreground">{fmt(row.count)}</td>
                    <td className="py-2 text-muted-foreground">{row.source === 'api' ? 'API' : 'manual'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
