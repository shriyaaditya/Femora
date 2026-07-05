import * as Font from 'expo-font';

export const loadFonts = async () => {
  await Font.loadAsync({
    DenisMacharov: require('../assets/fonts/DenisMacharov-Regular.ttf'),
  });
};

export const fonts = {
  denis: 'DenisMacharov',
};

// Font usage examples:
// className="font-denis" - Applies Denis Macharov font
// className="font-denis text-lg font-bold" - Denis Macharov with size and weight
// className="font-denis text-center text-white" - Denis Macharov with alignment and color

// Available Tailwind classes for Denis Macharov:
// font-denis - Base font family
// font-denis text-sm - Small text
// font-denis text-base - Base text size

// font-denis text-lg - Large text
// font-denis text-xl - Extra large text
// font-denis text-2xl - 2X large text
// font-denis text-3xl - 3X large text
// font-denis font-normal - Normal weight
// font-denis font-medium - Medium weight
// font-denis font-semibold - Semi-bold weight
// font-denis font-bold - Bold weight
