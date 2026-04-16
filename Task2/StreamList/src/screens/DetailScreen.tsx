import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useLayoutEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { HomeStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export type DetailScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'Detail'
>;

export function DetailScreen({ navigation, route }: DetailScreenProps) {
  const { movieId } = route.params;

  useLayoutEffect(() => {
    const parent = navigation.getParent();
    if (parent === undefined) {
      return;
    }
    parent.setOptions({
      tabBarStyle: { display: 'none', height: 0, overflow: 'hidden' },
    });
    return () => {
      parent.setOptions({ tabBarStyle: undefined });
    };
  }, [navigation]);

  return (
    <View style={styles.root}>
      <Pressable
        accessibilityLabel="Go back"
        accessibilityRole="button"
        onPress={() => {
          navigation.goBack();
        }}
        style={styles.back}
      >
        <Text style={styles.backLabel}>← Back</Text>
      </Pressable>
      <View style={styles.body}>
        <Text style={styles.movieId}>{String(movieId)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  back: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backLabel: {
    ...typography.title_lg,
    color: colors.on_surface,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  movieId: {
    ...typography.headline_md,
    color: colors.on_surface,
  },
});
