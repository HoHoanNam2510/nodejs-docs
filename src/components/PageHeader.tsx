import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Badge from './Badge';
import { BadgeVariant } from '../types';

interface Props {
  moduleNum: string;
  title: string;
  subtitle: string;
  priority: BadgeVariant;
  time: string;
  lessonCount: number;
  prevLink?: { to: string; label: string };
  nextLink?: { to: string; label: string };
  prereqs?: string[];
  children?: ReactNode;
}

export default function PageHeader({
  moduleNum,
  title,
  subtitle,
  priority,
  time,
  lessonCount,
  prevLink,
  nextLink,
  prereqs,
}: Props) {
  return (
    <div className="page-header">
      <div className="page-header-bg">
        <div className="grid-overlay" />
      </div>
      <div className="page-header-inner">
        <div className="breadcrumb-row">
          {prevLink ? (
            <Link to={prevLink.to} className="breadcrumb-link">
              ← {prevLink.label}
            </Link>
          ) : (
            <span />
          )}
          {nextLink && (
            <Link to={nextLink.to} className="breadcrumb-link">
              {nextLink.label} →
            </Link>
          )}
        </div>
        <span className="module-label">{moduleNum}</span>
        <h1>{title}</h1>
        <p className="page-subtitle">"{subtitle}"</p>
        <div className="page-meta">
          <span className="meta-chip">⏱ {time}</span>
          <span className="meta-chip">📚 {lessonCount} bài</span>
          <Badge variant={priority} />
          <Badge variant="ts" />
        </div>
        {prereqs && prereqs.length > 0 && (
          <div className="prereq-row">
            <span className="prereq-label">Cần biết trước:</span>
            {prereqs.map(p => (
              <span key={p} className="prereq-badge">
                {p}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
