import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Critical Application Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    try {
      localStorage.removeItem('scc_admin_session_v1');
      localStorage.removeItem('scc_user_session_v1');
    } catch (e) {
      console.error(e);
    }
    window.location.href = '/admin/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FBFBF7] text-[#2A4343] p-6 flex flex-col items-center justify-center font-sans">
          <div className="max-w-xl w-full bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-red-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center font-bold text-lg">
                ⚠️
              </div>
              <div>
                <h2 className="text-lg font-black text-red-700">UI Rendering Error Detected</h2>
                <p className="text-xs text-stone-500">A component encountered an unhandled exception</p>
              </div>
            </div>

            <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 text-xs font-mono text-red-800 overflow-x-auto max-h-56 whitespace-pre-wrap">
              {this.state.error?.toString()}
              {'\n\n'}
              {this.state.error?.stack}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2.5 bg-[#416B66] hover:bg-[#2A4343] text-white text-xs font-bold rounded-xl transition-colors"
              >
                Reload Page
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2.5 bg-[#D35E36] hover:bg-[#b84e2a] text-white text-xs font-bold rounded-xl transition-colors"
              >
                Reset Session & Login
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
