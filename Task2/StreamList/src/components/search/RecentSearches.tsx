import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const HISTORY_ICON_SIZE = typography.body_md.fontSize;

export type RecentSearchesProps = {
  searches: string[];
  onSelectSearch: (term: string) => void;
  onClearAll: () => void;
};

export function RecentSearches({
  searches,
  onSelectSearch,
  onClearAll,
}: RecentSearchesProps) {
  if (searches.length === 0) {
    return null;
  }

  return (
    <View style={styles.root}>
      <View style={styles.headerRow}>
        <Text style={[typography.headline_md, styles.headerTitle]}>
          Recent Searches
        </Text>
        <Pressable
          accessibilityLabel="Clear all recent searches"
          accessibilityRole="button"
          hitSlop={spacing.sm}
          onPress={onClearAll}
        >
          <Text style={[typography.title_sm, styles.clearAll]}>
            CLEAR ALL
          </Text>
        </Pressable>
      </View>
      {searches.map((term, index) => (
        <TouchableOpacity
          accessibilityLabel={`Recent search ${term}`}
          accessibilityRole="button"
          activeOpacity={0.85}
          key={`recent-search-${String(index)}`}
          onPress={() => {
            onSelectSearch(term);
          }}
          style={styles.itemRow}
        >
          <MaterialIcons
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            name="history"
            size={HISTORY_ICON_SIZE}
            color={colors.on_surface_variant}
            style={styles.historyIcon}
          />
          <Text style={[typography.body_md, styles.term]} numberOfLines={1}>
            {term}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    color: colors.on_surface,
    flexShrink: 1,
  },
  clearAll: {
    color: colors.primary_container,
    textTransform: 'uppercase',
    marginLeft: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  historyIcon: {
    marginRight: spacing.md,
  },
  term: {
    flex: 1,
    color: colors.on_surface,
  },
});
