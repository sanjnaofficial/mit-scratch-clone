import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  memo,
} from "react";
import { useDrag } from "react-dnd";
import { SpriteContext } from "../context/SpriteProvider";

function MoveAxis({ id, axis = "x", dragMeta, isDraggable = true }) {
  const {
    stepX = {},
    stepY = {},
    setStepInX,
    setStepInY,
  } = useContext(SpriteContext);

  const store = axis === "x" ? stepX : stepY;
  const setStore = axis === "x" ? setStepInX : setStepInY;

  const DEFAULT_STEP = 0;
  const [step, setStep] = useState(store[id] ?? DEFAULT_STEP);

  useEffect(() => {
    setStep(store[id] ?? DEFAULT_STEP);
  }, [store, id]);

  const handleChange = useCallback(
    (e) => {
      const next = Number(e.target.value);
      setStep(next);
      setStore?.(id, next);
    },
    [id, setStore]
  );

  const [{ isDragging }, dragRef] = useDrag({
    type: "component",
    item: dragMeta,
    collect: (m) => ({ isDragging: m.isDragging() }),
  });

  return (
    <div
      ref={isDraggable ? dragRef : null}
      style={{ wordBreak: "break-word" }}
      className={`w-full h-8 flex items-center justify-between px-3 bg-blue-500 text-white font-bold text-sm rounded transition-all duration-200 select-none cursor-pointer hover:shadow-md ${
        isDragging && isDraggable ? "opacity-40 scale-95" : "opacity-100"
      }`}
    >
      <span className="truncate">{`Move ${axis.toUpperCase()}`}&nbsp;</span>
      <input
        type="number"
        value={step}
        onChange={handleChange}
        onClick={(e) => e.stopPropagation()}
        className="rounded-sm w-12 text-xs h-6 text-blue-900 px-1 border border-blue-200 focus:ring-1 focus:ring-blue-300 bg-white shadow-sm text-center"
      />
    </div>
  );
}

export default memo(MoveAxis);
