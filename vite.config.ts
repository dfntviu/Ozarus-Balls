import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // configuracion establecido, previo a construir el fanart-project
  build: {
    rollupOptions:{
      output:{
        manualChunks(id){
          if (id.includes('src/data/characters') && id.endsWith('stats.json')) return 'characters-data'  
            return undefined;          
          },
      },
    },
  },
});
