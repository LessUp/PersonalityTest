import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>页面未找到 - 心理测评平台</title>
      </Head>

      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto animate-fade-in">
          <div className="text-8xl mb-6">🔍</div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            页面未找到
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
            抱歉，您访问的页面不存在或已被移动。
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                返回首页
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/tests">
                <Search className="mr-2 h-5 w-5" />
                浏览测评
              </Link>
            </Button>
          </div>

          <button 
            onClick={() => window.history.back()}
            className="mt-6 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center justify-center gap-1 mx-auto transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回上一页
          </button>
        </div>
      </div>
    </>
  );
}
