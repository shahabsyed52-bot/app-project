export interface Video {
  id: string;
  title: string;
  youtubeId: string;
  category: string;
  artist: string;
  year: number;
  description?: string;
}

export const CATS = [
  { id: "nadeem-sarwar", name: "Nadeem Sarwar" },
  { id: "mir-hasan-mir", name: "Mir Hasan Mir" },
  { id: "ali-shanawar",  name: "Ali Shanawar"  },
  { id: "shadman-raza",  name: "Shadman Raza"  },
  { id: "manqabat",      name: "Manqabat"      },
  { id: "majlis",        name: "Majlis"         },
];

export const initialVideos: Video[] = [
  { id:"1",  title:"Aye Zainab",         youtubeId:"aXkqPNkKFfM", category:"nadeem-sarwar", artist:"Nadeem Sarwar", year:2023 },
  { id:"2",  title:"Ya Hussain",          youtubeId:"b5INxKaE3zU", category:"nadeem-sarwar", artist:"Nadeem Sarwar", year:2022 },
  { id:"3",  title:"Mera Imam",           youtubeId:"0cTxJeFBuoU", category:"nadeem-sarwar", artist:"Nadeem Sarwar", year:2022 },
  { id:"4",  title:"Woh Karbala Gaye",   youtubeId:"1hJfSPBgpnk", category:"mir-hasan-mir", artist:"Mir Hasan Mir", year:2023 },
  { id:"5",  title:"Ali Ali",             youtubeId:"ygT5kCKxd8o", category:"mir-hasan-mir", artist:"Mir Hasan Mir", year:2022 },
  { id:"6",  title:"Mola Hussain",        youtubeId:"LDU_Txk06tM", category:"ali-shanawar",  artist:"Ali Shanawar",  year:2023 },
  { id:"7",  title:"Ya Ali Madad",        youtubeId:"mGNtkdSLaA0", category:"shadman-raza",  artist:"Shadman Raza",  year:2023 },
  { id:"8",  title:"Manqabat Imam Ali",   youtubeId:"YkgkThdzX-8", category:"manqabat",      artist:"Various",       year:2023 },
  { id:"9",  title:"Mola Ali Manqabat",   youtubeId:"5rBRFB62Hkk", category:"manqabat",      artist:"Various",       year:2022 },
  { id:"10", title:"Majlis e Aza",        youtubeId:"HvELBwf-sY8", category:"majlis",         artist:"Molana Sahab",  year:2023 },
];
