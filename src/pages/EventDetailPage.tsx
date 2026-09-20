import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Clock } from 'lucide-react';
import { storage } from '../services/storage';
import { SeoHead, SITE_URL } from '../components/SeoHead';

export const EventDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const event = slug ? storage.getEventBySlug(slug) : undefined;

  if (!event) return <div className="py-24 text-center px-4"><h1 className="text-2xl font-bold">Event not found</h1><Link to="/events" className="mt-4 inline-block underline">Back to events</Link></div>;

  const description = event.description;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description,
    image: event.coverImage,
    startDate: `${event.date}${event.time ? `T${event.time}` : ''}`,
    eventStatus: event.status === 'cancelled' ? 'https://schema.org/EventCancelled' : 'https://schema.org/EventScheduled',
    location: { '@type': 'Place', name: event.location, address: event.location },
    organizer: { '@type': 'Organization', name: 'SAFA', url: `${SITE_URL}/` },
    url: `${SITE_URL}/events/${event.slug}`
  };

  return (
    <article className="py-12 sm:py-16 bg-[#FDFCF9]">
      <SeoHead title={`${event.title} | SAFA`} description={description} path={`/events/${event.slug}`} image={event.coverImage} schema={schema} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/events" className="inline-flex items-center gap-2 text-sm font-semibold text-[#5E6E52] hover:underline mb-8"><ArrowLeft className="w-4 h-4" />Back to events</Link>
        <p className="text-xs font-bold uppercase tracking-wider text-[#5E6E52] mb-3">{event.category || 'Community event'} · {event.status}</p>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold leading-tight text-[#3D3B36]">{event.title}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-[#6D6A61] mt-5 mb-8">
          <span className="inline-flex items-center gap-1"><Calendar className="w-4 h-4" />{event.date}</span>
          {event.time && <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" />{event.time}</span>}
          <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" />{event.location}</span>
        </div>
        {event.coverImage && <img src={event.coverImage} alt={event.title} className="w-full aspect-[16/9] object-cover rounded-2xl mb-8" />}
        <p className="text-base sm:text-lg leading-relaxed text-[#3D3B36] mb-8">{event.description}</p>
        {event.registrationUrl && <a href={event.registrationUrl} className="inline-flex items-center justify-center rounded-xl bg-[#5E6E52] px-5 py-3 text-sm font-bold text-white hover:bg-[#4E5C43]">Register for this event</a>}
      </div>
    </article>
  );
};