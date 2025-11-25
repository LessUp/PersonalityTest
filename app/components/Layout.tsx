import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const navItems = [
    { href: '/', label: '首页' },
    { href: '/tests', label: '测评中心' },
    { href: '/results', label: '结果中心' },
    { href: '/membership', label: '会员' },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>🧠</span>
            <span className={styles.logoText}>心理测评</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.desktopNav}>
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${router.pathname === item.href ? styles.navLinkActive : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className={styles.userMenu}>
            {isAuthenticated ? (
              <div className={styles.userDropdown}>
                <button className={styles.userButton}>
                  <span className={styles.avatar}>{user?.name?.charAt(0) || '用'}</span>
                  <span className={styles.userName}>{user?.name}</span>
                  {user?.membershipTier !== 'free' && (
                    <span className={styles.memberBadge}>
                      {user?.membershipTier === 'premium' ? '⭐' : '👑'}
                    </span>
                  )}
                </button>
                <div className={styles.dropdownContent}>
                  <Link href="/profile" className={styles.dropdownItem}>
                    个人中心
                  </Link>
                  <Link href="/results" className={styles.dropdownItem}>
                    我的测试
                  </Link>
                  <button onClick={handleLogout} className={styles.dropdownItem}>
                    退出登录
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.authButtons}>
                <Link href="/auth/login" className={styles.loginButton}>
                  登录
                </Link>
                <Link href="/auth/register" className={styles.registerButton}>
                  注册
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={styles.mobileMenuButton}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="菜单"
          >
            <span className={`${styles.hamburger} ${isMobileMenuOpen ? styles.hamburgerOpen : ''}`} />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className={`${styles.mobileNav} ${isMobileMenuOpen ? styles.mobileNavOpen : ''}`}>
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.mobileNavLink} ${router.pathname === item.href ? styles.mobileNavLinkActive : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className={styles.mobileAuthSection}>
            {isAuthenticated ? (
              <>
                <Link href="/profile" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                  个人中心
                </Link>
                <button onClick={handleLogout} className={styles.mobileNavLink}>
                  退出登录
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                  登录
                </Link>
                <Link href="/auth/register" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                  注册
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h4>心理测评平台</h4>
            <p>专业、科学的心理评估工具</p>
          </div>
          <div className={styles.footerSection}>
            <h4>快速链接</h4>
            <Link href="/tests">测评中心</Link>
            <Link href="/membership">会员服务</Link>
            <Link href="/about">关于我们</Link>
          </div>
          <div className={styles.footerSection}>
            <h4>联系我们</h4>
            <p>support@example.com</p>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2024 心理测评平台. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
