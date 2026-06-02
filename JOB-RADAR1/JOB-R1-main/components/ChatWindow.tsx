import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../services/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

interface ChatWindowProps {
  roomId: string;
  recipientName: string;
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ roomId, recipientName, onClose }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'rooms', roomId, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setMessages(msgs);
    }, (error) => {
      console.error("Chat messages snapshot error:", error);
    });
    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !auth.currentUser) return;
    
    try {
      // Ensure room exists first (normally handled by creation logic)
      await addDoc(collection(db, 'rooms', roomId, 'messages'), {
        senderId: auth.currentUser.uid,
        text: newMessage,
        timestamp: serverTimestamp()
      });
      
      // Update room metadata
      await setDoc(doc(db, 'rooms', roomId), {
        lastMessage: newMessage,
        updatedAt: serverTimestamp(),
        recipientName: recipientName // Added for better room indexing
      }, { merge: true });

      setNewMessage('');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed bottom-6 right-6 w-80 h-[450px] bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col z-[3000] overflow-hidden"
    >
      <header className="p-5 flex items-center justify-between border-b border-slate-50 dark:border-slate-800 bg-teal-500 text-white">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-white/20 flex items-center justify-center font-black">
            {recipientName[0]}
          </div>
          <p className="font-black text-xs tracking-tight uppercase">{recipientName}</p>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/20">
        {messages.map((m, i) => (
          <div key={m.id || i} className={`flex ${m.senderId === auth.currentUser?.uid ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-[11px] font-bold ${
              m.senderId === auth.currentUser?.uid 
                ? 'bg-teal-600 text-white rounded-br-none' 
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-none shadow-sm'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-50 dark:border-slate-800 flex gap-2">
        <input 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[11px] font-bold px-4 focus:ring-1 focus:ring-teal-500 dark:text-white"
        />
        <button 
          onClick={handleSend}
          className="w-10 h-10 bg-teal-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-teal-600/20 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-sm">send</span>
        </button>
      </div>
    </motion.div>
  );
};

export default ChatWindow;
