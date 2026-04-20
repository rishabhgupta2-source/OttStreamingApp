import React, { type ErrorInfo, type ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export type ScreenErrorBoundaryProps = {
  children: ReactNode;
};

type ScreenErrorBoundaryState = {
  hasError: boolean;
  error: string | null;
};

function messageFromCaughtError(error: unknown): string {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }
  return 'Unknown error';
}

/**
 * Catches render errors in a single screen subtree so one failure does not blank the whole app.
 */
export class ScreenErrorBoundary extends React.Component<
  ScreenErrorBoundaryProps,
  ScreenErrorBoundaryState
> {
  public state: ScreenErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(
    error: unknown,
  ): ScreenErrorBoundaryState {
    return {
      hasError: true,
      error: messageFromCaughtError(error),
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ScreenErrorBoundary', error, errorInfo.componentStack);
  }

  private handleTryAgain = (): void => {
    this.setState({ hasError: false, error: null });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.root}>
          <Text style={styles.emoji} accessibilityElementsHidden>
            🎬
          </Text>
          <Text style={styles.title}>Something went wrong</Text>
          {this.state.error !== null && this.state.error.length > 0 ? (
            <Text style={styles.message}>{this.state.error}</Text>
          ) : null}
          <TouchableOpacity
            accessibilityLabel="Try again"
            accessibilityRole="button"
            activeOpacity={0.85}
            onPress={this.handleTryAgain}
            style={styles.tryAgain}
          >
            <Text style={styles.tryAgainLabel}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  emoji: {
    fontSize: spacing.massive,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.headline_md,
    color: colors.on_surface,
    textAlign: 'center',
  },
  message: {
    ...typography.body_md,
    color: colors.on_surface_variant,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  tryAgain: {
    marginTop: spacing.xxl,
    backgroundColor: colors.primary_container,
    borderRadius: spacing.md,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
  },
  tryAgainLabel: {
    ...typography.title_sm,
    color: colors.on_surface,
  },
});
