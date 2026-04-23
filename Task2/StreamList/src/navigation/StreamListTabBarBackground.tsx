import { BlurView } from '@react-native-community/blur';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const styles = StyleSheet.create({
  tabBarBlurRoot: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    borderRadius: spacing.xl,
  },
  tabBarTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surface,
  },
});

/**
 * Blur + tint behind the floating tab bar. Extracted so DetailScreen can remove
 * `tabBarBackground` while Detail is shown (Android otherwise may keep a full-screen dim from BlurView).
 */
export function StreamListTabBarBackground() {
  return (
    <View style={styles.tabBarBlurRoot}>
      <BlurView
        style={[StyleSheet.absoluteFill, styles.tabBarBlurRoot]}
        blurAmount={20}
        blurType="dark"
        reducedTransparencyFallbackColor={colors.tab_bar_overlay}
      />
      <View pointerEvents="none" style={styles.tabBarTint} />
    </View>
  );
}
