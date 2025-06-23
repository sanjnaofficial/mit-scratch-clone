import React, { useCallback, useState, useEffect, createContext } from "react";
import { v4 as uuid } from "uuid";

export const SpriteContext = createContext();

function SpriteProvider(props) {
  const [spriteCount, setSpriteCount] = useState(0);
  const [currSprite, setCurrSprite] = useState(null);
  const [sprites, setSprites] = useState([]);

  const SPRITE_SIZE = 140;
  const [canvasRect, setCanvasRect] = useState({ width: 0, height: 0 });
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  const [scriptBlocks, setScriptBlocks] = useState({});
  const [stepX, setStepX] = useState({});
  const [stepY, setStepY] = useState({});
  const [targetPosition, setTargetPosition] = useState({});
  const [rotateCW, setRotateCW] = useState({}); //clockwise
  const [rotateACW, setRotateACW] = useState({}); //anticlockwise
  const [repeat, setRepeat] = useState({});
  const [waitDuration, setWaitDuration] = useState({});

  const [shouldRefreshPreview, setShouldRefreshPreview] = useState(true);
  const [swappedPairs, setSwappedPairs] = useState({});

  const togglePreviewRefresh = useCallback(() => {
    setShouldRefreshPreview((prev) => !prev);
  }, []);

  const addBlockstoScriptBlocks = (
    spriteId,
    typeId,
    value = undefined,
    time = undefined
  ) => {
    const instanceId = uuid();
    const block = { instanceId, typeId };
    if (value !== undefined) block.value = value;
    if (time !== undefined) block.time = time;
    setScriptBlocks((prev) => ({
      ...prev,
      [spriteId]: prev[spriteId] ? [...prev[spriteId], block] : [block],
    }));
  };

  const removeBlockFromScriptBlocks = (spriteId, instanceId) => {
    setScriptBlocks((prev) => ({
      ...prev,
      [spriteId]:
        prev[spriteId]?.filter((b) => b.instanceId !== instanceId) || [],
    }));
  };

  const setStepInX = (id, value) => {
    setStepX((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const setStepInY = (id, value) => {
    setStepY((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const setTarget = (id, x, y) => {
    setTargetPosition((prev) => ({
      ...prev,
      [id]: { x, y },
    }));
  };

  const setRotationCW = (id, value) => {
    setRotateCW((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const setRotationACW = (id, value) => {
    setRotateACW((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const setRepeatCount = (id, value) => {
    setRepeat((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const setWaitDurationValue = (id, seconds) => {
    setWaitDuration((prev) => ({
      ...prev,
      [id]: seconds,
    }));
  };

  const getCurrentSpriteValues = useCallback(
    (id) => {
      const currentSprite = sprites.find((sprite) => sprite.id === id);
      if (currentSprite) {
        togglePreviewRefresh();
        const { x, y } = currentSprite.position;
        console.log(x, y);
        return { x, y, rotation: currentSprite.angle };
      }
    },
    [sprites, togglePreviewRefresh]
  );

  const moveComponent = (spriteId, fromIndex, toIndex) => {
    setScriptBlocks((prevMidArrays) => {
      const midArrayForSprite = prevMidArrays[spriteId];
      if (
        !midArrayForSprite ||
        fromIndex < 0 ||
        fromIndex >= midArrayForSprite.length ||
        toIndex < 0 ||
        toIndex > midArrayForSprite.length
      ) {
        return prevMidArrays;
      }
      const updatedMidArray = [...midArrayForSprite];
      const [movedItem] = updatedMidArray.splice(fromIndex, 1);
      updatedMidArray.splice(toIndex, 0, movedItem);
      return { ...prevMidArrays, [spriteId]: updatedMidArray };
    });
  };

  const runAllSprites = async () => {
    const W = Math.max(canvasRect.width - SPRITE_SIZE, 0);
    const H = Math.max(canvasRect.height - SPRITE_SIZE, 0);
    const executions = sprites.map(async (sprite) => {
      const { id: spriteId } = sprite;
      const script = scriptBlocks[spriteId] || [];

      const repeatBlock = script.find((b) => b.typeId === 5);
      let repeatCount = repeatBlock ? repeat[repeatBlock.instanceId] || 1 : 1;

      for (let r = 0; r < repeatCount; r++) {
        for (const block of script) {
          if (block.typeId === 5) continue;

          if (block.typeId === 7) {
            const seconds = waitDuration[block.instanceId] ?? 1;
            await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
            continue;
          }

          await new Promise((resolve) => {
            setTimeout(() => {
              setSprites((prev) => {
                return prev.map((sprite) => {
                  if (sprite.id !== spriteId) return sprite;

                  switch (block.typeId) {
                    case 1: {
                      const step = stepX[block.instanceId] ?? 0;
                      return {
                        ...sprite,
                        position: {
                          ...sprite.position,
                          x: clamp(sprite.position.x + step, 0, W),
                        },
                      };
                    }
                    case 2: {
                      const step = stepY[block.instanceId] ?? 0;
                      return {
                        ...sprite,
                        position: {
                          ...sprite.position,
                          y: clamp(sprite.position.y + step, 0, H),
                        },
                      };
                    }
                    case 3: {
                      const deg = rotateCW[block.instanceId] ?? 0;
                      return {
                        ...sprite,
                        angle: sprite.angle + deg,
                      };
                    }
                    case 4: {
                      const deg = rotateACW[block.instanceId] ?? 0;
                      return {
                        ...sprite,
                        angle: sprite.angle - deg,
                      };
                    }
                    case 6: {
                      const { x = 0, y = 0 } =
                        targetPosition[block.instanceId] || {};
                      return {
                        ...sprite,
                        position: { x: clamp(x, 0, W), y: clamp(y, 0, H) },
                      };
                    }
                    case 8:
                    case 9:
                    case 10:
                    case 11: {
                      const isSay = block.typeId !== 9 && block.typeId !== 11;
                      const text = block.value || (isSay ? "Hello!" : "Hmm...");
                      const seconds = block.time || 2;
                      const bubbleType = isSay ? "say" : "think";

                      const updated = {
                        ...sprite,
                        bubble: { type: bubbleType, text },
                      };

                      setTimeout(() => {
                        setSprites((ps) =>
                          ps.map((sp) =>
                            sp.id === spriteId ? { ...sp, bubble: null } : sp
                          )
                        );
                      }, seconds * 1000);

                      return updated;
                    }
                    default:
                      return sprite;
                  }
                });
              });
              resolve();
            }, 500);
          });
        }
      }
    });

    await Promise.all(executions);
  };

  const swapIfCollision = (currentSprites) => {
    const snapshot = [...currentSprites];
    let newSwaps = null;

    for (let i = 0; i < snapshot.length; i++) {
      for (let j = i + 1; j < snapshot.length; j++) {
        const a = snapshot[i];
        const b = snapshot[j];
        if (!a.position || !b.position) {
          continue;
        }

        const pairKey = [a.id, b.id].sort().join("-");
        const distance = Math.hypot(
          a.position.x - b.position.x,
          a.position.y - b.position.y
        );

        if (distance <= 80 && !swappedPairs[pairKey]) {
          setScriptBlocks((prev) => {
            const next = { ...prev };
            const tmp = next[a.id] || [];
            next[a.id] = next[b.id] || [];
            next[b.id] = tmp;
            return next;
          });
          if (!newSwaps) newSwaps = { ...swappedPairs };
          newSwaps[pairKey] = true;
        } else if (distance > 80 && swappedPairs[pairKey]) {
          if (!newSwaps) newSwaps = { ...swappedPairs };
          delete newSwaps[pairKey];
        }
      }
    }
    if (newSwaps) {
      setSwappedPairs(newSwaps);
    }
  };

  useEffect(() => {
    swapIfCollision(sprites);
    console.log(sprites);
  }, [sprites]);

  const updateBlockValue = (spriteId, instanceId, newValue, newTime) => {
    setScriptBlocks((prevMidArrays) => {
      const updatedArray = (prevMidArrays[spriteId] || []).map((block) => {
        if (block.instanceId === instanceId) {
          return {
            ...block,
            value: newValue !== undefined ? newValue : block.value,
            time: newTime !== undefined ? newTime : block.time,
          };
        }
        return block;
      });
      return { ...prevMidArrays, [spriteId]: updatedArray };
    });
  };

  const value = {
    spriteCount,
    setSpriteCount,
    currSprite,
    setCurrSprite,
    sprites,
    setSprites,

    scriptBlocks,
    addBlockstoScriptBlocks,
    removeBlockFromScriptBlocks,

    stepX,
    setStepInX,
    stepY,
    setStepInY,
    setRotationCW,
    rotateCW,
    setRotationACW,
    rotateACW,
    targetPosition,
    setTarget,

    repeat,
    setRepeatCount,
    waitDuration,
    setWaitDurationValue,

    getCurrentSpriteValues,
    shouldRefreshPreview,
    moveComponent,
    runAllSprites,
    updateBlockValue,
    canvasRect,
    setCanvasRect,
  };
  return (
    <SpriteContext.Provider value={value}>
      {props.children}
    </SpriteContext.Provider>
  );
}

export default SpriteProvider;
