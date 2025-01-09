import { create } from "zustand";


type pushStoreState = {
    pushToken: string | null;
    email: string | null;
    url: string | null
} 
type pushStoreActions = {
    setPushToken: (token: string | null) => void;
    setEmail: (email: string | null) => void;
    setUrl: (url: string | null) => void;
} 

type pushStore = pushStoreState & pushStoreActions

export const usePushStore = create<pushStore>(
      (set) => ({
        pushToken: "",
        email: "",
        url: null,
        setUrl: (data: string | null) => set((state) => ({...state, url: data })),
        setEmail: (data: string | null) => set((state) => ({...state, email: data })),
        setPushToken: (data:string | null) => set((state) => ({ ...state, pushToken: data })),
      })
  );