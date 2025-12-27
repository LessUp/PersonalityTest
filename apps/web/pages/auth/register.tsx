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
import { User, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  const toast = useToast();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      toast.warning('密码不匹配', '请确保两次输入的密码相同');
      return;
    }

    if (password.length < 6) {
      setError('密码至少需要6个字符');
      toast.warning('密码太短', '密码至少需要6个字符');
      return;
    }

    setIsLoading(true);

    const result = await register(name, email, password);
    
    if (result.success) {
      toast.success('注册成功', '欢迎加入人格测试咨询平台！');
      router.push('/');
    } else {
      setError(result.error || '注册失败');
      toast.error('注册失败', result.error || '请稍后重试');
    }
    
    setIsLoading(false);
  };

  if (isAuthenticated) return null;

  const benefits = [
    '解锁全部基础测评',
    '保存测试历史记录',
    '获取个性化建议',
  ];

  return (
    <>
      <Head>
        <title>注册 - 人格测试咨询平台</title>
        <meta name="description" content="创建您的人格测试账户" />
      </Head>

      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 right-1/4 w-72 h-72 bg-purple-200 dark:bg-purple-900/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" />
          <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-indigo-200 dark:bg-indigo-900/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <Card className="w-full max-w-md animate-fade-in shadow-xl">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">✨</span>
            </div>
            <CardTitle className="text-2xl">创建账户</CardTitle>
            <CardDescription>开始您的自我探索之旅</CardDescription>
          </CardHeader>

          <CardContent>
            {/* Benefits */}
            <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200 mb-2">注册即可获得：</p>
              <ul className="space-y-1">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-indigo-700 dark:text-indigo-300">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm animate-shake">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name">您的姓名</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="张三"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

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
                <Label htmlFor="password">设置密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="至少6个字符"
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再次输入密码"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    注册中...
                  </>
                ) : (
                  <>
                    创建账户
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              已有账户？{' '}
              <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium">
                立即登录
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
