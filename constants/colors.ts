export type AppColorScheme = 'light' | 'dark';

export const lightColors = {
  brand: {
    primary: '#22C55E',
    secondary: '#F59E0B',
    coach: '#3B82F6',
  },
  bg: {
    app: '#F7F2EC',
    surface: '#FFFDF9',
    surfaceAlt: '#F5F7F9',
    elevated: 'rgba(255,255,255,0.88)',
    elevatedMuted: 'rgba(255,255,255,0.72)',
    glass: 'rgba(255,255,255,0.66)',
  },
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    inverse: '#FFFFFF',
  },
  border: {
    default: '#E5E7EB',
    soft: '#EEF2F7',
    strong: '#D1D5DB',
  },
  status: {
    infoBg: '#E0F2FE',
    infoBorder: '#BAE6FD',
    successBg: '#DCFCE7',
    successBorder: '#BBF7D0',
    warningBg: '#FEF3C7',
    warningBorder: '#FDE68A',
    dangerBg: '#FEF2F2',
    dangerBorder: '#FECACA',
  },
  gradient: {
    app: ['#F7F2EC', '#F2EDE6', '#EEF6F1'] as const,
  },
  mascot: {
    fur: '#F6B66E',
    furDark: '#E19A53',
    earInner: '#FFD9B3',
    nose: '#3A3A3A',
    collar: '#22C55E',
  },
  shadow: {
    soft: '#94A3B8',
    strong: '#0F172A',
    success: '#15803D',
  },
  success: '#22C55E',
  warning: '#FBBF24',
  error: '#EF4444',
  primary: '#22C55E',
  secondary: '#F5F7F9',
  accent: '#F59E0B',
  success_old: '#22C55E',
  warning_old: '#FBBF24',
  error_old: '#EF4444',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  background: '#F7F2EC',
  surface: '#FFFFFF',
  borderColor: '#E5E7EB',
  borderLegacy: '#E5E7EB',
} as const;

export const darkColors = {
  brand: {
    primary: '#4ADE80',
    secondary: '#FBBF24',
    coach: '#60A5FA',
  },
  bg: {
    app: '#0B1220',
    surface: '#121A29',
    surfaceAlt: '#1A2436',
    elevated: 'rgba(18,26,41,0.94)',
    elevatedMuted: 'rgba(26,36,54,0.92)',
    glass: 'rgba(18,26,41,0.84)',
  },
  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    inverse: '#08111D',
  },
  border: {
    default: '#243042',
    soft: '#1E293B',
    strong: '#334155',
  },
  status: {
    infoBg: '#082F49',
    infoBorder: '#0C4A6E',
    successBg: '#052E1A',
    successBorder: '#166534',
    warningBg: '#451A03',
    warningBorder: '#92400E',
    dangerBg: '#450A0A',
    dangerBorder: '#991B1B',
  },
  gradient: {
    app: ['#08111D', '#0B1220', '#122032'] as const,
  },
  mascot: {
    fur: '#F6B66E',
    furDark: '#E19A53',
    earInner: '#FFD9B3',
    nose: '#3A3A3A',
    collar: '#4ADE80',
  },
  shadow: {
    soft: '#020617',
    strong: '#020617',
    success: '#14532D',
  },
  success: '#4ADE80',
  warning: '#FBBF24',
  error: '#F87171',
  primary: '#4ADE80',
  secondary: '#1A2436',
  accent: '#FBBF24',
  success_old: '#4ADE80',
  warning_old: '#FBBF24',
  error_old: '#F87171',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  background: '#0B1220',
  surface: '#121A29',
  borderColor: '#243042',
  borderLegacy: '#243042',
} as const;

type DeepNormalize<T> = T extends string
  ? string
  : T extends readonly string[]
  ? readonly string[]
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

export function getThemeColors(scheme: AppColorScheme = currentScheme) {
  return palettes[scheme];
}

function createColorProxy(path: string[] = []): unknown {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        if (typeof prop !== 'string') {
          return undefined;
        }

        const value = [...path, prop].reduce<unknown>(
          (acc, key) => (acc as Record<string, unknown>)[key],
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

export const colors = new Proxy(createColorProxy() as AppColors, {
  get(target, prop, receiver) {
    if (prop === 'borderColor') {
      return getThemeColors().border.default;
    }

    return Reflect.get(target, prop, receiver);
  },
}) as AppColors & {
  borderColor: string;
};
