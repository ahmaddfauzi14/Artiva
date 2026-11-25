'use client';

import Link from 'next/link';
import { useId } from 'react';
import { useMotion } from '@/components/effects/MotionContext';
import StatusBadge from '@/components/ui/StatusBadge';
import './WinnerPodium.css';

const MEDAL_PALETTE = {
  1: {
    variant: 'gold',
    stops: ['#FFF7D6', '#F2C94C', '#D39A27', '#946210'],
    stem: '#E3B33B',
  },
  2: {
    variant: 'silver',
    stops: ['#F7FBFF', '#D2E0F2', '#95ACC9', '#5D7496'],
    stem: '#B7CCE6',
  },
  3: {
    variant: 'bronze',
    stops: ['#FCE3CA', '#DF9D66', '#AA6635', '#6E3E1C'],
    stem: '#CE8A54',
  },
};

/* Koordinat pasangan daun di sepanjang lengkung kiri daun laurel lebar (kanan dicerminkan) */
const LAUREL_BRANCH_NODES = [
  { x: 118, y: 244, outerAngle: -162, innerAngle: -96, scale: 1.0 },
  { x: 92, y: 228, outerAngle: -152, innerAngle: -88, scale: 1.08 },
  { x: 68, y: 204, outerAngle: -140, innerAngle: -76, scale: 1.14 },
  { x: 50, y: 175, outerAngle: -128, innerAngle: -64, scale: 1.14 },
  { x: 39, y: 144, outerAngle: -116, innerAngle: -52, scale: 1.1 },
  { x: 36, y: 112, outerAngle: -104, innerAngle: -40, scale: 1.06 },
  { x: 41, y: 82, outerAngle: -90, innerAngle: -28, scale: 0.98 },
  { x: 52, y: 55, outerAngle: -76, innerAngle: -16, scale: 0.9 },
  { x: 67, y: 34, outerAngle: -62, innerAngle: -4, scale: 0.8 },
];

const LEAF_PATH = 'M 0 0 C 6 -6.5 16 -8.4 28 0 C 16 8.4 6 6.5 0 0 Z';

function LaurelBranch({ gradId, stemColor, compact = false }) {
  return (
    <g>
      <path
        d="M 132 252 C 46 228 12 132 78 22"
        fill="none"
        stroke={stemColor}
        strokeWidth={compact ? '5.5' : '2.6'}
        strokeLinecap="round"
        opacity="0.9"
      />
      {LAUREL_BRANCH_NODES.map((node, index) => {
        const s = compact ? node.scale * 1.45 : node.scale;
        return (
          <g key={index}>
            <path
              d={LEAF_PATH}
              fill={`url(#${gradId})`}
              transform={`translate(${node.x} ${node.y}) rotate(${node.outerAngle}) scale(${s.toFixed(2)})`}
            />
            <path
              d={LEAF_PATH}
              fill={`url(#${gradId})`}
              opacity="0.92"
              transform={`translate(${node.x} ${node.y}) rotate(${node.innerAngle}) scale(${(s * 0.86).toFixed(2)})`}
            />
          </g>
        );
      })}
      <path
        d={LEAF_PATH}
        fill={`url(#${gradId})`}
        transform={`translate(78 22) rotate(-42) scale(${compact ? '1.1' : '0.84'})`}
      />
    </g>
  );
}

function LaurelWreath({ rank, compact = false, className = '' }) {
  const uid = useId();
  const palette = MEDAL_PALETTE[rank] || MEDAL_PALETTE[2];
  const gradId = `laurel-grad-${palette.variant}-${uid.replace(/:/g, '')}`;

  return (
    <svg
      viewBox="0 0 380 264"
      aria-hidden="true"
      focusable="false"
      className={`wp-laurel-svg ${className}`.trim()}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={palette.stops[0]} />
          <stop offset="38%" stopColor={palette.stops[1]} />
          <stop offset="76%" stopColor={palette.stops[2]} />
          <stop offset="100%" stopColor={palette.stops[3]} />
        </linearGradient>
      </defs>
      <LaurelBranch
        gradId={gradId}
        stemColor={palette.stem}
        compact={compact}
      />
      <g transform="translate(380 0) scale(-1 1)">
        <LaurelBranch
          gradId={gradId}
          stemColor={palette.stem}
          compact={compact}
        />
      </g>
    </svg>
  );
}

export default function WinnerPodium({
  winners = [],
  showModerationWarning = false,
  artworkHrefPrefix = '/artworks',
  className = '',
}) {
  const { isMotionActive } = useMotion();

  const sortedWinners = [...winners]
    .filter(Boolean)
    .sort((a, b) => (Number(a.rank) || 99) - (Number(b.rank) || 99));

  const podiumWinners = sortedWinners.slice(0, 3);
  if (podiumWinners.length === 0) {
    return null;
  }

  return (
    <div className={`wp-container ${className}`.trim()}>
      <div
        data-motion-active={isMotionActive ? 'true' : 'false'}
        className="edge-glow wp-stage"
      >
        <span aria-hidden="true" className="wp-stars" />
        <span aria-hidden="true" className="wp-floor" />

        {/* Sorot lampu spotlight sejajar dari langit-langit panggung */}
        <div
          aria-hidden="true"
          data-count={String(podiumWinners.length)}
          className="wp-ceiling-lights"
        >
          {podiumWinners.map((winner, index) => {
            const rawRank = Number(winner.rank) || index + 1;
            const visualRank = rawRank >= 1 && rawRank <= 3 ? rawRank : 3;
            return (
              <div
                key={`beam-${winner.winner_id ?? index}`}
                data-rank={String(visualRank)}
                data-slot={String(index + 1)}
                className="wp-beam-col"
              >
                <span className="wp-lamp-head" />
                <span className="wp-beam-cone" />
              </div>
            );
          })}
        </div>

        <ol
          role="list"
          data-count={String(podiumWinners.length)}
          className="wp-list"
        >
          {podiumWinners.map((winner, index) => {
            const rawRank = Number(winner.rank) || index + 1;
            const visualRank = rawRank >= 1 && rawRank <= 3 ? rawRank : 3;
            const slotIndex = index + 1;
            const rankCode = `JUARA 0${rawRank}`;
            const isLinked =
              !winner.is_moderated && Boolean(winner.artwork?.artwork_id);
            const artworkHref = isLinked
              ? `${artworkHrefPrefix}/${winner.artwork.artwork_id}`
              : null;
            const artworkTitle = winner.artwork?.title || 'Karya pemenang';
            const creatorName = winner.creator?.display_name || 'Kreator ARTIVA';

            const cardInner = (
              <>
                <div className="wp-media">
                  {winner.is_moderated || !winner.artwork?.image_url ? (
                    <div className="wp-moderated">Dimoderasi</div>
                  ) : (
                    <img
                      src={winner.artwork.image_url}
                      alt={artworkTitle}
                      width={400}
                      height={300}
                      loading="lazy"
                      className="wp-img"
                    />
                  )}
                </div>

                <div className="wp-meta">
                  <div className="wp-rank-row">
                    <span className="wp-laurel-mini">
                      <LaurelWreath rank={visualRank} compact />
                    </span>
                    <span className="wp-rank-label">{rankCode}</span>
                  </div>

                  <h3 className="wp-title">{artworkTitle}</h3>
                  <p className="wp-creator">oleh {creatorName}</p>

                  {isLinked ? (
                    <span className="wp-cta">
                      <span>Lihat karya</span>
                      <span aria-hidden="true">→</span>
                    </span>
                  ) : null}
                </div>
              </>
            );

            return (
              <li
                key={winner.winner_id ?? `${rawRank}-${index}`}
                data-rank={String(visualRank)}
                data-slot={String(slotIndex)}
                className="wp-slot"
              >
                {/* Daun laurel SVG + Kartu Karya di atas podium */}
                <div className="wp-showcase">
                  <div className="wp-laurel-desktop">
                    <LaurelWreath rank={visualRank} />
                  </div>

                  {artworkHref ? (
                    <Link href={artworkHref} className="wp-card-link">
                      {cardInner}
                    </Link>
                  ) : (
                    <article className="wp-card-static">{cardInner}</article>
                  )}
                </div>

                {/* Pedestal podium bertingkat + angka besar + pantulan lantai */}
                <div className="wp-pedestal">
                  <div aria-hidden="true" className="wp-pedestal-top" />
                  <div className="wp-pedestal-body">
                    <span className="wp-pedestal-sub">Peringkat {rawRank}</span>
                    <span aria-hidden="true" className="wp-pedestal-num">
                      {rawRank}
                    </span>
                  </div>
                  <div aria-hidden="true" className="wp-reflection">
                    <span className="wp-reflection-num">{rawRank}</span>
                  </div>
                </div>

                {showModerationWarning && winner.is_moderated ? (
                  <div className="wp-mod-note">
                    <StatusBadge
                      label="Peringatan BR-12: Karya pemenang dimoderasi"
                      tone="danger"
                    />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
