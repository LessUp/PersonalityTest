import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, Crown, Settings, LogOut, ChevronRight } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    await updateUser({ name: name.trim() });
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getMembershipInfo = () => {
    switch (user?.membershipTier) {
      case 'basic':
        return { label: '基础版', color: 'bg-blue-500', icon: '⭐' };
      case 'premium':
        return { label: '高级版', color: 'bg-purple-500', icon: '💎' };
      case 'professional':
        return { label: '专业版', color: 'bg-gradient-to-r from-amber-500 to-orange-500', icon: '👑' };
      default:
        return { label: '免费版', color: 'bg-gray-500', icon: '🆓' };
    }
  };

  const membership = getMembershipInfo();

  return (
    <>
      <Head>
        <title>个人中心 - 心理测评平台</title>
        <meta name="description" content="管理您的账户和会员信息" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4">
        <main className="container mx-auto max-w-4xl space-y-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">个人中心</h1>

          {/* 用户信息卡片 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-600" />
                  基本信息
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  {isEditing ? '取消' : '编辑'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                  {user?.name?.charAt(0) || '用'}
                </div>
                <div className="flex-1 space-y-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Label htmlFor="name">姓名</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="请输入姓名"
                      />
                      <Button onClick={handleSave} disabled={isSaving} size="sm">
                        {isSaving ? '保存中...' : '保存'}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {user?.name}
                      </h2>
                      <p className="text-gray-500 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {user?.email}
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <Calendar className="h-5 w-5" />
                  <div>
                    <p className="text-sm text-gray-500">注册时间</p>
                    <p className="font-medium">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN') : '未知'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <Crown className="h-5 w-5" />
                  <div>
                    <p className="text-sm text-gray-500">完成测试</p>
                    <p className="font-medium">{user?.testHistory?.length || 0} 个</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 会员信息 */}
          <Card className="overflow-hidden">
            <div className={`h-2 ${membership.color}`} />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{membership.icon}</span>
                会员状态
              </CardTitle>
              <CardDescription>管理您的会员订阅</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Badge className={`${membership.color} text-white border-none px-3 py-1`}>
                    {membership.label}
                  </Badge>
                  <p className="text-sm text-gray-500 mt-2">
                    {user?.membershipTier === 'free' 
                      ? '升级会员解锁更多功能' 
                      : '感谢您的支持！'}
                  </p>
                </div>
                <Button asChild>
                  <Link href="/membership">
                    {user?.membershipTier === 'free' ? '升级会员' : '管理订阅'}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 快捷操作 */}
          <Card>
            <CardHeader>
              <CardTitle>快捷操作</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <Button asChild variant="outline" className="h-auto py-4 justify-start">
                  <Link href="/results" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                      📊
                    </div>
                    <div className="text-left">
                      <p className="font-medium">查看测试结果</p>
                      <p className="text-sm text-gray-500">浏览所有历史记录</p>
                    </div>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-4 justify-start">
                  <Link href="/tests" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                      🧠
                    </div>
                    <div className="text-left">
                      <p className="font-medium">开始新测评</p>
                      <p className="text-sm text-gray-500">探索更多量表</p>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 退出登录 */}
          <div className="flex justify-center pt-4">
            <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              退出登录
            </Button>
          </div>
        </main>
      </div>
    </>
  );
}
