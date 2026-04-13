import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PlayCircle, GripVertical } from 'lucide-react';

export function DraggableThumbnail({ video, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: video.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative glass rounded-xl p-3 hover:bg-white/5 transition-all flex flex-col"
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute top-2 right-2 p-1 z-10 cursor-grab active:cursor-grabbing bg-black/50 rounded hover:bg-white/20 transition-colors"
      >
        <GripVertical size={16} className="text-white/70" />
      </div>

      <div 
        className="aspect-video bg-zinc-800 rounded-lg mb-3 flex items-center justify-center overflow-hidden relative cursor-pointer"
        onClick={() => onClick(video)}
      >
        {video.thumbnail ? (
          <img src={video.thumbnail} alt="" className="object-cover w-full h-full" />
        ) : (
          <PlayCircle className="text-white/40 w-12 h-12 group-hover:scale-110 transition-transform" />
        )}
      </div>
      <p className="text-sm text-zinc-300 truncate font-medium px-1" title={video.name}>{video.name}</p>
      <span className="text-xs text-zinc-500 px-1 mt-1 capitalize">{video.source_type}</span>
    </div>
  );
}
