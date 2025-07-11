import React from "react";

interface ScoreLineProps {
  score: number; // 0–10
}

const ScoreLine: React.FC<ScoreLineProps> = ({ score }) => {
  const percent = Math.min(Math.max(score / 10, 0), 1) * 100;

  const getColor = (score: number) => {
    if (score >= 7) return "bg-green-500";
    if (score >= 4) return "bg-orange-400";
    return "bg-red-500";
  };

  return (
    <div className="relative w-[4rem] h-10 flex items-center justify-center">
      {/* linea grigia dietro */}
      <div className="absolute w-full h-1 bg-zinc-700 rounded"></div>

      {/* progress bar dietro */}
      <div
        className={`absolute h-1 ${getColor(score)} rounded`}
        style={{
          width: `${percent}%`,
          transition: "width 0.3s",
          left: 0,
        }}
      ></div>

      {/* numero sopra */}
      <div className="text-white bg-transparent  border border-white/45 text-center px-1 rounded-md z-10 backdrop-blur-[3px]">{score.toFixed(1)}</div>
    </div>
  );
};

export default ScoreLine;
