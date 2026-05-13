"use client";

import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";

export default function Home() {
  const board = [
  { name: "시작", price: 0 },

  { name: "서울", price: 100 },
  { name: "도쿄", price: 120 },
  { name: "베이징", price: 140 },

  { name: "이벤트", price: 0 },

  { name: "방콕", price: 160 },
  { name: "싱가포르", price: 180 },
  { name: "자카르타", price: 200 },

  { name: "세금", price: 0 },

  { name: "두바이", price: 220 },
  { name: "이스탄불", price: 240 },
  { name: "카이로", price: 260 },

  { name: "행운", price: 0 },

  { name: "파리", price: 280 },
  { name: "런던", price: 300 },
  { name: "로마", price: 320 },

  { name: "무인도", price: 0 },

  { name: "뉴욕", price: 340 },
  { name: "토론토", price: 360 },
  { name: "멕시코시티", price: 380 },

  { name: "축제", price: 0 },

  { name: "리우데자네이루", price: 400 },
  { name: "시드니", price: 420 },
  { name: "케이프타운", price: 440 },

  { name: "블랙홀", price: 0 },

  { name: "홍콩", price: 460 },
  { name: "로스앤젤레스", price: 480 },
  { name: "상하이", price: 500 },
];

  const [teams, setTeams] = useState([
    {
      name: "용인대1",
      color: "bg-blue-500",
      mana: 1000,
      position: 0,
      lands: [] as string[],
    },
    {
      name: "용인대2",
      color: "bg-green-500",
      mana: 1000,
      position: 0,
      lands: [] as string[],
    },
    {
      name: "예과대",
      color: "bg-red-500",
      mana: 1000,
      position: 0,
      lands: [] as string[],
    },
    {
      name: "명지대",
      color: "bg-yellow-500",
      mana: 1000,
      position: 0,
      lands: [] as string[],
    },
  ]);

  const [currentTurn, setCurrentTurn] =
    useState(0);

  const [dice, setDice] = useState(1);

  const [logs, setLogs] = useState<string[]>(
    []
  );
const [scoreInputs, setScoreInputs] = useState(["", "", "", ""]);
const isAdmin = false;
  const currentTeam = teams[currentTurn];
useEffect(() => {
  const loadGame = async () => {
    const gameRef = doc(
      db,
      "games",
      "main"
    );

    const gameSnap = await getDoc(
      gameRef
    );

    if (gameSnap.exists()) {
      const data = gameSnap.data();

      setTeams(data.teams || []);
      setLogs(data.logs || []);
      setCurrentTurn(
        data.currentTurn || 0
      );
    }
  };

  loadGame();
}, []);
  const currentLand =
    board[currentTeam.position];

  const getOwner = (landName: string) => {
    return teams.find((team) =>
      team.lands.includes(landName)
    );
  };
const saveGame = async (
  updatedTeams: typeof teams,
  updatedLogs = logs,
  updatedTurn = currentTurn
) => {
  await setDoc(
    doc(db, "games", "main"),
    {
      teams: updatedTeams,
      logs: updatedLogs,
      currentTurn: updatedTurn,
    }
  );
};
  const rollDice = async () => {
    const randomNumber =
      Math.floor(Math.random() * 6) + 1;

    setDice(randomNumber);

    const updatedTeams = teams.map((team) => ({
      ...team,
      lands: [...team.lands],
    }));

    updatedTeams[currentTurn].position =
      (updatedTeams[currentTurn].position +
        randomNumber) %
      board.length;

    const landedLand =
      board[
        updatedTeams[currentTurn].position
      ];

    const owner = getOwner(landedLand.name);

    const newLogs = [...logs];

    newLogs.unshift(
      `${currentTeam.name}이(가) ${landedLand.name} 도착`
    );

    if (landedLand.name === "이벤트") {
  updatedTeams[currentTurn].mana += 100;

  newLogs.unshift(
    `${currentTeam.name} +100 마나 획득`
  );
}

if (landedLand.name === "세금") {
  const tax = Math.floor(
    updatedTeams[currentTurn].mana * 0.1
  );

  updatedTeams[currentTurn].mana -= tax;

  newLogs.unshift(
    `${currentTeam.name} 세금 ${tax} 마나 지불`
  );
}
if (landedLand.name === "행운") {
  const bonus =
    Math.floor(Math.random() * 151) + 50;

  updatedTeams[currentTurn].mana +=
    bonus;

  newLogs.unshift(
    `${currentTeam.name} 행운! +${bonus} 마나`
  );
}

if (landedLand.name === "블랙홀") {
  const randomPosition =
    Math.floor(
      Math.random() * board.length
    );

  updatedTeams[currentTurn].position =
    randomPosition;

  newLogs.unshift(
    `${currentTeam.name} 블랙홀 이동!`
  );
}

    if (
      owner &&
      owner.name !== currentTeam.name
    ) {
      updatedTeams[currentTurn].mana -= 50;

      const ownerIndex = teams.findIndex(
        (team) => team.name === owner.name
      );

      updatedTeams[ownerIndex].mana += 50;

      newLogs.unshift(
        `${currentTeam.name} 통행료 50 지불`
      );
    }

    setLogs(newLogs);

setTeams(updatedTeams);

await saveGame(
  updatedTeams,
  newLogs,
  currentTurn
);
  };
  const buyLand = async () => {

  const latestLand =
    board[teams[currentTurn].position];

  if (
    latestLand.price > 0 &&
    currentTeam.mana >= latestLand.price &&
    !getOwner(latestLand.name)
      
    ) {
      const updatedTeams = teams.map((team) => ({
        ...team,
        lands: [...team.lands],
      }));

      updatedTeams[currentTurn].mana -=
  latestLand.price;

      updatedTeams[currentTurn].lands.push(
        latestLand.name
      );

      const updatedLogs = [
  `${currentTeam.name}이(가) ${latestLand.name} 구매`,
  ...logs,
];

setTeams(updatedTeams);

setLogs(updatedLogs);

await saveGame(
  updatedTeams,
  updatedLogs,
  currentTurn
);
    }
  };
const addScore = async (
  teamIndex: number
) => {
  const score =
    Number(scoreInputs[teamIndex]) || 0;

  if (score <= 0) return;

  const updatedTeams = teams.map((team) => ({
    ...team,
    lands: [...team.lands],
  }));

  updatedTeams[teamIndex].mana += score;

  setTeams(updatedTeams);
  await saveGame(updatedTeams);

  const updatedInputs = [...scoreInputs];

  updatedInputs[teamIndex] = "";

  setScoreInputs(updatedInputs);

  setLogs([
    `${updatedTeams[teamIndex].name} +${score} 마나 획득`,
    ...logs,
  ]);
};
const takeoverLand = async () => {
  const latestLand =
    board[teams[currentTurn].position];

  const owner = getOwner(latestLand.name);

  if (
    !owner ||
    owner.name === currentTeam.name
  ) {
    return;
  }

  const cost = latestLand.price * 2;

  if (currentTeam.mana < cost) {
    return;
  }

  const updatedTeams = teams.map((team) => ({
    ...team,
    lands: [...team.lands],
  }));

  const ownerIndex = updatedTeams.findIndex(
    (team) => team.name === owner.name
  );

  updatedTeams[ownerIndex].lands =
    updatedTeams[ownerIndex].lands.filter(
      (land) => land !== latestLand.name
    );

  updatedTeams[currentTurn].lands.push(
    latestLand.name
  );

  updatedTeams[currentTurn].mana -= cost;

  setTeams(updatedTeams);
  await saveGame(updatedTeams);

  setLogs([
    `${currentTeam.name}이(가) ${latestLand.name} 인수`,
    ...logs,
  ]);
};
const resetGame = async () => {
  const resetTeams = teams.map(
    (team) => ({
      ...team,
      mana: 0,
      lands: [],
      position: 0,
    })
  );

  setTeams(resetTeams);

  setLogs([]);

  setCurrentTurn(0);

  await setDoc(
    doc(db, "games", "main"),
    {
      teams: resetTeams,
      logs: [],
      currentTurn: 0,
    }
  );
};
  const nextTurn = async () => {
  const next =
    (currentTurn + 1) % teams.length;

  setCurrentTurn(next);

  await setDoc(
    doc(db, "games", "main"),
    {
      teams,
      logs,
      currentTurn: next,
    }
  );
};

  return (
    <main className="min-h-screen bg-zinc-900 text-white p-6">
      <h1 className="text-4xl font-bold mb-6">
        Mana Marble
      </h1>

      <div className="bg-blue-600 p-4 rounded-2xl mb-6">
        <h2 className="text-2xl font-bold">
          현재 턴: {currentTeam.name}
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {board.map((tile, index) => {
          const owner = getOwner(tile.name);

          return (
            <div
              key={index}
              className={`p-4 rounded-2xl text-center ${
  owner
    ? owner.color
    : "bg-zinc-800"
}`}
            >
              <div className="font-bold">
                {tile.name}
              </div>

              <div className="text-sm mt-1">
                {tile.price > 0
                  ? `${tile.price} 마나`
                  : "특수칸"}
              </div>

              {owner && (
                <div className="mt-2 text-xs">
                  🏠 {owner.name}
                </div>
              )}

              <div className="mt-2 text-sm">
                {teams
                  .filter(
                    (team) =>
                      team.position === index
                  )
                  .map((team) => (
                    <div key={team.name}>
                      🚶 {team.name}
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-zinc-800 p-6 rounded-2xl mb-6">
        <h2 className="text-2xl font-bold mb-4">
          현재 위치
        </h2>

        <p className="text-3xl font-bold">
          {currentLand.name}
        </p>

        {currentLand.price > 0 &&
          !getOwner(currentLand.name) && (
            <button
              onClick={buyLand}
              className="mt-4 bg-green-500 px-4 py-2 rounded-xl font-bold"
            >
              땅 구매
            </button>
          )}
          {(() => {
  const owner = getOwner(
    board[teams[currentTurn].position].name
  );

  return (
    owner &&
    owner.name !== currentTeam.name && (
      <button
        onClick={takeoverLand}
        className="mt-4 ml-4 bg-red-500 px-4 py-2 rounded-xl font-bold"
      >
        인수하기
      </button>
    )
  );
})()}

      </div>

      <div className="bg-zinc-800 p-6 rounded-2xl mb-6">
        <h2 className="text-2xl font-bold mb-4">
          🎲 주사위
        </h2>

        <div className="text-6xl font-bold mb-4">
          {dice}
        </div>

        <button
          onClick={rollDice}
          className="bg-blue-500 px-6 py-3 rounded-xl text-lg font-bold mr-4"
        >
          주사위 굴리기
        </button>

        <button
          onClick={nextTurn}
          className="bg-purple-500 px-6 py-3 rounded-xl text-lg font-bold"
        >
          턴 종료
        </button>
        {isAdmin && (
  <button
    onClick={resetGame}
    className="bg-red-600 px-6 py-3 rounded-xl text-lg font-bold ml-4"
  >
    새 게임
  </button>
)}
      </div>

      <div className="bg-zinc-800 p-6 rounded-2xl mb-6">
        <h2 className="text-2xl font-bold mb-4">
          게임 로그
        </h2>

        <div className="space-y-2">
          {logs.length === 0 && (
            <p>아직 로그가 없습니다.</p>
          )}

          {logs.map((log, index) => (
            <div
              key={index}
              className="bg-zinc-700 p-2 rounded-lg"
            >
              {log}
            </div>
          ))}
        </div>
      </div>

<div className="grid grid-cols-2 gap-4">
  {teams.map((team, index) => (
    <div
      key={team.name}
      className="bg-zinc-800 p-4 rounded-2xl"
    >
      <h2 className="text-xl font-bold mb-2">
        {team.name}
      </h2>

      <p className="mb-1">
        마나: {team.mana}
      </p>

      <p className="mb-3">
        보유 땅:
        {team.lands.length > 0
          ? team.lands.join(", ")
          : " 없음"}
      </p>

      {isAdmin && (
        <div className="flex gap-2">
          <input
            type="number"
            value={scoreInputs[index]}
            onChange={(e) => {
              const updated = [...scoreInputs];

              updated[index] =
                e.target.value;

              setScoreInputs(updated);
            }}
            placeholder="점수 입력"
            className="bg-zinc-700 px-3 py-2 rounded-lg w-full"
          />

          <button
            onClick={() => addScore(index)}
            className="bg-green-500 px-4 rounded-lg font-bold"
          >
            추가
          </button>
        </div>
      )}
    </div>
  ))}
</div>

    </main>
  );
}