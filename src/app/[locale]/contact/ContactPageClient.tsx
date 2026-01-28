'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Mail, MessageSquare, Github, Twitter, Send, CheckCircle, AlertCircle, Users, UserPlus, X } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { type Locale } from '@/lib/i18n/config';

interface ContactPageClientProps {
  locale: Locale;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactPageClient({ locale }: ContactPageClientProps) {
  const t = useTranslations('contactPage');
  const [activeQrCode, setActiveQrCode] = useState<{ title: string; image: string } | null>(null);
  const tCommon = useTranslations('common');
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const contactMethods = [
    {
      icon: Mail,
      title: t('methods.email.title'),
      description: t('methods.email.description'),
      action: t('methods.email.action'),
      href: 'mailto:pdf@17ai.eu.org',
      isEmail: true,
    },
   {
      icon: Users, // 这里把 Github 换成了 Users (代表群组)
      title: t('methods.github.title'),
      description: t('methods.github.description'),
      action: '立即加入群聊', // 这里可以直接写中文，也可以去翻译文件里配
      href: 'https://image.17ai.eu.org/file/文档类/1769572100878_加入群聊二维码.png',
      isEmail: false,
    },
    {
      icon: UserPlus, // 这里把 Twitter 换成了 UserPlus (代表加好友)
      title: t('methods.twitter.title'),
      description: t('methods.twitter.description'),
      action: '立即添加好友', // 同上
      href: 'https://image.17ai.eu.org/file/文档类/1769571990970_单人二维码.png', // 图片链接
      isEmail: false,
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');

    try {
      // 👇 【请确认】这里填您想接收邮件的真实邮箱
      const targetEmail = "pdf@17ai.eu.org"; 
      
      const response = await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject || "来自 PDFCraft 官网的新消息",
          message: formData.message
        })
      });

      if (response.ok) {
        setFormStatus('success');
        // 发送成功后，清空输入框，方便用户发下一条
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setFormStatus('error');
      }
    } catch (error) {
      console.error("发送失败:", error);
      setFormStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header locale={locale} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-[hsl(var(--color-muted)/0.3)] py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-[hsl(var(--color-foreground))] mb-4">
                {t('hero.title')}
              </h1>
              <p className="text-[hsl(var(--color-muted-foreground))]">
                {t('hero.description')}
              </p>
            </div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {/* 👇 替换后的新网格布局 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {contactMethods.map((method, index) => {
              // 1. 定义卡片内部通用的显示内容
              const CardContent = (
                <div className="p-6 h-full text-center flex flex-col items-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[hsl(var(--color-primary)/0.1)] mb-4 group-hover:scale-110 transition-transform duration-300">
                     <method.icon className="h-6 w-6 text-[hsl(var(--color-primary))]" />
                  </div>
                  <h3 className="font-semibold text-[hsl(var(--color-foreground))] mb-2">
                    {method.title}
                  </h3>
                  <p className="text-sm text-[hsl(var(--color-muted-foreground))] mb-4">
                    {method.description}
                  </p>
                  <span className="text-sm font-medium text-[hsl(var(--color-primary))] mt-auto group-hover:underline">
                    {method.action}
                  </span>
                </div>
              );

              // 2. 逻辑判断：是邮箱? -> 用 <a> 标签跳转
              if (method.isEmail) {
                return (
                  <a
                    key={index}
                    href={method.href}
                    className="block bg-card rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 group"
                  >
                    {CardContent}
                  </a>
                );
              } 
              // 3. 逻辑判断：是二维码? -> 用 <button> 标签弹窗
              else {
                return (
                  <button
                    key={index}
                    onClick={() => setActiveQrCode({ title: method.title, image: method.href })}
                    className="block w-full bg-card rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer"
                  >
                    {CardContent}
                  </button>
                );
              }
            })}
          </div>
          {/* 👇 弹窗组件 (新增的代码，放在网格下面) */}
          {activeQrCode && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
              onClick={() => setActiveQrCode(null)}
            >
              <div 
                className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* 关闭按钮 */}
                <button 
                  onClick={() => setActiveQrCode(null)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>

                {/* 标题 */}
                <h3 className="text-xl font-bold mb-6">{activeQrCode.title}</h3>

                {/* 二维码图片 */}
                <div className="bg-white p-2 rounded-lg inline-block border shadow-inner mb-4">
                  <img 
                    src={activeQrCode.image} 
                    alt="QR Code" 
                    className="w-48 h-48 object-contain"
                  />
                </div>

                <p className="text-sm text-gray-500">
                  请使用微信 <span className="font-semibold text-green-600">扫一扫</span>
                </p>
              </div>
            </div>
          )}
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-12 bg-[hsl(var(--color-muted)/0.3)]">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[hsl(var(--color-foreground))] mb-2">
                  {t('form.title')}
                </h2>
                <p className="text-[hsl(var(--color-muted-foreground))]">
                  {t('form.description')}
                </p>
              </div>

              {formStatus === 'success' ? (
                <Card className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-[hsl(var(--color-foreground))] mb-2">
                    {t('form.success.title')}
                  </h3>
                  <p className="text-[hsl(var(--color-muted-foreground))] mb-6">
                    {t('form.success.description')}
                  </p>
                  <Button variant="outline" onClick={() => setFormStatus('idle')}>
                    {t('form.success.button')}
                  </Button>
                </Card>
              ) : (
                <Card className="p-6 md:p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-[hsl(var(--color-foreground))] mb-2"
                        >
                          {t('form.fields.name.label')}
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
                          placeholder={t('form.fields.name.placeholder')}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-[hsl(var(--color-foreground))] mb-2"
                        >
                          {t('form.fields.email.label')}
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
                          placeholder={t('form.fields.email.placeholder')}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-[hsl(var(--color-foreground))] mb-2"
                      >
                        {t('form.fields.subject.label')}
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))]"
                      >
                        <option value="">{t('form.fields.subject.placeholder')}</option>
                        <option value="general">{t('form.fields.subject.options.general')}</option>
                        <option value="bug">{t('form.fields.subject.options.bug')}</option>
                        <option value="feature">{t('form.fields.subject.options.feature')}</option>
                        <option value="feedback">{t('form.fields.subject.options.feedback')}</option>
                        <option value="other">{t('form.fields.subject.options.other')}</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-[hsl(var(--color-foreground))] mb-2"
                      >
                        {t('form.fields.message.label')}
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))] resize-none"
                        placeholder={t('form.fields.message.placeholder')}
                      />
                    </div>

                    {formStatus === 'error' && (
                      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <p className="text-sm">
                          {t('form.error')}
                        </p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full"
                      loading={formStatus === 'submitting'}
                      disabled={formStatus === 'submitting'}
                    >
                      {formStatus === 'submitting' ? t('form.submit.loading') : t('form.submit.default')}
                      {formStatus !== 'submitting' && <Send className="ml-2 h-4 w-4" />}
                    </Button>
                  </form>
                </Card>
              )}
            </div>
          </div>
        </section>

        {/* FAQ Link */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-[hsl(var(--color-muted-foreground))]" />
              <h2 className="text-2xl font-bold text-[hsl(var(--color-foreground))] mb-4">
                {t('faq.title')}
              </h2>
              <p className="text-[hsl(var(--color-muted-foreground))] mb-6">
                {t('faq.description', { brand: tCommon('brand') })}
              </p>
              <Link href={`/${locale}/faq`}>
                <Button variant="outline">
                  {t('faq.button')}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
