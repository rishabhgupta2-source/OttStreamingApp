import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const DEFAULT_PLACEHOLDER = 'Search movies, actors, directors...';

const SEARCH_ICON_SIZE = typography.title_lg.fontSize;

export type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder,
}: SearchBarProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.container,
        focused ? styles.containerFocused : styles.containerUnfocused,
      ]}
    >
      <MaterialIcons
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        name="search"
        size={SEARCH_ICON_SIZE}
        color={colors.on_surface_variant}
        style={styles.searchIcon}
      />
      <TextInput
        accessibilityRole="search"
        onBlur={() => {
          setFocused(false);
        }}
        onChangeText={onChangeText}
        onFocus={() => {
          setFocused(true);
        }}
        placeholder={placeholder ?? DEFAULT_PLACEHOLDER}
        placeholderTextColor={colors.on_surface_variant}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface_container_low,
    borderRadius: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
  },
  containerFocused: {
    borderColor: colors.outline_variant,
  },
  containerUnfocused: {
    borderColor: 'transparent',
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: spacing.xl + spacing.sm,
    paddingVertical: 0,
    backgroundColor: 'transparent',
    color: colors.on_surface,
    ...typography.body_md,
  },
});
