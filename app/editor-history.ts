'use client';
import {useRef,useState} from 'react';
import type {DesignConfig} from './catalog';
import type {Photo} from './calendar';
type Snapshot={config:DesignConfig;photos:(Photo|undefined)[]};
export function useEditorHistory(initial:DesignConfig){
 const [snapshot,setSnapshot]=useState<Snapshot>({config:initial,photos:Array(13).fill(undefined)}),current=useRef(snapshot),past=useRef<Snapshot[]>([]),future=useRef<Snapshot[]>([]),last=useRef(0),[revision,setRevision]=useState(0);
 function update(next:Snapshot,group=true){const now=Date.now();if(!group||now-last.current>450){past.current=[...past.current.slice(-39),current.current];}last.current=now;future.current=[];current.current=next;setSnapshot(next);setRevision(n=>n+1);}
 function setConfig(action:React.SetStateAction<DesignConfig>){update({...current.current,config:typeof action==='function'?action(current.current.config):action});}
 function setPhotos(action:React.SetStateAction<(Photo|undefined)[]>){update({...current.current,photos:typeof action==='function'?action(current.current.photos):action});}
 function restore(next:Snapshot){past.current=[];future.current=[];last.current=0;current.current=next;setSnapshot(next);setRevision(n=>n+1);}
 function undo(){const prev=past.current.pop();if(!prev)return;future.current.push(current.current);current.current=prev;setSnapshot(prev);last.current=0;setRevision(n=>n+1);}
 function redo(){const next=future.current.pop();if(!next)return;past.current.push(current.current);current.current=next;setSnapshot(next);last.current=0;setRevision(n=>n+1);}
 return{...snapshot,setConfig,setPhotos,restore,undo,redo,canUndo:past.current.length>0,canRedo:future.current.length>0,revision};
}
