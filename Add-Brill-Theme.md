# Adding the “Brill” Theme Option to Codex

This guide explains how to add a **third color scheme option**—the “Brill” theme—to your site’s theme toggle (currently offering Indigo and Green). The Brill palette is based on De Gruyter Brill’s academic color scheme.

---

## 🎨 Color Palette (Brill Theme)

| Role | Color | Hex |
|------|--------|-----|
| Primary (nav/accents) | Deep Navy | `#0D2240` |
| Link / Action | Bright Blue | `#0066CC` |
| Secondary Accent | Sky Blue | `#4DA3FF` |
| Highlight / Accent | Gold | `#FFB500` |
| Background | Light Gray | `#F9F9F9` |
| Text | Charcoal | `#1A1A1A` |
| Muted Text | Medium Gray | `#555555` |
| Surface | White | `#FFFFFF` |
| Subtle Surface | Beige-Gray | `#F0EDE8` |
| Border | Light Gray | `#D6D6D6` |

---

## 🧩 Step 1 — Define CSS Variables

Add the following to your **global stylesheet** (keeping your existing indigo and green themes).

```css
/* Base (fallbacks) */
:root {
  --color-primary: #4f46e5;
  --color-primary-contrast: #ffffff;
  --color-link: #2563eb;
  --color-accent: #f59e0b;
  --color-bg: #ffffff;
  --color-surface: #ffffff;
  --color-surface-subtle: #f6f6f6;
  --color-text: #111111;
  --color-text-muted: #6b7280;
  --color-border: #e5e7eb;
}

/* Existing themes (examples) */
:root[data-theme="indigo"] { /* existing */ }
:root[data-theme="green"]  { /* existing */ }

/* NEW: Brill / De Gruyter–style */
:root[data-theme="brill"] {
  --color-primary: #0D2240;
  --color-primary-contrast: #ffffff;
  --color-link: #0066CC;
  --color-accent: #FFB500;
  --color-bg: #F9F9F9;
  --color-surface: #FFFFFF;
  --color-surface-subtle: #F0EDE8;
  --color-text: #1A1A1A;
  --color-text-muted: #555555;
  --color-border: #D6D6D6;
}

body { background: var(--color-bg); color: var(--color-text); }
a { color: var(--color-link); }
.btn-primary {
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  border: 1px solid var(--color-primary);
}
.card { background: var(--color-surface); border: 1px solid var(--color-border); }
.input { background: var(--color-surface-subtle); border: 1px solid var(--color-border); color: var(--color-text); }
.small, .muted { color: var(--color-text-muted); }
```

---

## 🧭 Step 2 — Update the Theme Toggle Menu

Add a “Brill” option in your theme toggle list.

```html
<div class="theme-toggle">
  <button id="themeButton" aria-haspopup="listbox" aria-expanded="false" aria-label="Color scheme">
    Theme
  </button>
  <ul id="themeMenu" role="listbox" tabindex="-1" hidden>
    <li role="option" data-theme-value="indigo">Indigo</li>
    <li role="option" data-theme-value="green">Green</li>
    <li role="option" data-theme-value="brill">Brill</li>
  </ul>
</div>
```

---

## ⚙️ Step 3 — JavaScript to Apply and Remember the Theme

```javascript
(function () {
  const STORAGE_KEY = 'color-scheme';
  const root = document.documentElement;
  const btn  = document.getElementById('themeButton');
  const menu = document.getElementById('themeMenu');

  const applyTheme = (name) => {
    root.setAttribute('data-theme', name);
    localStorage.setItem(STORAGE_KEY, name);
    menu.querySelectorAll('[role="option"]').forEach(li => {
      li.setAttribute('aria-selected', li.dataset.themeValue === name ? 'true' : 'false');
    });
  };

  applyTheme(localStorage.getItem(STORAGE_KEY) || root.getAttribute('data-theme') || 'indigo');

  btn.addEventListener('click', () => {
    const open = menu.hasAttribute('hidden');
    menu.toggleAttribute('hidden', !open);
    btn.setAttribute('aria-expanded', String(open));
    if (open) menu.focus();
  });

  menu.addEventListener('click', (e) => {
    const li = e.target.closest('[role="option"]');
    if (!li) return;
    applyTheme(li.dataset.themeValue);
    menu.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
  });

  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && e.target !== btn) {
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    }
  });
})();
```

---

## 🎨 (Optional) Tailwind Integration

If using Tailwind CSS with variable-based themes:

```css
:root {
  --twc-bg: var(--color-bg);
  --twc-text: var(--color-text);
  --twc-link: var(--color-link);
  --twc-primary: var(--color-primary);
  --twc-accent: var(--color-accent);
}

.bg-app { background-color: var(--twc-bg); }
.text-app { color: var(--twc-text); }
.text-link { color: var(--twc-link); }
.btn-primary { background-color: var(--twc-primary); color: #fff; }
```

---

## ✅ Accessibility Notes

- Contrast ratios for navy, link blue, and gold meet **WCAG AA** for normal text.
- Maintain visible focus rings (`outline: 2px solid var(--color-link)`).
- Test all UI states (hover, focus, active) across all three themes.

---

**Result:**  
Your theme toggle will now offer **Indigo / Green / Brill**, persisting user preference and matching the De Gruyter Brill academic aesthetic.
