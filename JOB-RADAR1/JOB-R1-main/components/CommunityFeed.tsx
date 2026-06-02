
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '../services/firebase';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, increment } from 'firebase/firestore';

interface FeedPost {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  content: string;
  location: string;
  timestamp: any;
  likes: number;
}

const CommunityFeed: React.FC = () => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'community_posts'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbPosts = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as FeedPost));
      setPosts(dbPosts);
      setLoading(false);
    }, (error) => {
      console.error("Community Feed snapshot error:", error);
    });
    return () => unsubscribe();
  }, []);

  const handlePost = async () => {
    if (!newPost.trim() || !auth.currentUser) return;
    
    try {
      await addDoc(collection(db, 'community_posts'), {
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Anonymous',
        userRole: 'Seeker', // Fetch from profile later
        content: newPost,
        location: 'Chennai Hub',
        timestamp: serverTimestamp(),
        likes: 0
      });
      setNewPost('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleLike = async (postId: string) => {
    const postRef = doc(db, 'community_posts', postId);
    await updateDoc(postRef, {
      likes: increment(1)
    });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
           <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Community Pulse</h1>
           <p className="text-sm font-bold text-slate-500 uppercase tracking-widest leading-none mt-2">Connecting Chennai's tech neighborhood.</p>
        </div>

        {auth.currentUser && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm mb-8">
             <textarea
               value={newPost}
               onChange={(e) => setNewPost(e.target.value)}
               placeholder="What's happening in your hub?"
               className="w-full h-24 bg-transparent resize-none border-none focus:ring-0 text-sm font-bold dark:text-white"
             />
             <div className="flex items-center justify-between mt-4 border-t border-slate-50 dark:border-slate-800 pt-4">
                <div className="flex gap-2">
                   <button className="p-2 text-slate-400 hover:text-teal-600 transition-colors"><span className="material-symbols-outlined">image</span></button>
                   <button className="p-2 text-slate-400 hover:text-teal-600 transition-colors"><span className="material-symbols-outlined">alternate_email</span></button>
                </div>
                <button 
                  onClick={handlePost}
                  className="bg-teal-600 text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-teal-600/20 active:scale-95 transition-all"
                >
                  Post Update
                </button>
             </div>
          </div>
        )}

        <div className="space-y-6">
           <AnimatePresence>
             {posts.map(post => (
               <motion.div 
                 key={post.id}
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm"
               >
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-400">{post.userRole === 'Employer' ? 'apartment' : 'person'}</span>
                     </div>
                     <div>
                        <div className="flex items-center gap-2">
                           <h4 className="font-black text-slate-900 dark:text-white">{post.userName}</h4>
                           <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${post.userRole === 'Employer' ? 'bg-amber-50 text-amber-600' : 'bg-teal-50 text-teal-600'}`}>{post.userRole}</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{post.location} • {post.timestamp?.toDate ? post.timestamp.toDate().toLocaleTimeString() : 'Just now'}</p>
                     </div>
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed mb-6 italic">{post.content}</p>
                  <div className="flex items-center gap-6 border-t border-slate-50 dark:border-slate-800 pt-6">
                     <button 
                       onClick={() => handleLike(post.id)}
                       className="flex items-center gap-2 text-slate-400 hover:text-rose-500 transition-all font-bold text-xs group"
                     >
                        <span className="material-symbols-outlined text-lg group-hover:scale-110">favorite</span>
                        {post.likes} Pulse
                     </button>
                     <button className="flex items-center gap-2 text-slate-400 hover:text-teal-500 transition-all font-bold text-xs group">
                        <span className="material-symbols-outlined text-lg group-hover:scale-110">chat_bubble</span>
                        Direct Chat
                     </button>
                  </div>
               </motion.div>
             ))}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CommunityFeed;
