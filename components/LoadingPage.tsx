import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  Image,
  Animated,
} from 'react-native';

interface LoadingPageProps {
  message?: string;
}

const LoadingPage: React.FC<LoadingPageProps> = ({ message = 'Where Privacy meets Preventon' }) => {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const dotAnimations = useRef<Animated.Value[]>([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    // Logo entrance animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // Text entrance animation (both "Femora" and loading message)
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Bouncing dots animation
    const createDotAnimation = (index: number) => {
      const dotAnimation = dotAnimations[index];
      if (!dotAnimation) return null;
      
      return Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnimation, {
            toValue: 1,
            duration: 600,
            delay: index * 200,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnimation, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
    };

    dotAnimations.forEach((dotAnimation, index) => {
      if (dotAnimation) {
        const animation = createDotAnimation(index);
        if (animation) {
          animation.start();
        }
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#e2caf9" />

      <View style={styles.content}>
        {/* Logo with entrance animation */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}>
          <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        </Animated.View>

        {/* Brand name with same animation as loading text */}
        <Animated.View
          style={[
            styles.brandContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}>
          <Text style={styles.brandText}>Femora</Text>
        </Animated.View>

        {/* Bouncing dots */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((index) => {
            const dotAnimation = dotAnimations[index];
            if (!dotAnimation) return null;
            
            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    transform: [
                      {
                        translateY: dotAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -15],
                        }),
                      },
                    ],
                    opacity: dotAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1],
                    }),
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Loading message with same animation as brand name */}
        <Animated.Text
          style={[
            styles.loadingMessage,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}>
          {message}
        </Animated.Text>
      </View>
    </View>
  );
};

export default LoadingPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e2caf9',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  brandContainer: {
    marginBottom: 40,
  },
  brandText: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
    textShadowColor: 'rgba(255, 157, 241, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    fontFamily: 'DenisMacharov',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 30,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    elevation: 4,
  },
  loadingMessage: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    opacity: 0.8,
  },
});
