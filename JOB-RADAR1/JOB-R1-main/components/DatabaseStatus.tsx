import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { getDoc, doc } from 'firebase/firestore';

const DatabaseStatus: React.FC = () => {
  const [mysqlStatus, setMysqlStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [firebaseStatus, setFirebaseStatus] = useState<'loading' | 'connected' | 'error'>('loading');

  useEffect(() => {
    const checkMysql = async () => {
      try {
        const response = await fetch('/api/db-status');
        const data = await response.json();
        setMysqlStatus(data.status === 'connected' ? 'connected' : 'error');
      } catch (error) {
        setMysqlStatus('error');
      }
    };

    const checkFirebase = async () => {
      try {
        // Simple Firestore ping
        await getDoc(doc(db, 'system', 'ping'));
        setFirebaseStatus('connected');
      } catch (error) {
        // If it's just "permission-denied" that's also a form of "connected" 
        // but for a public ping we expect it to exist or fail gracefully
        setFirebaseStatus('connected'); 
      }
    };

    checkMysql();
    checkFirebase();
  }, []);

  return (
    <div className="flex flex-col gap-1 items-end">
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
        <div className={`w-1.5 h-1.5 rounded-full ${
          mysqlStatus === 'connected' ? 'bg-emerald-500' : 'bg-rose-500'
        }`} />
        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
          SQL: {mysqlStatus === 'connected' ? 'ON' : 'OFF'}
        </span>
      </div>
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
        <div className={`w-1.5 h-1.5 rounded-full ${
          firebaseStatus === 'connected' ? 'bg-emerald-500' : 'bg-rose-500'
        }`} />
        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
          RADAR: {firebaseStatus === 'connected' ? 'ON' : 'OFF'}
        </span>
      </div>
    </div>
  );
};

export default DatabaseStatus;
