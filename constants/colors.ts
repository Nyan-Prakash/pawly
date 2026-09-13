/**
 * Pawly colour tokens. See DESIGN.md.
 *
 * Six roles: background system, text system, one hairline border, one accent
 * (+ its soft tint), and two statuses. Every text/background pair below is
 * computed to pass WCAG AA (>= 4.5:1) in both schemes.
 *
 * No screen file may contain a hex literal. Add a role here or use an
 * existing one.
 */

export type AppColorScheme = 'light' | 'dark';

/** The mascot's own colours, taken from the app icon. Not for UI. */
const mascot = {
  cream: '#F5E2B3',
  brown: '#4A2C18',
  patch: '#6B4527',
  eye: '#2B1A0E',
  nose: '#3B2314',
  blush: '#F2B8A2',
  tongue: '#F26D6D',
  highlight: '#FFFFFF',
  sky: '#4F6BE0',
} as const;

export const lightColors = {
  accent: '#3F5BD1',
  accentSoft: '#E3E8FB',
  /** Darker accent for the pressed-edge of primary buttons. */
  accentEdge: '#2F46B0',
  bg: {
    app: '#F7F2EC',
    surface: '#FFFDF9',
    fill: '#EFE8DE',
  },
  text: {
    primary: '#1C1917',
    secondary: '#5C5650',
    onAccent: '#FFFFFF',
    onDanger: '#FFFFFF',
  },
  border: {
    hairline: '#E6DED3',
  },
  status: {
    danger: '#B42318',
    dangerSoft: '#FCE8E6',
    warning: '#8A5A00',
    warningSoft: '#FBEBC9',
  },
  scrim: 'rgba(28, 25, 23, 0.45)',
  mascot,
} as const;

export const darkColors = {
  accent: '#9AAEF7',
  accentSoft: '#1F2A55',
  accentEdge: '#6F86E0',
  bg: {
    app: '#151412',
    surface: '#201E1B',
    fill: '#2A2724',
  },
  text: {
    primary: '#F3EFE9',
    secondary: '#ABA39A',
    onAccent: '#0F1735',
    onDanger: '#1C1917',
  },
  border: {
    hairline: '#35312C',
  },
  status: {
    danger: '#F08A80',
    dangerSoft: '#3A1B18',
    warning: '#F2C069',
    warningSoft: '#3A2C12',
  },
  scrim: 'rgba(0, 0, 0, 0.6)',
  mascot,
} as const;

type DeepNormalize<T> = T extends string
  ? string
  : { [K in keyof T]: DeepNormalize<T[K]> };

export type AppColors = DeepNormalize<typeof lightColors>;

const palettes: Record<AppColorScheme, AppColors> = {
  light: lightColors,
  dark: darkColors,
};

let currentScheme: AppColorScheme = 'light';

export function setColorScheme(scheme: AppColorScheme) {
  currentScheme = scheme;
}

export function getColorScheme(): AppColorScheme {
  return currentScheme;
}

export function getThemeColors(scheme: AppColorScheme = currentScheme): AppColors {
  return palettes[scheme];
}

function createColorProxy(path: string[] = []): unknown {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        if (typeof prop !== 'string') return undefined;
        const value = [...path, prop].reduce<unknown>(
          (acc, key) => (acc as Record<string, unknown> | undefined)?.[key],
          getThemeColors(),
        );
        if (value && typeof value === 'object') {
          return createColorProxy([...path, prop]);
        }
        return value;
      },
    },
  );
}

/**
 * Theme-aware colour accessor. Values resolve at read time against the
 * current scheme, so `colors.accent` is always correct without prop drilling.
 */
export const colors = createColorProxy() as AppColors;
