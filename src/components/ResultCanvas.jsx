import React, {
  useContext,
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  memo,
} from "react";
import { SpriteContext } from "../context/SpriteProvider";

const SPRITEOPTIONS = [
  {
    name: "Tom",
    src: "https://en.scratch-wiki.info/w/images/ScratchCat3.0.svg",
  },
  {
    name: "Ballerina",
    src: "https://cdn.assets.scratch.mit.edu/internalapi/asset/5197d3778baf55da6b81b3ada1e10021.svg/get/",
  },
  {
    name: "Bat",
    src: "https://cdn.assets.scratch.mit.edu/internalapi/asset/4e4ced87ed37ee66c758bba077e0eae6.svg/get/",
  },
  {
    name: "Ben",
    src: "https://cdn.assets.scratch.mit.edu/internalapi/asset/2cd77b8a9961e7ad4da905e7731b7c1b.svg/get/",
  },
  {
    name: "Apple",
    src: "https://cdn.assets.scratch.mit.edu/internalapi/asset/3826a4091a33e4d26f87a2fac7cf796b.svg/get/",
  },
];

const ToggleButton = memo(function ToggleButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-colors duration-150 flex items-center gap-1 ${
        active
          ? "bg-blue-700 border-blue-500 text-white"
          : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
      }`}
    >
      {children}
    </button>
  );
});

const SpriteImage = React.memo(
  ({ sprite, onMouseDown, isActive, dragStyle }) => {
    return (
      <img
        key={sprite.id}
        src={sprite.src}
        alt={`Sprite ${sprite.id}`}
        className={`cursor-${
          isActive ? "grabbing" : "grab"
        } select-none transition-transform duration-200 bg-transparent hover:scale-105 ${
          isActive ? "ring-2 ring-blue-400" : ""
        }`}
        style={{
          position: "absolute",
          width: "100px",
          height: "100px",
          left: dragStyle?.x ?? sprite.position.x,
          top: dragStyle?.y ?? sprite.position.y,
          transform: `rotate(${isNaN(sprite.angle) ? 0 : sprite.angle}deg)`,
        }}
        onMouseDown={(e) => onMouseDown(e, sprite)}
        draggable={false}
      />
    );
  }
);

function ResultCanvas() {
  const {
    setSpriteCount,
    currSprite,
    setCurrSprite,
    sprites,
    setSprites,
    runAllSprites,
    setCanvasRect,
  } = useContext(SpriteContext);

  const [activeImg, setActiveImg] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const resultRef = useRef(null);
  const [clickedButton, setClickedButton] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [draggedSpriteId, setDraggedSpriteId] = useState(null);
  const dragPosRef = useRef({ x: 0, y: 0 });
  const [dragStyle, setDragStyle] = useState(null);

  const [selectedImage, setSelectedImage] = useState(SPRITEOPTIONS[0].src);

  const addSprite = () => {
    const newSprite = {
      id: `draggable-${sprites.length + 1}`,
      src: selectedImage,
      position: { x: 0, y: 0 },
      angle: 0,
    };

    setSprites((prevSprites) => [...prevSprites, newSprite]);
    setSpriteCount((prevCount) => prevCount + 1);
    setCurrSprite(newSprite.id);
    setClickedButton("addSprite");
    setTimeout(() => setClickedButton(null), 300);
  };

  const removeSprite = () => {
    if (currSprite) {
      const updatedSprites = sprites.filter(
        (sprite) => sprite.id !== currSprite
      );
      setSprites(updatedSprites);
      setCurrSprite(updatedSprites.length > 0 ? updatedSprites[0].id : null);
      setClickedButton("removeSprite");
      setTimeout(() => setClickedButton(null), 300);
    }
  };

  const handleMouseDown = (e, sprite) => {
    e.preventDefault();
    setActiveImg(sprite);
    setDraggedSpriteId(sprite.id);
    setDragging(true);
    const previewRect = resultRef.current.getBoundingClientRect();
    const offsetX = e.clientX - previewRect.left - sprite.position.x;
    const offsetY = e.clientY - previewRect.top - sprite.position.y;
    setOffset({ x: offsetX, y: offsetY });
    dragPosRef.current = { x: sprite.position.x, y: sprite.position.y };
    setDragStyle({ x: sprite.position.x, y: sprite.position.y });
  };

  const handleMouseMove = (e) => {
    if (!dragging || !activeImg) return;
    const previewRect = resultRef.current.getBoundingClientRect();
    const newX = e.clientX - previewRect.left - offset.x;
    const newY = e.clientY - previewRect.top - offset.y;
    const boundedX = Math.max(0, Math.min(newX, previewRect.width - 100));
    const boundedY = Math.max(0, Math.min(newY, previewRect.height - 100));
    dragPosRef.current = { x: boundedX, y: boundedY };
    setDragStyle({ x: boundedX, y: boundedY });
  };

  const handleMouseUp = () => {
    if (dragging && activeImg) {
      setSprites((prevSprites) =>
        prevSprites.map((sprite) =>
          sprite.id === activeImg.id
            ? { ...sprite, position: { ...dragPosRef.current } }
            : sprite
        )
      );
    }
    setDragging(false);
    setActiveImg(null);
    setDraggedSpriteId(null);
    setDragStyle(null);
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "move";
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
    };
  }, [dragging, activeImg]);

  useLayoutEffect(() => {
    const measure = () => {
      if (resultRef.current) {
        const { width, height } = resultRef.current.getBoundingClientRect();
        setCanvasRect({ width, height });
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [setCanvasRect]);

  return (
    <div
      ref={resultRef}
      className="w-full md:w-* min-h-full overflow-auto bg-black border border-gray-800 rounded-xl shadow-lg py-8 px-8 relative text-gray-100 flex flex-col transition-all duration-300"
    >
      <div className="relative flex-1 w-full min-h-[300px] flex items-center justify-center rounded-xl shadow-inner border border-gray-800 bg-gradient-to-br bg-white mb-2">
        {sprites.map((sprite) => (
          <React.Fragment key={sprite.id}>
            {sprite.bubble && (
              <div
                className={
                  sprite.bubble.type === "think" ? "animate-bounce" : ""
                }
                style={{
                  position: "absolute",
                  left: (sprite.position.x ?? 0) + 50,
                  top: (sprite.position.y ?? 0) - 40,
                  zIndex: 10,
                  minWidth: 60,
                  maxWidth: 160,
                  padding: "6px 14px",
                  borderRadius: sprite.bubble.type === "think" ? 20 : 16,
                  background:
                    sprite.bubble.type === "think" ? "white" : "#181a20",
                  color: "#b3caff",
                  border: "1px solid #334155",
                  boxShadow: "0 2px 8px rgba(30,64,175,0.08)",
                  fontStyle:
                    sprite.bubble.type === "think" ? "italic" : "normal",
                  fontSize: 15,
                  textAlign: "center",
                  pointerEvents: "none",
                }}
              >
                {sprite.bubble.text}
              </div>
            )}
            <SpriteImage
              sprite={sprite}
              onMouseDown={handleMouseDown}
              isActive={dragging && draggedSpriteId === sprite.id}
              dragStyle={
                dragging && draggedSpriteId === sprite.id
                  ? dragPosRef.current
                  : null
              }
            />
          </React.Fragment>
        ))}
      </div>
      <div className="flex flex-wrap gap-4 mb-6 justify-between items-center w-full">
        <button
          className={`flex-1 min-w-[100px] bg-blue-900 hover:bg-blue-800 text-blue-300 font-semibold rounded-lg p-3 shadow-md transition-all duration-200 text-center flex items-center justify-center gap-2 text-base ${
            clickedButton === "runAllSprites" ? "scale-95" : ""
          }`}
          onClick={() => {
            runAllSprites();
            setClickedButton("runAllSprites");
            setTimeout(() => setClickedButton(null), 300);
          }}
        >
          ▶ Play All
        </button>
        <button
          onClick={addSprite}
          className={`flex-1 min-w-[100px] p-3 bg-green-700 hover:bg-green-600 text-gray-100 rounded-lg font-semibold shadow-md transition-all duration-200 text-center flex items-center justify-center gap-2 text-base ${
            clickedButton === "addSprite" ? "scale-95" : ""
          }`}
        >
          + Sprite
        </button>

        <button
          onClick={removeSprite}
          className={`cursor-pointer flex-1 min-w-[100px] p-3 bg-red-800 hover:bg-gray-700 text-white rounded-lg font-semibold shadow-md transition-all duration-200 text-center flex items-center justify-center gap-2 text-base ${
            clickedButton === "removeSprite" ? "scale-95" : ""
          }`}
          disabled={!currSprite}
        >
          🗑 Sprite
        </button>
      </div>

      <div className="flex flex-col gap-4 mb-4 w-full">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-gray-300 mr-2">
            Active Sprite:
          </span>
          {sprites.length === 0 && (
            <span className="text-sm text-gray-500">No sprites yet</span>
          )}
          {sprites.map((sprite, idx) => {
            const opt = SPRITEOPTIONS.find((o) => o.src === sprite.src);
            const label = opt ? opt.name : `Sprite ${idx + 1}`;
            return (
              <ToggleButton
                key={sprite.id}
                active={currSprite === sprite.id}
                onClick={() => setCurrSprite(sprite.id)}
              >
                {label}
              </ToggleButton>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-gray-300 mr-2">
            Sprite Asset:
          </span>
          {SPRITEOPTIONS.map((opt) => (
            <ToggleButton
              key={opt.src}
              active={selectedImage === opt.src}
              onClick={() => setSelectedImage(opt.src)}
            >
              <img src={opt.src} alt={opt.name} className="w-5 h-5" />
              {opt.name}
            </ToggleButton>
          ))}
        </div>
      </div>
      <div className="flex justify-between items-start mb-4 w-full">
        {currSprite && sprites.find((s) => s.id === currSprite) && (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-blue-300">
              x:
              {Math.round(sprites.find((s) => s.id === currSprite).position.x)}
            </span>
            <span className="text-sm font-medium text-blue-300">
              y:
              {Math.round(sprites.find((s) => s.id === currSprite).position.y)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultCanvas;
