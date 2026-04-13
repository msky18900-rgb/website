import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { supabase } from './lib/supabase';
import { Folder, LayoutGrid, Plus, ArrowLeft } from 'lucide-react';
import { DraggableThumbnail } from './components/DraggableThumbnail';

export default function App() {
  const [items, setItems] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderPath, setFolderPath] = useState([{ id: null, name: 'Home' }]);

  useEffect(() => {
    fetchItems();
  }, [currentFolder]);

  const fetchItems = async () => {
    let query = supabase.from('media_vault').select('*');
    
    if (currentFolder === null) {
      query = query.is('parent_id', null);
    } else {
      query = query.eq('parent_id', currentFolder);
    }

    const { data, error } = await query;
    if (error) console.error("Error fetching:", error);
    else setItems(data || []);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    // If dropped over a folder, move the video into it
    if (over && active.id !== over.id) {
      const overItem = items.find(i => i.id === over.id);
      if (overItem && overItem.type === 'folder') {
        const { error } = await supabase.table('media_vault')
          .update({ parent_id: over.id })
          .eq('id', active.id);
        if (!error) fetchItems();
      }
    }
  };

  const navigateToFolder = (folderId, folderName) => {
    setCurrentFolder(folderId);
    setFolderPath([...folderPath, { id: folderId, name: folderName }]);
  };

  const navigateBack = () => {
    if (folderPath.length > 1) {
      const newPath = [...folderPath];
      newPath.pop();
      setFolderPath(newPath);
      setCurrentFolder(newPath[newPath.length - 1].id);
    }
  };

  const openPlayerMenu = (video) => {
    alert(`Options for ${video.name}:\n1. Stream Direct (Bridge)\n2. Upload to YT\n3. Push to Mux`);
  };

  const createFolder = async () => {
    const name = prompt("Enter folder name:");
    if (!name) return;
    const { error } = await supabase.from('media_vault').insert([
      { name: name, type: 'folder', parent_id: currentFolder }
    ]);
    if (!error) fetchItems();
  };

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600/20 text-blue-400 p-2.5 rounded-xl border border-blue-500/20">
            <LayoutGrid size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Media Vault</h1>
            <div className="flex items-center gap-2 text-sm text-zinc-400 mt-1">
              {folderPath.length > 1 && (
                <button onClick={navigateBack} className="hover:text-white flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded">
                  <ArrowLeft size={14} /> Back
                </button>
              )}
              <span>{folderPath.map(f => f.name).join(' / ')}</span>
            </div>
          </div>
        </div>
        <button onClick={createFolder} className="bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm font-medium">
          <Plus size={18}/> New Folder
        </button>
      </header>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {items.map((item) => (
            item.type === 'folder' ? (
              <div 
                key={item.id}
                id={item.id} // Used by dnd-kit for drop zones
                onClick={() => navigateToFolder(item.id, item.name)}
                className="glass p-6 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-blue-500/50 hover:bg-blue-500/5 cursor-pointer transition-all aspect-square"
              >
                <Folder className="text-blue-400 fill-blue-500/10" size={48} strokeWidth={1.5} />
                <span className="text-sm font-semibold text-center text-zinc-200 line-clamp-2">{item.name}</span>
              </div>
            ) : (
              <DraggableThumbnail key={item.id} video={item} onClick={openPlayerMenu} />
            )
          ))}
          {items.length === 0 && (
            <div className="col-span-full py-20 text-center text-zinc-500">
              <p>Empty folder. Forward videos to your bot or create a new folder.</p>
            </div>
          )}
        </div>
      </DndContext>
    </div>
  );
}
