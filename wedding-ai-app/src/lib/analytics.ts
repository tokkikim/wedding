// 성능 모니터링 및 분석 도구
export class Analytics {
  private static instance: Analytics;
  
  private constructor() {}
  
  public static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  // 페이지 로딩 시간 측정
  public trackPageLoad(page: string, loadTime: number) {
    if (typeof window !== 'undefined') {
      console.log(`Page ${page} loaded in ${loadTime}ms`);
      
      // Google Analytics 4 이벤트 전송
      if (typeof gtag !== 'undefined') {
        gtag('event', 'page_load_time', {
          page_name: page,
          load_time: loadTime,
          custom_parameter: 'performance'
        });
      }
    }
  }

  // AI 이미지 생성 시간 측정
  public trackImageGeneration(
    userId: string, 
    generationTime: number, 
    success: boolean,
    imageCount: number = 1
  ) {
    console.log(`Image generation for user ${userId}: ${generationTime}ms, success: ${success}`);
    
    if (typeof window !== 'undefined' && typeof gtag !== 'undefined') {
      gtag('event', 'ai_image_generation', {
        user_id: userId,
        generation_time: generationTime,
        success: success,
        image_count: imageCount,
        custom_parameter: 'ai_performance'
      });
    }
  }

  // 에러 추적
  public trackError(error: Error, context: string, userId?: string) {
    console.error(`Error in ${context}:`, error);
    
    if (typeof window !== 'undefined' && typeof gtag !== 'undefined') {
      gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        context: context,
        user_id: userId
      });
    }
  }

  // 사용자 행동 추적
  public trackUserAction(action: string, category: string, label?: string, value?: number) {
    if (typeof window !== 'undefined' && typeof gtag !== 'undefined') {
      gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      });
    }
  }

  // 결제 이벤트 추적
  public trackPurchase(
    transactionId: string,
    value: number,
    currency: string = 'KRW',
    items: Array<{item_id: string, item_name: string, quantity: number, price: number}>
  ) {
    if (typeof window !== 'undefined' && typeof gtag !== 'undefined') {
      gtag('event', 'purchase', {
        transaction_id: transactionId,
        value: value,
        currency: currency,
        items: items
      });
    }
  }

  // 성능 메트릭 수집
  public collectPerformanceMetrics() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const metrics = {
        // DNS 조회 시간
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        // TCP 연결 시간
        tcp: navigation.connectEnd - navigation.connectStart,
        // 요청/응답 시간
        request: navigation.responseEnd - navigation.requestStart,
        // DOM 로딩 시간
        dom: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        // 전체 로딩 시간
        load: navigation.loadEventEnd - navigation.navigationStart
      };

      console.log('Performance metrics:', metrics);
      
      // 성능 데이터를 서버로 전송
      this.sendPerformanceData(metrics);
    }
  }

  private async sendPerformanceData(metrics: any) {
    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      });
    } catch (error) {
      console.error('Failed to send performance data:', error);
    }
  }
}

// 전역 인스턴스
export const analytics = Analytics.getInstance();

// Web Vitals 측정
export function measureWebVitals() {
  if (typeof window !== 'undefined') {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      analytics.trackUserAction('lcp', 'web_vitals', undefined, lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        analytics.trackUserAction('fid', 'web_vitals', undefined, entry.processingStart - entry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      analytics.trackUserAction('cls', 'web_vitals', undefined, clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }
}
