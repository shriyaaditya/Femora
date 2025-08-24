import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface AnimatedGridOverlayProps {
  isActive?: boolean;
}

const AnimatedGridOverlay: React.FC<AnimatedGridOverlayProps> = ({ isActive = true }) => {
  const gridRefs = useRef<Animated.Value[]>([]);
  const masterAnimation = useRef<Animated.CompositeAnimation | null>(null);

  // Initialize grid refs for 6x6 grid (36 total cells)
  useEffect(() => {
    gridRefs.current = Array(36).fill(null).map(() => new Animated.Value(0));
  }, []);

  // Start animations when component mounts or isActive changes
  useEffect(() => {
    if (!isActive) {
      // Stop master animation
      if (masterAnimation.current) {
        masterAnimation.current.stop();
        masterAnimation.current = null;
      }
      return;
    }

    // Create random animations for better visual effect
    const animations = gridRefs.current.map((animValue, index) => {
      const randomDelay = Math.random() * 2000; // Random delay up to 2 seconds
      const randomDuration = 800 + Math.random() * 800; // Random duration 800-1600ms
      
      return Animated.sequence([
        Animated.delay(randomDelay),
        Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1,
              duration: randomDuration,
              useNativeDriver: false,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: randomDuration,
              useNativeDriver: false,
            }),
          ])
        )
      ]);
    });

    // Run all animations in parallel
    masterAnimation.current = Animated.parallel(animations);
    masterAnimation.current.start();

    // Cleanup function
    return () => {
      if (masterAnimation.current) {
        masterAnimation.current.stop();
        masterAnimation.current = null;
      }
    };
  }, [isActive]);

  // Generate truly random colors for each cell
  const getGridColor = (index: number, animatedValue: Animated.Value) => {
    const colorPalette = [
      '#FF69B4', // Hot pink
      '#FFB6C1', // Light pink
      '#FFC0CB', // Pink
      '#FF1493', // Deep pink
      '#DDA0DD', // Plum
      '#D8BFD8', // Thistle
      '#9370DB', // Medium purple
      '#8A2BE2', // Blue violet
      '#9932CC', // Dark orchid
      '#BA55D3', // Medium orchid
      '#DA70D6', // Orchid
      '#EE82EE', // Violet
      '#FF00FF', // Magenta
      '#C71585', // Medium violet red
      '#DB7093', // Pale violet red
    ];

    // Use multiple factors to create more randomness
    const randomFactor1 = (index * 17 + 23) % colorPalette.length;
    const randomFactor2 = (index * 31 + 47) % colorPalette.length;
    
    const startColor = colorPalette[randomFactor1];
    const endColor = colorPalette[randomFactor2];
    
    return animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [startColor, endColor],
    });
  };

  const gridSize = Math.min(screenWidth, screenHeight) / 6;

  return (
    <View 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      <View style={{ 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        width: screenWidth, 
        height: screenHeight 
      }}>
        {gridRefs.current.map((animatedValue, index) => {
          const row = Math.floor(index / 6);
          const col = index % 6;
          
          return (
            <Animated.View
              key={index}
              style={{
                width: gridSize,
                height: gridSize,
                backgroundColor: getGridColor(index, animatedValue),
                borderWidth: 0.3,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                opacity: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.2, 0.6],
                }),
              }}
            />
          );
        })}
      </View>
    </View>
  );
};

export default AnimatedGridOverlay;
