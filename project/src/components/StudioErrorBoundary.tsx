import { Component, type ErrorInfo, type ReactNode } from 'react';

interface StudioErrorBoundaryProps {
  children: ReactNode;
  onClose: () => void;
}

interface StudioErrorBoundaryState {
  hasError: boolean;
}

export class StudioErrorBoundary extends Component<StudioErrorBoundaryProps, StudioErrorBoundaryState> {
  state: StudioErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): StudioErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Studio form failed to render.', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4" role="alert">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <h2 className="text-lg font-bold text-charcoal">เปิดฟอร์มนิยายไม่สำเร็จ</h2>
            <p className="mt-2 text-sm text-charcoal-muted">
              เกิดข้อผิดพลาดระหว่างแสดงฟอร์ม กรุณาปิดแล้วลองเปิดอีกครั้ง
            </p>
            <button
              type="button"
              onClick={this.props.onClose}
              className="mt-5 w-full rounded-xl bg-terracotta-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-terracotta-600"
            >
              ปิด
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
