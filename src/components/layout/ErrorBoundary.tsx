import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Page crashed:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="card mx-auto mt-10 max-w-lg p-8 text-center">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-500/15">
          <AlertOctagon className="h-7 w-7" />
        </span>
        <h2 className="text-lg font-bold text-ink">Something went wrong</h2>
        <p className="mt-1 text-sm text-muted">This page hit an unexpected error. Your data is safe.</p>
        <p className="mt-3 rounded-lg bg-soft px-3 py-2 font-mono text-xs text-muted">{this.state.error.message}</p>
        <button
          onClick={() => this.setState({ error: null })}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-glow"
        >
          <RotateCcw className="h-4 w-4" /> Try again
        </button>
      </div>
    );
  }
}
