import React, { useCallback, useContext, useMemo, useState } from "react";
import { SpriteContext } from "../context/SpriteProvider";
import MoveAxis from "../blocks/MoveAxis";
import RotateBlock from "../blocks/RotateBlock";
import RepeatBlock from "../blocks/RepeatBlock";
import GotoXY from "../blocks/GotoXY";
import WaitBlock from "../blocks/WaitBlock";
import Looks from "../blocks/Looks";
import { useDrop, useDrag } from "react-dnd";

const COMPONENT_MAP = {
  1: MoveAxis,
  2: MoveAxis,
  3: RotateBlock,
  4: RotateBlock,
  5: RepeatBlock,
  6: GotoXY,
  7: WaitBlock,
  8: Looks,
  9: Looks,
  10: Looks,
  11: Looks,
};

const updateOne = (sprites, id, fn) =>
  sprites.map((s) => (s.id === id ? fn(s) : s));

const DraggableMidAreaBlock = React.memo(
  ({ block, spriteId, index, children, onDelete }) => {
    const [{ isDragging }, drag] = useDrag(
      () => ({
        type: "midarea-component",
        item: {
          instanceId: block.instanceId,
          typeId: block.typeId,
          originalIndex: index,
          spriteId,
        },
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
      }),
      [block, spriteId, index]
    );

    return (
      <div
        ref={drag}
        className={`relative w-full max-w-[330px] mx-auto group ${
          isDragging ? "opacity-50" : "opacity-100"
        }`}
      >
        <button
          onClick={() => onDelete(spriteId, block.instanceId)}
          className="absolute -right-2 -top-2 w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-opacity"
          title="Delete block"
        >
          ×
        </button>
        {children}
      </div>
    );
  }
);

export default function Midarea({ spriteId }) {
  const {
    scriptBlocks,
    stepX,
    stepY,
    rotateCW,
    rotateACW,
    repeat,
    setSprites,
    addBlockstoScriptBlocks,
    removeBlockFromScriptBlocks,
    moveComponent,
    waitDuration,
    targetPosition,
  } = useContext(SpriteContext);

  const midarray = useMemo(
    () => scriptBlocks[spriteId] || [],
    [scriptBlocks, spriteId]
  );
  const [pressed, setPressed] = useState({});

  const mutateSprite = useCallback(
    (updater) =>
      setSprites((prev) =>
        updateOne(prev, spriteId, (s) => ({ ...s, ...updater(s) }))
      ),
    [spriteId, setSprites]
  );

  const flashBtn = useCallback((key) => {
    setPressed((p) => ({ ...p, [key]: true }));
    setTimeout(() => setPressed((p) => ({ ...p, [key]: false })), 200);
  }, []);

  const resetSprite = useCallback(
    () => mutateSprite(() => ({ position: { x: 0, y: 0 }, angle: 0 })),
    [mutateSprite]
  );

  const handleRun = useCallback(async () => {
    const script = midarray;
    const repeatBlock = script.find((b) => b.typeId === 5);
    const loops =
      repeatBlock && repeat?.[repeatBlock.instanceId]
        ? repeat[repeatBlock.instanceId]
        : 1;

    const OPERATIONS = {
      1: (blk, sp) => ({
        position: {
          ...sp.position,
          x: (sp.position?.x || 0) + (stepX?.[blk.instanceId] ?? 0),
        },
      }),
      2: (blk, sp) => ({
        position: {
          ...sp.position,
          y: (sp.position?.y || 0) + (stepY?.[blk.instanceId] ?? 0),
        },
      }),
      3: (blk, sp) => ({
        angle:
          (sp.angle || 0) +
          (rotateCW?.[blk.instanceId] ?? rotateCW[spriteId] ?? 0),
      }),
      4: (blk, sp) => ({
        angle:
          (sp.angle || 0) -
          (rotateACW?.[blk.instanceId] ?? rotateACW[spriteId] ?? 0),
      }),
      6: (blk) => ({
        position: targetPosition?.[blk.instanceId] ?? { x: 0, y: 0 },
      }),
      8: (blk) => ({ bubble: { type: "say", text: blk.value || "Hello!" } }),
      9: (blk) => ({ bubble: { type: "think", text: blk.value || "Hmm..." } }),
      10: (blk) => ({
        bubble: { type: "say", text: blk.value || "Hi!", time: blk.time || 2 },
      }),
      11: (blk) => ({
        bubble: {
          type: "think",
          text: blk.value || "Hmmm...",
          time: blk.time || 2,
        },
      }),
    };

    for (let i = 0; i < loops; i++) {
      for (const blk of script) {
        if (blk.typeId === 5) continue;
        if (blk.typeId === 7) {
          await new Promise((r) =>
            setTimeout(r, (waitDuration?.[blk.instanceId] ?? 1) * 1000)
          );
          continue;
        }
        mutateSprite((sp) => OPERATIONS[blk.typeId]?.(blk, sp) || {});
        await new Promise((r) => setTimeout(r, 200));
      }
    }
  }, [
    midarray,
    repeat,
    mutateSprite,
    targetPosition,
    spriteId,
    rotateACW,
    rotateCW,
    stepX,
    stepY,
    waitDuration,
  ]);

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "component",
      drop: (item) =>
        addBlockstoScriptBlocks(spriteId, item.id, item.value, item.time),
      collect: (monitor) => ({ isOver: monitor.isOver() }),
    }),
    [spriteId, addBlockstoScriptBlocks]
  );

  const [, dropForReorder] = useDrop(
    () => ({
      accept: "midarea-component",
      hover: (dragItem, monitor) => {
        const dragIdx = midarray.findIndex(
          (b) => b.instanceId === dragItem.instanceId
        );
        const hoverY = monitor.getClientOffset()?.y ?? 0;
        const hoverIdx = Math.floor(hoverY / 50);
        if (dragIdx > -1 && dragIdx !== hoverIdx)
          moveComponent(spriteId, dragIdx, hoverIdx);
      },
    }),
    [midarray, moveComponent, spriteId]
  );

  return (
    <div className="w-full md:w-[60%] min-h-full p-6 bg-gradient-to-br bg-black rounded-2xl border border-[#2e2e4d] shadow-2xl flex flex-col gap-6">
      <div
        ref={(node) => drop(dropForReorder(node))}
        className={`w-full min-h-[70vh] bg-white backdrop-blur-md rounded-xl border-2 ${
          isOver ? "border-blue-500" : "border-gray-600"
        } flex flex-col gap-3 px-6 py-8 overflow-auto`}
      >
        {midarray.length === 0 && (
          <div className="text-center text-gray-400">
            🧊 Drop blocks here to build logic
          </div>
        )}
        {midarray.map((blk, idx) => {
          const Comp = COMPONENT_MAP[blk.typeId];
          if (!Comp) return null;
          let special = {};
          switch (blk.typeId) {
            case 1:
              special = { axis: "x" };
              break;
            case 2:
              special = { axis: "y" };
              break;
            case 3:
              special = { direction: "right" };
              break;
            case 4:
              special = { direction: "left" };
              break;
            default:
          }

          return (
            <DraggableMidAreaBlock
              key={blk.instanceId}
              block={blk}
              spriteId={spriteId}
              index={idx}
              onDelete={removeBlockFromScriptBlocks}
            >
              {blk.typeId >= 8 ? (
                <Looks block={blk} spriteId={spriteId} isEditable />
              ) : (
                <Comp
                  id={blk.instanceId}
                  spriteId={spriteId}
                  isDraggable={false}
                  {...special}
                />
              )}
            </DraggableMidAreaBlock>
          );
        })}
      </div>

      <div className="flex gap-4 justify-center">
        <button
          onClick={() => {
            flashBtn("reset");
            resetSprite();
          }}
          className={`px-6 py-3 rounded-lg bg-gray-700 text-white font-semibold shadow-lg hover:bg-gray-600 transition-all ${
            pressed.reset ? "scale-90" : ""
          }`}
        >
          ⟳
        </button>
        <button
          onClick={() => {
            flashBtn("run");
            handleRun();
          }}
          className={`px-6 py-3 rounded-lg bg-blue-500 text-white font-semibold shadow-lg hover:bg-blue-600 transition-all ${
            pressed.run ? "scale-90" : ""
          }`}
        >
          ▶ play
        </button>
      </div>
    </div>
  );
}
