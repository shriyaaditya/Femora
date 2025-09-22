import { useMemo, useCallback } from 'react';
import { Dimensions, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Device size constants
export const DEVICE_SIZES = {
  isSmallDevice: screenWidth < 375,
  isMediumDevice: screenWidth >= 375 && screenWidth < 414,
  isLargeDevice: screenWidth >= 414,
  screenWidth,
  screenHeight,
} as const;

// Platform-specific constants
export const PLATFORM = {
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  statusBarHeight: Platform.OS === 'ios' ? 44 : 24,
  bottomSafeArea: Platform.OS === 'ios' ? 34 : 0,
} as const;

// Common shadow styles
export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

// Common border radius values
export const BORDER_RADIUS = {
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
  round: 50,
} as const;

// Common spacing values
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Responsive sizing helper
export const useResponsiveSize = (small: number, medium: number, large: number) => {
  return useMemo(() => {
    if (DEVICE_SIZES.isSmallDevice) return small;
    if (DEVICE_SIZES.isMediumDevice) return medium;
    return large;
  }, [small, medium, large]);
};

// Responsive padding helper
export const useResponsivePadding = (small: number, medium: number, large: number) => {
  return useMemo(() => {
    const size = DEVICE_SIZES.isSmallDevice ? small : DEVICE_SIZES.isMediumDevice ? medium : large;
    return {
      paddingHorizontal: size,
      paddingVertical: size * 0.75,
    };
  }, [small, medium, large]);
};

// Responsive margin helper
export const useResponsiveMargin = (small: number, medium: number, large: number) => {
  return useMemo(() => {
    const size = DEVICE_SIZES.isSmallDevice ? small : DEVICE_SIZES.isMediumDevice ? medium : large;
    return {
      marginHorizontal: size,
      marginVertical: size * 0.75,
    };
  }, [small, medium, large]);
};

// Font size helper
export const useResponsiveFontSize = (small: number, medium: number, large: number) => {
  return useMemo(() => {
    if (DEVICE_SIZES.isSmallDevice) return small;
    if (DEVICE_SIZES.isMediumDevice) return medium;
    return large;
  }, [small, medium, large]);
};

// Button size helper
export const useButtonSize = () => {
  return useMemo(() => ({
    height: DEVICE_SIZES.isSmallDevice ? 44 : 48,
    paddingHorizontal: DEVICE_SIZES.isSmallDevice ? 16 : 20,
    borderRadius: DEVICE_SIZES.isSmallDevice ? 22 : 24,
  }), []);
};

// Icon size helper
export const useIconSize = () => {
  return useMemo(() => ({
    small: DEVICE_SIZES.isSmallDevice ? 16 : 18,
    medium: DEVICE_SIZES.isSmallDevice ? 20 : 22,
    large: DEVICE_SIZES.isSmallDevice ? 24 : 26,
    xlarge: DEVICE_SIZES.isSmallDevice ? 28 : 32,
  }), []);
};

// Safe area helper
export const useSafeArea = () => {
  return useMemo(() => ({
    paddingTop: PLATFORM.statusBarHeight + SPACING.md,
    paddingBottom: PLATFORM.bottomSafeArea + SPACING.md,
  }), []);
};

// Layout hook for consistent component sizing
export const useLayout = () => {
  const buttonSize = useButtonSize();
  const iconSize = useIconSize();
  const safeArea = useSafeArea();

  return useMemo(() => ({
    buttonSize,
    iconSize,
    safeArea,
    deviceSizes: DEVICE_SIZES,
    platform: PLATFORM,
    shadows: SHADOWS,
    borderRadius: BORDER_RADIUS,
    spacing: SPACING,
  }), [buttonSize, iconSize, safeArea]);
};

// Memoized style creator
export const createMemoizedStyle = <T extends Record<string, any>>(
  styleCreator: () => T,
  dependencies: any[] = []
) => {
  return useMemo(styleCreator, dependencies);
};

// Memoized callback creator
export const createMemoizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  dependencies: any[] = []
) => {
  return useCallback(callback, dependencies);
};

// Prevent layout shift during re-renders
export const useStableLayout = (layoutConfig: {
  width?: number;
  height?: number;
  position?: 'absolute' | 'relative';
  zIndex?: number;
}) => {
  return useMemo(() => ({
    ...layoutConfig,
    // Ensure consistent positioning
    position: layoutConfig.position || 'relative',
    zIndex: layoutConfig.zIndex || 1,
    // Prevent layout shifts
    minWidth: layoutConfig.width,
    minHeight: layoutConfig.height,
  }), [layoutConfig]);
};

// Export constants for direct use
export { screenWidth, screenHeight };

