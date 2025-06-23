import React, { useState, memo } from "react";
import { useDrag } from "react-dnd";

const ItemType = { COMPONENT: "component" };

const PALETTE = [
  {
    name: "Motion",
    color: "bg-blue-500",
    blocks: [
      { id: 1, name: "Move X" },
      { id: 2, name: "Move Y" },
      { id: 3, name: "Turn Right" },
      { id: 4, name: "Turn Left" },
      { id: 6, name: "Go to X , Y" },
    ],
  },
  {
    name: "Looks",
    color: "bg-purple-500",
    blocks: [
      { id: 8, name: "Say <text>" },
      { id: 9, name: "Think <text>" },
      { id: 10, name: "Say <text> for <time> sec" },
      { id: 11, name: "Think <text> for <time> sec" },
    ],
  },
  {
    name: "Event",
    color: "bg-yellow-500",
    blocks: [
      { id: 5, name: "Repeat n times" },
      { id: 7, name: "Wait n Sec" },
    ],
  },
];

const Block = memo(function Block({ section, block }) {
  const [text, setText] = useState("");
  const [time, setTime] = useState(2);

  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: ItemType.COMPONENT,
      item:
        section.name === "Looks"
          ? block.id === 10
            ? { id: block.id, value: text, time }
            : { id: block.id, value: text }
          : { id: block.id },
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }),
    [block.id, section.name, text, time]
  );

  const wrapperCls = `w-full ${
    section.name === "Looks" ? "h-10" : "h-8"
  } flex items-center
     justify-center ${section.color} text-white font-bold text-sm rounded
     transition-all duration-200 select-none cursor-pointer hover:shadow-md
     ${isDragging ? "opacity-40 scale-95" : "opacity-100"}`;

  const renderLooksContent = () => {
    switch (block.id) {
      case 8: // Say <text>
        return (
          <>
            <span className="px-2">Say</span>
            <input
              className="ml-2 px-2 py-1 rounded text-gray-800 text-xs w-20 outline-none"
              placeholder="text..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </>
        );
      case 9: // Think <text>
        return (
          <>
            <span className="px-2">Think</span>
            <input
              className="ml-2 px-2 py-1 rounded text-gray-800 text-xs w-20 outline-none"
              placeholder="text..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </>
        );
      case 10: // Say <text> for <time> sec
        return (
          <>
            <span className="px-2">Say</span>
            <input
              className="ml-2 px-2 py-1 rounded text-gray-800 text-xs w-16 outline-none"
              placeholder="text..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            <span className="px-2">for</span>
            <input
              type="number"
              min={1}
              className="ml-2 px-2 py-1 rounded text-gray-800 text-xs w-10 outline-none"
              value={time}
              onChange={(e) => setTime(+e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            <span className="px-2">sec</span>
          </>
        );
      case 11: // Think <text> for <time> sec
        return (
          <>
            <span className="px-2">Think</span>
            <input
              className="ml-2 px-2 py-1 rounded text-gray-800 text-xs w-16 outline-none"
              placeholder="text..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            <span className="px-2">for</span>
            <input
              type="number"
              min={1}
              className="ml-2 px-2 py-1 rounded text-gray-800 text-xs w-10 outline-none"
              value={time}
              onChange={(e) => setTime(+e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            <span className="px-2">sec</span>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={dragRef}
      className={wrapperCls}
      style={{ wordBreak: "break-word" }}
    >
      {section.name === "Looks" ? (
        renderLooksContent()
      ) : (
        <div className="w-full text-center truncate px-2">{block.name}</div>
      )}
    </div>
  );
});

function BlockPalette() {
  return (
    <div className="min-h-full w-[320px] flex flex-col p-4 bg-black rounded-2xl border border-[#2e2e4d]">
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
        {PALETTE.map((section) => (
          <div key={section.name}>
            <h2 className="text-base font-bold tracking-wide mb-3 px-2 text-white">
              {section.name}
            </h2>
            <div className="space-y-3">
              {section.blocks.map((block) => (
                <Block key={block.id} section={section} block={block} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BlockPalette;
