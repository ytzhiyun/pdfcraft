import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { localeConfig, type Locale, locales } from '@/lib/i18n/config';
import { generateHomeMetadata } from '@/lib/seo';
import { fontVariables } from '@/lib/fonts';
import { SkipLink } from '@/components/common/SkipLink';
import '@/app/globals.css';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/**
 * Viewport configuration for performance
 * Requirements: 8.1 - Lighthouse performance score 90+
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  // Validate locale
  const validLocale = locales.includes(locale as Locale) ? (locale as Locale) : 'en';

  // Get localized SEO translations
  const t = await getTranslations({ locale: validLocale, namespace: 'metadata' });

  // Generate metadata using the SEO module with translations
  return generateHomeMetadata(validLocale, {
    title: t('home.title'),
    description: t('home.description'),
  });
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Get messages for the locale
  const messages = await getMessages();

  // Get direction for the locale
  const direction = localeConfig[locale as Locale]?.direction || 'ltr';

  return (
    <NextIntlClientProvider messages={messages}>
      <div lang={locale} dir={direction} className={`${fontVariables} min-h-screen bg-background text-foreground antialiased font-sans`}>
        <SkipLink targetId="main-content">Skip to main content</SkipLink>
        {children}
        {/* ------------------- 微信引导遮罩层开始 ------------------- */}
<script
  dangerouslySetInnerHTML={{
    __html: `
      (function() {
        // 检测是否在微信内置浏览器中打开
        var ua = navigator.userAgent.toLowerCase();
        var isWeChat = ua.indexOf('micromessenger') !== -1;
        
        if (isWeChat) {
          // 如果是微信，创建一个全屏遮罩
          var overlay = document.createElement('div');
          overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;color:#fff;text-align:center;padding-top:60px;font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;';
          
          // 遮罩层的内容 HTML
          overlay.innerHTML = \`
            <div style="position:absolute;top:15px;right:20px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(-15deg);opacity:0.8;"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
            </div>
            <h3 style="font-size:22px;font-weight:600;margin-bottom:15px;">如果您看到此页面</h3>
            <p style="font-size:16px;line-height:1.6;opacity:0.9;padding:0 30px;">
              说明微信无法直接访问本工具。<br>
              这很正常，请不要担心。
            </p>
            <div style="margin-top:40px;background:rgba(255,255,255,0.1);padding:20px 30px;border-radius:12px;text-align:left;display:inline-block;">
              <p style="font-size:18px;font-weight:bold;color:#4ade80;margin-bottom:10px;">如何继续使用？</p>
              <ol style="margin:0;padding-left:25px;text-align:left;font-size:15px;line-height:1.8;">
                <li>请点击屏幕右上角的 <strong style="font-size:20px;margin:0 5px;">···</strong> 按钮</li>
                <li>在弹出的菜单中选择 👇<br><strong style="color:#fff;border-bottom:2px solid #4ade80;">「在浏览器打开」</strong></li>
                <li>(Safari、Chrome或其他浏览器均可)</li>
              </ol>
            </div>
            <p style="margin-top:60px;font-size:14px;opacity:0.5;">PDFCraft - 安全免费的本地 PDF 工具箱</p>
          \`;
          
          // 将遮罩加入页面并禁止背景滚动
          document.body.appendChild(overlay);
          document.body.style.overflow = 'hidden';
        }
      })();
    `,
  }}
/>
{/* ------------------- 微信引导遮罩层结束 ------------------- */}
      </div>
    </NextIntlClientProvider>
  );
}
