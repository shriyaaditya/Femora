import React from 'react';
import { Text as RNText, TextProps } from 'react-native';

interface SmartTextProps extends TextProps {
  children: React.ReactNode;
  useCustomFont?: boolean;
}

const SmartText: React.FC<SmartTextProps> = ({
  style,
  children,
  useCustomFont = true,
  ...props
}) => {
  // Check if content contains only emojis or icons
  const hasOnlyEmojis = React.useMemo(() => {
    if (typeof children === 'string') {
      // Regex to match emojis and common icon characters
      const emojiRegex =
        /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}\u{238C}-\u{2454}\u{20D0}-\u{20FF}\u{FE0F}\u{1F3FB}-\u{1F3FF}\u{200D}\u{200B}\u{FE0E}\u{FE0F}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}\u{1F192}-\u{1F3FA}\u{1F193}-\u{1F3FA}\u{1F194}-\u{1F3FA}\u{1F195}-\u{1F3FA}\u{1F196}-\u{1F3FA}\u{1F197}-\u{1F3FA}\u{1F198}-\u{1F3FA}\u{1F199}-\u{1F3FA}\u{1F19A}-\u{1F3FA}\u{1F19B}-\u{1F3FA}\u{1F19C}-\u{1F3FA}\u{1F19D}-\u{1F3FA}\u{1F19E}-\u{1F3FA}\u{1F19F}-\u{1F3FA}\u{1F1A0}-\u{1F3FA}\u{1F1A1}-\u{1F3FA}\u{1F1A2}-\u{1F3FA}\u{1F1A3}-\u{1F3FA}\u{1F1A4}-\u{1F3FA}\u{1F1A5}-\u{1F3FA}\u{1F1A6}-\u{1F3FA}\u{1F1A7}-\u{1F3FA}\u{1F1A8}-\u{1F3FA}\u{1F1A9}-\u{1F3FA}\u{1F1AA}-\u{1F3FA}\u{1F1AB}-\u{1F3FA}\u{1F1AC}-\u{1F3FA}\u{1F1AD}-\u{1F3FA}\u{1F1AE}-\u{1F3FA}\u{1F1AF}-\u{1F3FA}\u{1F1B0}-\u{1F3FA}\u{1F1B1}-\u{1F3FA}\u{1F1B2}-\u{1F3FA}\u{1F1B3}-\u{1F3FA}\u{1F1B4}-\u{1F3FA}\u{1F1B5}-\u{1F3FA}\u{1F1B6}-\u{1F3FA}\u{1F1B7}-\u{1F3FA}\u{1F1B8}-\u{1F3FA}\u{1F1B9}-\u{1F3FA}\u{1F1BA}-\u{1F3FA}\u{1F1BB}-\u{1F3FA}\u{1F1BC}-\u{1F3FA}\u{1F1BD}-\u{1F3FA}\u{1F1BE}-\u{1F3FA}\u{1F1BF}-\u{1F3FA}\u{1F1C0}-\u{1F3FA}\u{1F1C1}-\u{1F3FA}\u{1F1C2}-\u{1F3FA}\u{1F1C3}-\u{1F3FA}\u{1F1C4}-\u{1F3FA}\u{1F1C5}-\u{1F3FA}\u{1F1C6}-\u{1F3FA}\u{1F1C7}-\u{1F3FA}\u{1F1C8}-\u{1F3FA}\u{1F1C9}-\u{1F3FA}\u{1F1CA}-\u{1F3FA}\u{1F1CB}-\u{1F3FA}\u{1F1CC}-\u{1F3FA}\u{1F1CD}-\u{1F3FA}\u{1F1CE}-\u{1F3FA}\u{1F1CF}-\u{1F3FA}\u{1F1D0}-\u{1F3FA}\u{1F1D1}-\u{1F3FA}\u{1F1D2}-\u{1F3FA}\u{1F1D3}-\u{1F3FA}\u{1F1D4}-\u{1F3FA}\u{1F1D5}-\u{1F3FA}\u{1F1D6}-\u{1F3FA}\u{1F1D7}-\u{1F3FA}\u{1F1D8}-\u{1F3FA}\u{1F1D9}-\u{1F3FA}\u{1F1DA}-\u{1F3FA}\u{1F1DB}-\u{1F3FA}\u{1F1DC}-\u{1F3FA}\u{1F1DD}-\u{1F3FA}\u{1F1DE}-\u{1F3FA}\u{1F1DF}-\u{1F3FA}\u{1F1E0}-\u{1F3FA}\u{1F1E1}-\u{1F3FA}\u{1F1E2}-\u{1F3FA}\u{1F1E3}-\u{1F3FA}\u{1F1E4}-\u{1F3FA}\u{1F1E5}-\u{1F3FA}\u{1F1E6}-\u{1F3FA}\u{1F1E7}-\u{1F3FA}\u{1F1E8}-\u{1F3FA}\u{1F1E9}-\u{1F3FA}\u{1F1EA}-\u{1F3FA}\u{1F1EB}-\u{1F3FA}\u{1F1EC}-\u{1F3FA}\u{1F1ED}-\u{1F3FA}\u{1F1EE}-\u{1F3FA}\u{1F1EF}-\u{1F3FA}\u{1F1F0}-\u{1F3FA}\u{1F1F1}-\u{1F3FA}\u{1F1F2}-\u{1F3FA}\u{1F1F3}-\u{1F3FA}\u{1F1F4}-\u{1F3FA}\u{1F1F5}-\u{1F3FA}\u{1F1F6}-\u{1F3FA}\u{1F1F7}-\u{1F3FA}\u{1F1F8}-\u{1F3FA}\u{1F1F9}-\u{1F3FA}\u{1F1FA}-\u{1F3FA}\u{1F1FB}-\u{1F3FA}\u{1F1FC}-\u{1F3FA}\u{1F1FD}-\u{1F3FA}\u{1F1FE}-\u{1F3FA}\u{1F1FF}-\u{1F3FA}]+$/u;
      return emojiRegex.test(children);
    }
    return false;
  }, [children]);

  // Apply Denis Macharov only to text, preserve system font for icons
  const fontFamily = useCustomFont && !hasOnlyEmojis ? 'DenisMacharov' : undefined;

  return (
    <RNText style={[fontFamily && { fontFamily }, style]} {...props}>
      {children}
    </RNText>
  );
};

export default SmartText;
