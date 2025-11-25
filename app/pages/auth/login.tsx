import { useState, FormEvent, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const toast = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 如果已登录，重定向到首页
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      toast.success('登录成功', '欢迎回来！');
      router.push('/');
    } else {
      setError(result.error || '登录失败');
      toast.error('登录失败', result.error || '请检查您的邮箱和密码');
    }
    
    setIsLoading(false);
  };

  if (isAuthenticated) return null;

  return (
    <>
      <Head>
        <title>登录 - 心理测评平台</title>
        <meta name="description" content="登录您的心理测评账户" />
      </Head>

      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-indigo-200 dark:bg-indigo-900/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" />
          <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-purple-200 dark:bg-purple-900/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <Card className="w-full max-w-md animate-fade-in shadow-xl">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">🧠</span>
            </div>
            <CardTitle className="text-2xl">欢迎回来</CardTitle>
            <CardDescription>登录以继续您的心理探索之旅</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm animate-shake">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">邮箱地址</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    登录中...
                  </>
                ) : (
                  <>
                    登录
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              还没有账户？{' '}
              <Link href="/auth/register" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium">
                立即注册
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
