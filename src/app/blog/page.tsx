import React from "react";
import Link from "next/link";
import { BLOG_POSTS } from "@/data/siteContent";
import { BookOpen, ArrowRight, Sparkles, Clock } from "lucide-react";

export default function BlogPage() {
  return (
    <div className="bg-[#FAF8F5] min-h-screen pb-20">
      <section className="bg-[#172C3B] text-[#E8E2D9] py-16 border-b border-[#BD9472]/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#BD9472]">
            <Sparkles className="w-4 h-4" />
            <span>Central de Conteúdo & Inteligência de Viagem (SEO)</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
            Blog Sing Viagens & Eventos
          </h1>
          <p className="text-base text-[#E8E2D9]/85 max-w-3xl">
            Guias práticos sobre tarifas aéreas, siglas IATA, regras para viajar com menores e os melhores roteiros musicais do Brasil e do mundo.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
        {BLOG_POSTS.map((post) => (
          <article
            key={post.slug}
            className="rounded-2xl bg-white border border-gray-200 p-8 shadow-sm space-y-4"
          >
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span className="px-3 py-1 rounded-full bg-[#172C3B] text-[#BD9472] font-bold">
                {post.category}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#BD9472]" />
                {post.readTime}
              </span>
              <span>• {post.publishedAt}</span>
              <span>• Por {post.author}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-[#172C3B]">
              {post.title}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">{post.excerpt}</p>

            <div className="bg-[#FAF8F5] rounded-xl p-5 border border-gray-100 space-y-2 text-xs sm:text-sm text-gray-700 leading-relaxed">
              {post.content.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
