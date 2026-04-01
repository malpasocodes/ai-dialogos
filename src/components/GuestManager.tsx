import { useState, useEffect, useRef } from 'react';

interface Guest {
  id: string;
  name: string;
  initials: string;
  bio: string;
  episodeTitle: string;
  headshot: string | null;
  position: number;
}

interface GuestForm {
  name: string;
  initials: string;
  bio: string;
  episodeTitle: string;
  position: string;
}

const emptyForm: GuestForm = { name: '', initials: '', bio: '', episodeTitle: '', position: '0' };

export function GuestManager() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<GuestForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeHeadshot, setRemoveHeadshot] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchGuests = async () => {
    const res = await fetch('/api/guests');
    if (res.ok) {
      setGuests(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => { fetchGuests(); }, []);

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setRemoveHeadshot(false);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEdit = (guest: Guest) => {
    setEditing(guest.id);
    setForm({
      name: guest.name,
      initials: guest.initials,
      bio: guest.bio,
      episodeTitle: guest.episodeTitle,
      position: String(guest.position),
    });
    setImagePreview(guest.headshot);
    setImageFile(null);
    setRemoveHeadshot(false);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleNew = () => {
    resetForm();
    setEditing('new');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setRemoveHeadshot(false);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(editing !== 'new' ? guests.find((g) => g.id === editing)?.headshot ?? null : null);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveHeadshot(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!form.name || !form.bio || !form.episodeTitle) {
      setError('Name, bio, and episode title are required.');
      return;
    }

    setSaving(true);
    setError(null);

    const isNew = editing === 'new';
    const url = isNew ? '/api/guests' : `/api/guests/${editing}`;
    const method = isNew ? 'POST' : 'PUT';

    const body = new FormData();
    body.append('name', form.name);
    body.append('bio', form.bio);
    body.append('episodeTitle', form.episodeTitle);
    if (form.initials) body.append('initials', form.initials);
    body.append('position', form.position);
    if (imageFile) body.append('headshot', imageFile);
    if (removeHeadshot) body.append('removeHeadshot', 'true');

    const res = await fetch(url, { method, body });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const detail = data.debug ? ` (${JSON.stringify(data.debug)})` : '';
      setError((data.error || `Failed to save (HTTP ${res.status})`) + detail);
      setSaving(false);
      return;
    }

    setSaving(false);
    resetForm();
    await fetchGuests();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this guest?')) return;
    const res = await fetch(`/api/guests/${id}`, { method: 'DELETE' });
    if (res.ok) await fetchGuests();
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
          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Headshot upload */}
          <div className="flex items-center gap-4">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="h-20 w-20 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-xl font-semibold text-primary">
                {form.initials || form.name.split(/\s+/).map((w) => w[0]?.toUpperCase()).slice(0, 2).join('') || '?'}
              </div>
            )}
            <div className="space-y-2">
              <label className="block">
                <span className="text-sm font-medium text-foreground">Headshot</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-1 block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground hover:file:bg-secondary/80"
                />
              </label>
              {imagePreview && (
                <button type="button" className="text-xs text-red-500 hover:text-red-400" onClick={handleRemoveImage}>
                  Remove image
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-1">
              <span className="text-sm font-medium text-foreground">Name <span className="text-red-500">*</span></span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-foreground">Initials <span className="text-xs text-muted-foreground">(auto if blank)</span></span>
              <input
                type="text"
                value={form.initials}
                maxLength={3}
                placeholder="e.g. AO"
                onChange={(e) => updateField('initials', e.target.value.toUpperCase())}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-foreground">Position</span>
              <input
                type="number"
                value={form.position}
                min={0}
                placeholder="0"
                onChange={(e) => updateField('position', e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
              />
            </label>
          </div>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-foreground">Bio <span className="text-red-500">*</span></span>
            <textarea
              value={form.bio}
              rows={3}
              onChange={(e) => updateField('bio', e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-foreground">Episode Title <span className="text-red-500">*</span></span>
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
            <button type="button" className="btn-ghost" onClick={resetForm}>
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
            {guest.headshot ? (
              <img
                src={guest.headshot}
                alt={guest.name}
                className="h-14 w-14 shrink-0 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/15 text-lg font-semibold text-primary">
                {guest.initials}
              </div>
            )}
            <div className="flex-1 space-y-1">
              <h3 className="text-base font-semibold text-foreground">
                <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded bg-primary/15 text-xs font-medium text-primary">{guest.position}</span>
                {guest.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 whitespace-pre-line">{guest.bio}</p>
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
