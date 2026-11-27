export type GCSComponentValue = '1' | '2' | '3' | '4' | '5' | '6' | 'NT';
export type GCSComponentKey = 'eye' | 'verbal' | 'motor';

export interface GCSInput {
  eye: string;
  verbal: string;
  motor: string;
}

export interface GCSComponentResult {
  key: GCSComponentKey;
  label: string;
  value: number | null;
  display: string;
  response: string;
}

export interface GCSResult {
  total: number | null;
  components: GCSComponentResult[];
  hasUntestableComponent: boolean;
  notation: string;
}

const componentDefinitions = {
  eye: {
    label: 'Открывание глаз (E)',
    min: 1,
    max: 4,
    responses: {
      '4': 'Спонтанно',
      '3': 'На звук',
      '2': 'На давление',
      '1': 'Отсутствует',
    },
  },
  verbal: {
    label: 'Речевая реакция (V)',
    min: 1,
    max: 5,
    responses: {
      '5': 'Ориентирован',
      '4': 'Спутанная речь',
      '3': 'Отдельные слова',
      '2': 'Звуки',
      '1': 'Отсутствует',
    },
  },
  motor: {
    label: 'Двигательная реакция (M)',
    min: 1,
    max: 6,
    responses: {
      '6': 'Выполняет команды',
      '5': 'Локализует давление',
      '4': 'Нормальное сгибание',
      '3': 'Патологическое сгибание',
      '2': 'Разгибание',
      '1': 'Отсутствует',
    },
  },
} as const;

function parseComponent(key: GCSComponentKey, raw: string): GCSComponentResult | null {
  const definition = componentDefinitions[key];
  if (raw === 'NT') {
    return { key, label: definition.label, value: null, display: 'NT', response: 'Не оценивается' };
  }
  const value = Number(raw);
  if (!Number.isInteger(value) || value < definition.min || value > definition.max) return null;
  const response = definition.responses[String(value) as keyof typeof definition.responses];
  if (!response) return null;
  return { key, label: definition.label, value, display: String(value), response };
}

export function calculateGCS(input: GCSInput): GCSResult | null {
  if ([input.eye, input.verbal, input.motor].some((value) => value === '')) return null;
  const components = [
    parseComponent('eye', input.eye),
    parseComponent('verbal', input.verbal),
    parseComponent('motor', input.motor),
  ];
  if (components.some((component) => component === null)) return null;
  const validComponents = components as GCSComponentResult[];
  const hasUntestableComponent = validComponents.some((component) => component.value === null);
  const total = hasUntestableComponent
    ? null
    : validComponents.reduce((sum, component) => sum + (component.value ?? 0), 0);
  return {
    total,
    components: validComponents,
    hasUntestableComponent,
    notation: validComponents.map((component) => `${component.key === 'eye' ? 'E' : component.key === 'verbal' ? 'V' : 'M'}${component.display}`).join(' '),
  };
}
