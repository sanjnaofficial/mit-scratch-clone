import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  memo,
} from "react";
import { useDrag } from "react-dnd";
import { SpriteContext } from "../context/SpriteProvider";

function RepeatBlock({ id, isDraggable = true }) {
  const { repeat = {}, setRepeatCount } = useContext(SpriteContext);

  const DEFAULT_REPEAT = 1;
  const [count, setCount] = useState(repeat[id] ?? DEFAULT_REPEAT);

  useEffect(() => {
    setCount(repeat[id] ?? DEFAULT_REPEAT);
  }, [repeat, id]);

  const handleChange = useCallback(
    (e) => {
      const next = Math.max(0, Number(e.target.value));
      setCount(next);
      setRepeatCount?.(id, next);
    },
    [id, setRepeatCount]
  );

  const [{ isDragging }, dragRef] = useDrag({
    type: "component",
    item: { id: 5, type: "Repeat" },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  return (
    <div
      ref={isDraggable ? dragRef : null}
      style={{ wordBreak: "break-word" }}
      className={`w-full h-8 flex items-center justify-between px-3 bg-yellow-500 text-white font-bold text-sm rounded transition-all duration-200 select-none cursor-pointer hover:shadow-md ${
        isDragging && isDraggable ? "opacity-40 scale-95" : "opacity-100"
      }`}
    >
      <span className="truncate">Repeat</span>
      <input
        type="number"
        min={0}
        value={count}
        onChange={handleChange}
        onClick={(e) => e.stopPropagation()}
        className="rounded-sm w-12 text-xs h-6 text-black px-1 border border-gray-300 focus:ring-1 focus:ring-yellow-400 bg-white shadow-sm text-center mx-1"
      />
      <span className="truncate">times</span>
    </div>
  );
}

export default memo(RepeatBlock);
