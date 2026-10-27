    import type { Character } from '../types/character';

    export interface ResponsiveImage {
        src: string;
        srcSet: string;
    }

    export function characterImage(c:Pick <Character, 'id'| 'image'>): ResponsiveImage | undefined {
        if(!c.image) return undefined
        const base = `/images/characters/${c.id}`;
        
        return {src: ` ${base}-320.webp`,srcSet: `${base}-320.webp 320w, ${base}-640.webp 640w`};
    }

     export const factionImage = (id:string) => `/images/faction/${id}-640.webp`;

            //  images/factions/${id}-640.webp (error, extension incompleta y error en plural)