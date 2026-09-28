import { useEffect, useState } from 'react';
import { ColorSchemeName } from 'react-native';

export function useColorScheme(): ColorSchemeName {
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>('light');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setColorScheme(isDark ? 'dark' : 'light');
    }
  }, []);

  return colorScheme;
}
