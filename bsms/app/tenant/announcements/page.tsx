'use client';
import { useAppStore } from '@/lib/store/appStore';
import { useAuthStore } from '@/lib/store/authStore';
import { Card } from '@/components/ui';
import { Megaphone, Calendar } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function TenantAnnouncements() {
  const { announcements, markAnnouncementRead } = useAppStore();
  const { user } = useAuthStore();
  const myAnns = announcements.filter(a => a.targetRole === 'all' || a.targetRole === 'tenant');

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Announcements</h2>
      <div className="space-y-4">
        {myAnns.length === 0 ? (
          <Card className="p-8 text-center">
            <Megaphone className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No announcements yet</p>
          </Card>
        ) : myAnns.map(ann => {
          const isRead = ann.readBy.includes(user?.id || '');
          return (
            <Card key={ann.id} className={`p-5 cursor-pointer transition-all ${!isRead ? 'border-indigo-300 dark:border-indigo-700' : ''}`}
              onClick={() => !isRead && markAnnouncementRead(ann.id, user?.id || '')}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl flex-shrink-0 ${!isRead ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  <Megaphone className={`w-5 h-5 ${!isRead ? 'text-indigo-600' : 'text-slate-400'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{ann.title}</h3>
                    {!isRead && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{ann.content}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDateTime(ann.createdAt)}</span>
                    <span>By {ann.authorName}</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
