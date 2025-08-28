import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, Text } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface AnimatedGridOverlayProps {
  isActive?: boolean;
}

const AnimatedGridOverlay: React.FC<AnimatedGridOverlayProps> = ({ isActive = true }) => {
  const gridRefs = useRef<Animated.Value[]>([]);
  const masterAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  // Initialize grid refs for 9x9 grid (81 total cells)
  useEffect(() => {
    gridRefs.current = Array(81)
      .fill(null)
      .map(() => new Animated.Value(0));
  }, []);

  // Start animations when component mounts or isActive changes
  useEffect(() => {
    console.log('AnimatedGridOverlay: isActive changed to', isActive);
    if (!isActive) {
      console.log('AnimatedGridOverlay: Stopping animations');
      // Stop master animation and fade out
      if (masterAnimation.current) {
        masterAnimation.current.stop();
        masterAnimation.current = null;
      }
      Animated.timing(fadeAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
      return;
    }

    // Fade in when becoming active
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 100,
      useNativeDriver: false,
    }).start();

          // Add a small delay before starting animations for better visual effect
      const startDelay = setTimeout(() => {
        // Create random animations for better visual effect
        const animations = gridRefs.current.map((animValue, index) => {
          const randomDelay = Math.random() * 1000; // Random delay up to 1 second
          const randomDuration = 400 + Math.random() * 600; // Random duration 400-1000ms

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
            ),
          ]);
        });

        // Run all animations in parallel
        masterAnimation.current = Animated.parallel(animations);
        console.log('AnimatedGridOverlay: Starting animations');
        masterAnimation.current.start();
      }, 100); // 100ms delay before starting animations

    // Cleanup function
    return () => {
      clearTimeout(startDelay);
      if (masterAnimation.current) {
        masterAnimation.current.stop();
        masterAnimation.current = null;
      }
    };
  }, [isActive]);

  // Generate truly random colors for each cell
  const getGridColor = (index: number, animatedValue: Animated.Value) => {
    const colorPalette = [
      '#FFFFFF', // Pure white
      '#F8F9FA', // Light gray white
      '#E9ECEF', // Very light gray
      '#DEE2E6', // Light gray
      '#CED4DA', // Medium light gray
      '#ADB5BD', // Medium gray
      '#6C757D', // Dark gray
      '#495057', // Darker gray
      '#343A40', // Very dark gray
      '#212529', // Almost black
      '#F1F3F4', // Google gray
      '#E8EAED', // Light Google gray
      '#DADCE0', // Medium Google gray
      '#9AA0A6', // Dark Google gray
      '#5F6368', // Very dark Google gray
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

  // Calculate grid size based on available space - make cells larger for better visibility
  const gridSize = Math.min(360, 460) / 9; // 9x9 grid for 360x360 container

        return (
    <Animated.View
      style={{
        width: 400,
        height: 400,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        pointerEvents: 'none',
        opacity: fadeAnimation,
      }}>
      <View
        style={{
          width: 360,
          height: 360,
          backgroundColor: 'rgba(108, 117, 125, 0.02)', // Very subtle gray background
          borderWidth: 1,
          borderColor: 'rgba(108, 117, 125, 0.1)', // Subtle gray border
          borderRadius: 8,
          position: 'relative',
        }}>
        {gridRefs.current.map((animatedValue, index) => {
          const row = Math.floor(index / 9);
          const col = index % 9;

          return (
            <Animated.View
              key={index}
              style={{
                width: gridSize,
                height: gridSize,
                backgroundColor: getGridColor(index, animatedValue),
                borderWidth: 0.3,
                borderColor: 'rgba(108, 117, 125, 0.15)', // Subtle gray border
                opacity: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.9], // Higher contrast opacity for better visibility
                }),
                position: 'absolute',
                left: col * gridSize,
                top: row * gridSize,
              }}
            />
          );
        })}
      </View>
    </Animated.View>
  );
};

export default AnimatedGridOverlay;
