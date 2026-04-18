'use client';

import { ExternalLink, Heart, MessageCircle, Share2, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatNumber } from '@/lib/utils';
import type { TikTokVideo } from '@/types';
import Image from 'next/image';

interface Props {
  videos: TikTokVideo[];
}

export function TikTokGrid({ videos }: Props) {
  if (videos.length === 0) return null;

  return (
    <section className="section-pad max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <p className="text-mango font-semibold tracking-widest uppercase text-sm mb-2">Follow Along</p>
        <h2 className="text-3xl md:text-5xl font-display font-bold gradient-text mb-3">
          As Seen on TikTok
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400">
          Real juice. Real vibes. Follow us{' '}
          <a href="https://tiktok.com/@jamaicanjuicy" target="_blank" rel="noopener noreferrer"
            className="text-mango font-semibold hover:underline">
            @jamaicanjuicy
          </a>
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {videos.map((video, i) => (
          <motion.a
            key={video.id}
            href={video.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="group relative aspect-[9/16] rounded-2xl overflow-hidden block bg-neutral-100 dark:bg-neutral-800"
          >
            <Image
              src={video.thumbnail}
              alt={video.description}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* TikTok play icon */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <ExternalLink className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Stats */}
            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <p className="text-white text-xs line-clamp-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {video.description}
              </p>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-white text-xs">
                  <Heart className="w-3 h-3" /> {formatNumber(video.likes)}
                </span>
                <span className="flex items-center gap-1 text-white text-xs">
                  <Eye className="w-3 h-3" /> {formatNumber(video.views)}
                </span>
              </div>
            </div>

            {/* View count badge (always visible) */}
            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
              <Eye className="w-3 h-3 text-white" />
              <span className="text-white text-[10px] font-bold">{formatNumber(video.views)}</span>
            </div>
          </motion.a>
        ))}
      </div>

      <div className="text-center mt-8">
        <a
          href="https://tiktok.com/@jamaicanjuicy"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline"
        >
          Follow on TikTok <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}
