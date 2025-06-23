import React, { useContext, useCallback, memo } from "react";
import { SpriteContext } from "../context/SpriteProvider";

const LABEL_BY_TYPE = {
  8: "Say",
  9: "Think",
  10: "Say",
  11: "Think",
};

function Looks({ block, spriteId, isEditable }) {
  const { updateBlockValue } = useContext(SpriteContext);
  const { typeId, instanceId, value = "", time = 2 } = block;

  const handleValueChange = useCallback(
    (newValue) => updateBlockValue(spriteId, instanceId, newValue, time),
    [spriteId, instanceId, time, updateBlockValue]
  );

  const handleTimeChange = useCallback(
    (newTime) => updateBlockValue(spriteId, instanceId, value, newTime),
    [spriteId, instanceId, value, updateBlockValue]
  );

  const renderField = (content, onChange, className = "w-24") =>
    isEditable ? (
      <input
        type={typeof content === "number" ? "number" : "text"}
        value={content}
        onChange={(e) =>
          onChange(
            typeof content === "number"
              ? Number(e.target.value)
              : e.target.value
          )
        }
        className={`bg-white text-purple-700 rounded px-2 py-1 mx-1 text-xs outline-none ${className}`}
        min={typeof content === "number" ? 1 : undefined}
      />
    ) : (
      <span className="bg-white text-purple-700 rounded px-2 py-1 mx-1 text-xs">
        {content}
      </span>
    );

  return (
    <div
      className="w-full h-10 flex items-center justify-center bg-purple-500 text-white font-bold text-sm rounded transition-all duration-200 select-none cursor-pointer hover:shadow-md"
      style={{ wordBreak: "break-word" }}
    >
      <span className="px-2">{LABEL_BY_TYPE[typeId]}</span>
      {renderField(value, handleValueChange, typeId === 10 ? "w-16" : "w-24")}
      {(typeId === 10 || typeId === 11) && (
        <>
          <span className="px-2">for</span>
          {renderField(time, handleTimeChange, "w-10")}
          <span className="px-2">sec</span>
        </>
      )}
    </div>
  );
}

export default memo(Looks);
