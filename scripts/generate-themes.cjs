/* AUTO-GENERATED THEMING — do not edit by hand.
 *
 * Precompute counterpart of the former `tailwind/plugins/theming.js` runtime plugin.
 * It runs OUTSIDE of the Tailwind build (npm run theme:build / prebuild) and emits
 * static artifacts consumed by `src/styles/tailwind.css` and `src/styles/fuse/themes.scss`.
 *
 * Outputs:
 *   - src/styles/fuse/generated/theme-vars.css   (--fuse-* custom properties per theme + scheme)
 *   - src/styles/fuse/generated/theme-colors.css (@theme inline color registrations)
 *   - src/styles/fuse/user-themes.scss           (SCSS map for the Angular Material pipeline)
 */

const fs = require('fs');
const path = require('path');
const chroma = require('chroma-js');
const _ = require('lodash');
const generatePalette = require(path.resolve(__dirname, '../tailwind/utils/generate-palette'));

// Tailwind CSS v3 palette values (hex). Tailwind v4 ships these palettes as `oklch()`,
// which chroma-js cannot parse — and switching would subtly shift every theme color.
// These hex values match the previously generated `user-themes.scss` exactly.
const colors = {
    slate : { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617' },
    indigo: { 50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81', 950: '#1e1b4b' },
    red   : { 50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d', 950: '#450a0a' },
    teal  : { 50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4', 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a', 950: '#042f2e' },
    rose  : { 50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337', 950: '#4c0519' },
    purple: { 50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe', 400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce', 800: '#6b21a8', 900: '#581c87', 950: '#3b0764' },
    amber : { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f', 950: '#451a03' },
};
const generateContrasts = require(path.resolve(__dirname, '../tailwind/utils/generate-contrasts'));
const jsonToSassMap = require(path.resolve(__dirname, '../tailwind/utils/json-to-sass-map'));

// -----------------------------------------------------------------------------------------------------
// @ Theme source data (former tailwind.config.js)
// -----------------------------------------------------------------------------------------------------

const customPalettes = {
    brand: generatePalette('#2196F3'),
};

const themes = {
    'default': {
        primary: { ...colors.indigo, DEFAULT: colors.indigo[600] },
        accent : { ...colors.slate, DEFAULT: colors.slate[800] },
        warn   : { ...colors.red, DEFAULT: colors.red[600] },
        'on-warn': { 500: colors.red['50'] },
    },
    'brand' : { primary: customPalettes.brand },
    'teal'  : { primary: { ...colors.teal, DEFAULT: colors.teal[600] } },
    'rose'  : { primary: colors.rose },
    'purple': { primary: { ...colors.purple, DEFAULT: colors.purple[600] } },
    'amber' : { primary: colors.amber },
};

const customProps = {
    background: {
        light: {
            'bg-app-bar'   : '#FFFFFF',
            'bg-card'      : '#FFFFFF',
            'bg-default'   : colors.slate[100],
            'bg-dialog'    : '#FFFFFF',
            'bg-hover'     : chroma(colors.slate[400]).alpha(0.12).css(),
            'bg-status-bar': colors.slate[300],
        },
        dark : {
            'bg-app-bar'   : colors.slate[900],
            'bg-card'      : colors.slate[800],
            'bg-default'   : colors.slate[900],
            'bg-dialog'    : colors.slate[800],
            'bg-hover'     : 'rgba(255, 255, 255, 0.05)',
            'bg-status-bar': colors.slate[900],
        },
    },
    foreground: {
        light: {
            'text-default'  : colors.slate[800],
            'text-secondary': colors.slate[500],
            'text-hint'     : colors.slate[400],
            'text-disabled' : colors.slate[400],
            'border'        : colors.slate[200],
            'divider'       : colors.slate[200],
            'icon'          : colors.slate[500],
            'mat-icon'      : colors.slate[500],
        },
        dark : {
            'text-default'  : '#FFFFFF',
            'text-secondary': colors.slate[400],
            'text-hint'     : colors.slate[500],
            'text-disabled' : colors.slate[600],
            'border'        : chroma(colors.slate[100]).alpha(0.12).css(),
            'divider'       : chroma(colors.slate[100]).alpha(0.12).css(),
            'icon'          : colors.slate[400],
            'mat-icon'      : colors.slate[400],
        },
    },
};

// -----------------------------------------------------------------------------------------------------
// @ Helpers (ported from theming.js)
// -----------------------------------------------------------------------------------------------------

const e = (name) => name;

const normalizeTheme = (theme) =>
    _.fromPairs(_.map(
        _.omitBy(theme, (palette, paletteName) => paletteName.startsWith('on') || _.isEmpty(palette)),
        (palette, paletteName) => [paletteName, { ...palette, DEFAULT: palette['DEFAULT'] || palette[500] }]
    ));

const flattenColorPalette = (palette) =>
    Object.assign({}, ...Object.entries(palette ?? {}).flatMap(([color, values]) =>
        typeof values === 'object'
            ? Object.entries(flattenColorPalette(values)).map(([number, hex]) => ({
                [color + (number === 'DEFAULT' ? '' : `-${number}`)]: hex,
            }))
            : [{ [`${color}`]: values }]
    ));

const rgb = (value) => chroma(value).rgb().join(',');

// -----------------------------------------------------------------------------------------------------
// @ Compute themes (same algorithm as theming.js)
// -----------------------------------------------------------------------------------------------------

const userThemes = _.fromPairs(_.map(themes, (theme, themeName) => [
    themeName,
    _.defaults({}, theme, themes['default']),
]));

let resolvedThemes = _.fromPairs(_.map(userThemes, (theme, themeName) => [
    themeName,
    normalizeTheme(theme),
]));

resolvedThemes = _.fromPairs(_.map(resolvedThemes, (theme, themeName) => [
    themeName,
    _.pick(
        _.fromPairs(_.map(theme, (palette, paletteName) => [
            paletteName,
            {
                ...palette,
                contrast: _.fromPairs(_.map(generateContrasts(palette), (color, hue) => [
                    hue,
                    _.get(userThemes[themeName], [`on-${paletteName}`, hue]) || color,
                ])),
            },
        ])),
        ['primary', 'accent', 'warn']
    ),
]));

resolvedThemes = _.fromPairs(_.map(resolvedThemes, (theme, themeName) => [
    themeName,
    { selector: `".theme-${themeName}"`, ...theme },
]));

// -----------------------------------------------------------------------------------------------------
// @ Emit theme-vars.css
// -----------------------------------------------------------------------------------------------------

const themeVarBlocks = _.map(themes, (theme, themeName) => {
    const selector = themeName === 'default' ? 'body, .theme-default' : `.theme-${e(themeName)}`;

    const pairs = _.flatten(_.map(normalizeTheme(theme), (palette, paletteName) => [
        ..._.map(palette, (value, hue) => ({
            prop: `--fuse-${e(paletteName)}${hue === 'DEFAULT' ? '' : '-' + hue}`,
            value,
        })),
        ..._.map(generateContrasts(palette), (color, hue) => ({
            prop: `--fuse-on-${e(paletteName)}${hue === 'DEFAULT' ? '' : '-' + hue}`,
            value: _.get(theme, [`on-${paletteName}`, hue]) || color,
        })),
    ]));

    const lines = _.flatten(_.map(pairs, ({ prop, value }) => [
        `  ${prop}: ${value};`,
        `  ${prop}-rgb: ${rgb(value)};`,
    ]));

    return `${selector} {\n${lines.join('\n')}\n}`;
});

const schemeSelectors = {
    light: 'body.light, .light, .dark .light',
    dark : 'body.dark, .dark, .light .dark',
};

const schemeBlocks = _.map(['light', 'dark'], (colorScheme) => {
    const isDark = colorScheme === 'dark';
    const background = customProps.background[colorScheme];
    const foreground = customProps.foreground[colorScheme];

    const props = [
        ...(!isDark ? ['  --is-dark: false;'] : []),
        ..._.flatten(_.map({ ...background, ...foreground }, (value, key) => [
            `  --fuse-${e(key)}: ${value};`,
            `  --fuse-${e(key)}-rgb: ${rgb(value)};`,
        ])),
    ];

    return `${schemeSelectors[colorScheme]} {\n${props.join('\n')}\n}`;
});

const themeVarsCss = `/* AUTO-GENERATED by scripts/generate-themes.cjs — do not edit */\n\n`
    + themeVarBlocks.join('\n\n')
    + '\n\n'
    + schemeBlocks.join('\n\n')
    + '\n';

// -----------------------------------------------------------------------------------------------------
// @ Emit theme-colors.css (@theme inline)
// -----------------------------------------------------------------------------------------------------

const colorNames = _.keys(flattenColorPalette(normalizeTheme(themes.default)));

const colorLines = _.flatten(_.map(colorNames, (name) => [
    `  --color-${e(name)}: var(--fuse-${e(name)});`,
    `  --color-on-${e(name)}: var(--fuse-on-${e(name)});`,
]));

const themeColorsCss = `/* AUTO-GENERATED by scripts/generate-themes.cjs — do not edit */\n`
    + `@theme inline {\n${colorLines.join('\n')}\n}\n`;

// -----------------------------------------------------------------------------------------------------
// @ Emit user-themes.scss (Angular Material pipeline)
// -----------------------------------------------------------------------------------------------------

const sassMap = jsonToSassMap(JSON.stringify({ 'user-themes': resolvedThemes }));

// -----------------------------------------------------------------------------------------------------
// @ Write files (only when changed)
// -----------------------------------------------------------------------------------------------------

const outputs = {
    'src/styles/fuse/generated/theme-vars.css'  : themeVarsCss,
    'src/styles/fuse/generated/theme-colors.css': themeColorsCss,
    'src/styles/fuse/user-themes.scss'          : sassMap,
};

let changed = 0;
for (const [rel, contents] of Object.entries(outputs)) {
    const file = path.resolve(__dirname, '..', rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });

    let current;
    try { current = fs.readFileSync(file, 'utf8'); } catch { current = undefined; }

    if (current !== contents) {
        fs.writeFileSync(file, contents, { encoding: 'utf8' });
        console.log(`  updated  ${rel}`);
        changed++;
    } else {
        console.log(`  unchanged ${rel}`);
    }
}

console.log(changed ? `themes generated (${changed} file(s) written)` : 'themes up to date');
