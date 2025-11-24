import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, Star, Sparkles, Brain, BarChart3 } from 'lucide-react';

const featureHighlights = [
  {
    title: 'Personalized Insights',
    description:
      'Understand how your preferences influence the way you communicate, collaborate, and make decisions.',
    icon: Brain,
  },
  {
    title: 'Progress Tracking',
    description:
      'Save your results to revisit them later and monitor how your self-perception evolves over time.',
    icon: BarChart3,
  },
  {
    title: 'Expert Guidance',
    description:
      'Each assessment includes science-backed tips to help you put your personality insights into action.',
    icon: Sparkles,
  },
];

const discoveryCards = [
  {
    eyebrow: 'Start Exploring',
    title: 'Browse the Test Library',
    description:
      'From MBTI to the Enneagram and Big Five, find the assessment that resonates with your goals.',
    href: '/tests',
    cta: 'See all assessments',
    variant: 'default',
  },
  {
    eyebrow: 'New to Personality Tests?',
    title: 'Learn how they work',
    description:
      'Get a quick primer on what each framework measures and how the results can support your growth.',
    href: '/tests#overview',
    cta: 'Read the overview',
    variant: 'secondary',
  },
];

const testimonials = [
  {
    quote:
      '“The guided insights helped me have deeper conversations with my team about how we collaborate.”',
    author: 'Leah, Product Manager',
    rating: 5,
  },
  {
    quote: '“I finally understand why certain tasks energize me and others drain me.”',
    author: 'Miguel, UX Designer',
    rating: 5,
  },
];

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <Head>
        <title>Personality Assessments</title>
        <meta
          name="description"
          content="Explore a catalog of personality assessments and track your results."
        />
      </Head>

      <main className="container mx-auto px-4 py-12 max-w-6xl space-y-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[2rem] bg-white dark:bg-gray-800 p-8 md:p-16 shadow-xl border border-gray-100 dark:border-gray-700">
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 opacity-50" />
           <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
             <Badge variant="secondary" className="px-4 py-1 text-sm uppercase tracking-wider font-medium bg-white/50 backdrop-blur-sm border-indigo-100 text-indigo-600">
               Discover your strengths
             </Badge>
             <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400">
               Build self-awareness with curated personality assessments
             </h1>
             <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
               Uncover patterns, clarify motivations, and learn how to leverage your unique strengths with
               thoughtfully designed assessments and actionable guidance.
             </p>
             <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
               <Button asChild size="lg" className="rounded-full h-12 px-8 text-base shadow-lg shadow-indigo-500/20 transition-transform hover:scale-105">
                 <Link href="/tests">
                   Start exploring assessments
                   <ArrowRight className="ml-2 h-4 w-4" />
                 </Link>
               </Button>
               <Button asChild variant="outline" size="lg" className="rounded-full h-12 px-8 text-base bg-white/80 backdrop-blur-sm hover:bg-white hover:text-indigo-600 border-gray-200">
                 <Link href="/tests#overview">
                   See how it works
                 </Link>
               </Button>
             </div>
           </div>
        </section>

        {/* Features Section */}
        <section className="space-y-10">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Why people love this library</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              More than just a test result. Get the tools you need to understand yourself better.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {featureHighlights.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border-none shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Discovery Section */}
        <section className="space-y-10">
           <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Find your next insight</h2>
           </div>
          <div className="grid md:grid-cols-2 gap-8">
            {discoveryCards.map((card) => (
              <Card key={card.title} className={`overflow-hidden border-none shadow-xl ${
                card.variant === 'default' 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white'
              }`}>
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                <CardHeader className="relative z-10">
                  <p className="text-sm font-semibold tracking-widest uppercase opacity-70 mb-2">
                    {card.eyebrow}
                  </p>
                  <CardTitle className="text-2xl md:text-3xl mb-2">{card.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-lg opacity-90 mb-8 leading-relaxed">
                    {card.description}
                  </p>
                  <Button asChild variant="secondary" className="rounded-full hover:bg-white hover:text-indigo-600 transition-colors">
                    <Link href={card.href}>
                      {card.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="space-y-10 pb-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Hear from recent explorers</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.author} className="bg-white dark:bg-gray-800 border-none shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex gap-1 text-amber-400 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-lg text-gray-700 dark:text-gray-300 italic mb-6">
                    {testimonial.quote}
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      {testimonial.author[0]}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {testimonial.author}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
