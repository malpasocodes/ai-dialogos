import { useState, useEffect } from 'react';

interface Guest {
  id: string;
  name: string;
  initials: string;
  bio: string;
  episodeTitle: string;
  headshot: string | null;
}

interface GuestForm {
  name: string;
  initials: string;
  bio: string;
  episodeTitle: string;
}

const emptyForm: GuestForm = { name: '', initials: '', bio: '', episodeTitle: '' };

export function GuestManager() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null); // guest id or 'new'
  const [form, setForm] = useState<GuestForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchGuests = async () => {
    const res = await fetch('/api/guests');
    if (res.ok) {
      setGuests(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => { fetchGuests(); }, []);

  const handleEdit = (guest: Guest) => {
    setEditing(guest.id);
    setForm({
      name: guest.name,
      initials: guest.initials,
      bio: guest.bio,
      episodeTitle: guest.episodeTitle,
    });
    setError(null);
  };

  const handleNew = () => {
    setEditing('new');
    setForm(emptyForm);
    setError(null);
  };

  const handleCancel = () => {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
  };

  const handleSave = async () => {
    if (!form.name || !form.initials || !form.bio || !form.episodeTitle) {
      setError('All fields are required.');
      return;
    }

    setSaving(true);
    setError(null);

    const isNew = editing === 'new';
    const url = isNew ? '/api/guests' : `/api/guests/${editing}`;
    const method = isNew ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Failed to save.');
      setSaving(false);
      return;
    }

    setSaving(false);
    setEditing(null);
    setForm(emptyForm);
    await fetchGuests();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this guest?')) return;

    const res = await fetch(`/api/guests/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await fetchGuests();
    }
  };

  const updateField = (field: keyof GuestForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading guests...</p>;
  }

  return (
    <div className="space-y-6">
      <button type="button" className="btn-primary" onClick={handleNew}>
        Add Guest
      </button>

      {editing && (
        <div className="card space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            {editing === 'new' ? 'New Guest' : 'Edit Guest'}
          </h3>
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-medium text-foreground">Name</span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-foreground">Initials</span>
              <input
                type="text"
                value={form.initials}
                maxLength={3}
                onChange={(e) => updateField('initials', e.target.value.toUpperCase())}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
              />
            </label>
          </div>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-foreground">Bio</span>
            <textarea
              value={form.bio}
              rows={3}
              onChange={(e) => updateField('bio', e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-foreground">Episode Title</span>
            <input
              type="text"
              value={form.episodeTitle}
              onChange={(e) => updateField('episodeTitle', e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
            />
          </label>
          <div className="flex gap-2">
            <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" className="btn-ghost" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {guests.length === 0 && (
          <p className="text-sm text-muted-foreground">No guests yet.</p>
        )}
        {guests.map((guest) => (
          <div key={guest.id} className="card flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/15 text-lg font-semibold text-primary">
              {guest.initials}
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-base font-semibold text-foreground">{guest.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{guest.bio}</p>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium uppercase tracking-wide">Episode:</span>{' '}
                {guest.episodeTitle}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" className="btn-secondary" onClick={() => handleEdit(guest)}>
                Edit
              </button>
              <button type="button" className="btn-ghost text-red-500 hover:text-red-400" onClick={() => handleDelete(guest.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
