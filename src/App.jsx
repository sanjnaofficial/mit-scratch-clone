import React, { useState, useContext } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FaBars, FaTimes } from "react-icons/fa";

import BlockPalette from "./components/BlockPalette";
import Midarea from "./components/Midarea";
import ResultCanvas from "./components/ResultCanvas";
import { SpriteContext } from "./context/SpriteProvider";

function App() {
  const { currSprite } = useContext(SpriteContext);
  const [showPalette, setShowPalette] = useState(true);
  return (
    <DndProvider backend={HTML5Backend}>
      <main className="min-h-screen flex items-center justify-center bg-blue-100 p-6 relative">
        <button
          aria-label={showPalette ? "Hide block palette" : "Show block palette"}
          onClick={() => setShowPalette((v) => !v)}
          className="absolute top-4 left-4 z-50 p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          {showPalette ? <FaTimes /> : <FaBars />}
        </button>

        <section className="flex w-full h-full gap-6">
          <div
            className={`transition-all duration-500 overflow-hidden flex-shrink-0 ${
              showPalette ? "w-[320px]" : "w-0"
            }`}
          >
            <BlockPalette spriteId={currSprite} />
          </div>
          <Midarea spriteId={currSprite} />
          <ResultCanvas />
        </section>
      </main>
    </DndProvider>
  );
}

export default App;
