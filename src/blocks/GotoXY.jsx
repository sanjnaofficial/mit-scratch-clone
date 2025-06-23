import React, { useState, useContext, useEffect, useCallback } from "react";
import { SpriteContext } from "../context/SpriteProvider";
import { useDrag } from "react-dnd";

function GotoXY({ id, isDraggable = true }) {
  const { targetPosition = {}, setTarget } = useContext(SpriteContext);

  const DEFAULT = { x: 0, y: 0 };
  const initial = targetPosition[id] ?? DEFAULT;

  const [coords, setCoords] = useState(initial);

  useEffect(() => {
    setCoords(targetPosition[id] ?? DEFAULT);
  }, [targetPosition, id]);

  const sync = useCallback(
    (next) => setTarget?.(id, next.x, next.y),
    [id, setTarget]
  );

  const onChangeX = useCallback(
    (e) => {
      const value = Number(e.target.value);
      setCoords((c) => {
        const next = { ...c, x: value };
        sync(next);
        return next;
      });
    },
    [sync]
  );

  const onChangeY = useCallback(
    (e) => {
      const value = Number(e.target.value);
      setCoords((c) => {
        const next = { ...c, y: value };
        sync(next);
        return next;
      });
    },
    [sync]
  );

  const [{ isDragging }, dragRef] = useDrag({
    type: "component",
    item: { id: 6, type: "Goto" },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const { x, y } = coords;

  return (
    <div
      ref={isDraggable ? dragRef : null}
      style={{ wordBreak: "break-word" }}
      className={`w-full h-8 flex items-center justify-around px-2 bg-blue-500 text-white font-bold text-sm rounded transition-all duration-200 select-none cursor-pointer hover:shadow-md ${
        isDragging && isDraggable ? "opacity-40 scale-95" : "opacity-100"
      }`}
    >
      <span className="truncate">Goto X:</span>
      <input
        type="number"
        value={x}
        onChange={onChangeX}
        onClick={(e) => e.stopPropagation()}
        className="rounded-sm w-10 text-xs h-5 text-black px-1 border border-gray-300 focus:ring-1 focus:ring-blue-400 bg-white shadow-sm text-center mx-1"
      />
      <span className="truncate">Y:</span>
      <input
        type="number"
        value={y}
        onChange={onChangeY}
        onClick={(e) => e.stopPropagation()}
        className="rounded-sm w-10 text-xs h-5 text-black px-1 border border-gray-300 focus:ring-1 focus:ring-blue-400 bg-white shadow-sm text-center mx-1"
      />
    </div>
  );
}

export default GotoXY;
