import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  memo,
} from "react";
import { useDrag } from "react-dnd";
import { SpriteContext } from "../context/SpriteProvider";

function RotateBlock({ id, direction = "right", isDraggable = true }) {
  const {
    rotateACW = {},
    rotateCW = {},
    setRotationACW,
    setRotationCW,
  } = useContext(SpriteContext);

  const store = direction === "left" ? rotateACW : rotateCW;
  const setStore = direction === "left" ? setRotationACW : setRotationCW;

  const DEFAULT_DEG = 0;
  const [degrees, setDegrees] = useState(store[id] ?? DEFAULT_DEG);

  useEffect(() => {
    setDegrees(store[id] ?? DEFAULT_DEG);
  }, [store, id]);

  const handleChange = useCallback(
    (e) => {
      const next = Number(e.target.value);
      setDegrees(next);
      setStore?.(id, next);
    },
    [id, setStore]
  );

  const DRAG_META =
    direction === "left"
      ? { id: 4, type: "RotateLeft" }
      : { id: 3, type: "RotateRight" };

  const [{ isDragging }, dragRef] = useDrag({
    type: "component",
    item: DRAG_META,
    collect: (m) => ({ isDragging: m.isDragging() }),
  });

  const label = direction === "left" ? "Turn Left" : "Turn Right";

  return (
    <div
      ref={isDraggable ? dragRef : null}
      style={{ wordBreak: "break-word" }}
      className={`w-full h-8 flex items-center justify-between px-3 bg-blue-500 text-white font-bold text-sm rounded transition-all duration-200 select-none cursor-pointer hover:shadow-md ${
        isDragging && isDraggable ? "opacity-40 scale-95" : "opacity-100"
      }`}
    >
      <span className="truncate">{label}&nbsp;</span>
      <input
        type="number"
        value={degrees}
        onChange={handleChange}
        onClick={(e) => e.stopPropagation()}
        className="rounded-sm w-12 text-xs h-6 text-blue-900 px-1 border border-blue-200 focus:ring-1 focus:ring-blue-300 bg-white shadow-sm text-center"
      />
      <span className="ml-1">&nbsp;deg</span>
    </div>
  );
}

export default memo(RotateBlock);
