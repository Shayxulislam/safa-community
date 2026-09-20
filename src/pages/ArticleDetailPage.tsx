import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, User } from 'lucide-react';
import { storage } from '../services/storage';
import { SeoHead, SITE_URL } from '../components/SeoHead';

export const ArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? storage.getArticleBySlug(slug) : undefined;

  if (!article || article.status !== 'published') {
    return <div className="py-24 text-center px-4"><h1 className="text-2xl font-bold">Article not found</h1><Link to="/articles" className="mt-4 inline-block underline">Back to articles</Link></div>;
  }

  const description = article.seoDescription || article.excerpt;
  const url = `${SITE_URL}/articles/${article.slug}`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.seoTitle || article.title,
    description,
    image: article.coverImage,
    datePublished: article.publishedAt || article.date,
    author: { '@type': 'Person', name: article.author },
    publisher: { '@type': 'Organization', name: 'SAFA', url: `${SITE_URL}/` },
    mainEntityOfPage: url
  };

  return (
    <article className="py-12 sm:py-16 bg-[#FDFCF9]">
      <SeoHead title={`${article.seoTitle || article.title} | SAFA`} description={description} path={`/articles/${article.slug}`} image={article.coverImage} type="article" schema={schema} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/articles" className="inline-flex items-center gap-2 text-sm font-semibold text-[#5E6E52] hover:underline mb-8"><ArrowLeft className="w-4 h-4" />Back to articles</Link>
        <p className="text-xs font-bold uppercase tracking-wider text-[#5E6E52] mb-3">{article.category}</p>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold leading-tight text-[#3D3B36]">{article.title}</h1>
        <div className="flex flex-wrap gap-4 text-xs text-[#6D6A61] mt-5 mb-8">
          <span className="inline-flex items-center gap-1"><User className="w-3.5 h-3.5" />{article.author}</span>
          <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(article.date).toLocaleDateString()}</span>
          {article.location && <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{article.location}</span>}
        </div>
        <img src={article.coverImage} alt={article.title} className="w-full aspect-[16/9] object-cover rounded-2xl mb-8" />
        <p className="text-lg text-[#6D6A61] leading-relaxed mb-6">{article.excerpt}</p>
        <div className="whitespace-pre-line text-base leading-8 text-[#3D3B36]">{article.content}</div>
      </div>
    </article>
  );
};