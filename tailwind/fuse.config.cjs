/* Minimal Tailwind v4 JS config.
 *
 * Tailwind v4 removed the boolean `important` option from CSS-first configuration and
 * has no equivalent there. This project relies on the former `important: true` so its
 * utilities keep winning over Angular Material's unlayered styles (Material ships plain,
 * unlayered CSS, which otherwise outranks Tailwind's `@layer utilities`).
 *
 * Loaded from `src/styles/tailwind.css` via `@config`. Everything else (theme tokens,
 * custom utilities, dark variant) is CSS-first.
 */
module.exports = {
    important: true,
};
