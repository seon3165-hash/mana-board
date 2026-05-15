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

  const [dice, setDice] = useState(1);

  const [logs, setLogs] = useState<string[]>(
    []
  );
const [scoreInputs, setScoreInputs] =
  useState(
    teams.map(() => ({
      activity1: "",
      activity2: "",
      activity3: "",
    }))
  );
const activityRewards = {
  "단순": 1,
  "유효": 100,
  "침례": 1000,
};
const [isAdmin, setIsAdmin] =
  useState(false);
const [myTeam, setMyTeam] =
  useState("");
  useEffect(() => {
  const params =
    new URLSearchParams(
      window.location.search
    );

  const team =
    params.get("team");

  if (team) {
    setMyTeam(team);
  }
}, []);
const myIndex = teams.findIndex(
  (team) =>
    team.name.trim() ===
    myTeam.trim()
);

console.log("myTeam:", myTeam);
console.log("myIndex:", myIndex);

const currentTeam =
  teams[myIndex] || teams[0];
  const calculateMana = (
  index: number
) => {
  const activity1 =
    Number(
      scoreInputs[index].activity1
    ) || 0;

  const activity2 =
    Number(
      scoreInputs[index].activity2
    ) || 0;

  const activity3 =
    Number(
      scoreInputs[index].activity3
    ) || 0;

  return (
    activity1 * 1 +
    activity2 * 100 +
    activity3 * 1000
  );
};
  useEffect(() => {
  const savedTeam =
    localStorage.getItem("myTeam");

  if (savedTeam) {
    setMyTeam(savedTeam);
  }
}, []);
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
) => {
  await setDoc(
    doc(db, "games", "main"),
    {
      teams: updatedTeams,
      logs: updatedLogs,
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
if (updatedTeams[myIndex].mana < 10) {
  return;
}

updatedTeams[myIndex].mana -= 10;
    updatedTeams[myIndex].position =
      (updatedTeams[myIndex].position +
        randomNumber) %
      board.length;

    const landedLand =
      board[
        updatedTeams[myIndex].position
      ];

    const owner = getOwner(landedLand.name);

    const newLogs = [...logs];

    newLogs.unshift(
      `${currentTeam.name}이(가) ${landedLand.name} 도착`
    );

    if (landedLand.name === "이벤트") {
  updatedTeams[myIndex].mana += 100;

  newLogs.unshift(
    `${currentTeam.name} +100 마나 획득`
  );
}

if (landedLand.name === "세금") {
  const tax = Math.floor(
    updatedTeams[myIndex].mana * 0.1
  );

  updatedTeams[myIndex].mana -= tax;

  newLogs.unshift(
    `${currentTeam.name} 세금 ${tax} 마나 지불`
  );
}
if (landedLand.name === "행운") {
  const bonus =
    Math.floor(Math.random() * 151) + 50;

  updatedTeams[myIndex].mana +=
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

  updatedTeams[myIndex].position =
    randomPosition;

  newLogs.unshift(
    `${currentTeam.name} 블랙홀 이동!`
  );
}

    if (
      owner &&
      owner.name !== myTeam
    ) {
      updatedTeams[myIndex].mana -= 50;

      const ownerIndex = teams.findIndex(
        (team) => team.name === owner.name
      );

      updatedTeams[ownerIndex].mana += 50;

      newLogs.unshift(
        `${currentTeam.name} 통행료 50 지불`
      );
    }

    setLogs(newLogs.slice(0, 20));

setTeams(updatedTeams);

await saveGame(
  updatedTeams,
  newLogs.slice(0, 20),
);
  };
  const buyLand = async () => {

  const latestLand =
    board[teams[myIndex].position];

  if (
    latestLand.price > 0 &&
    teams[myIndex].mana >= latestLand.price &&
    !getOwner(latestLand.name)
      
    ) {
      const updatedTeams = teams.map((team) => ({
        ...team,
        lands: [...team.lands],
      }));

      updatedTeams[myIndex].mana -=
  latestLand.price;

      updatedTeams[myIndex].lands.push(
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
);
    }
  };
const addScore = async (
  teamIndex: number
) => {
  const activity1 =
    Number(
      scoreInputs[teamIndex]
        .activity1
    ) || 0;

  const activity2 =
    Number(
      scoreInputs[teamIndex]
        .activity2
    ) || 0;

  const activity3 =
    Number(
      scoreInputs[teamIndex]
        .activity3
    ) || 0;

  const totalScore =
    activity1 * 1 +
    activity2 * 100 +
    activity3 * 1000;

  const updatedTeams = teams.map((team) => ({
    ...team,
    lands: [...team.lands],
  }));

  updatedTeams[teamIndex].mana +=
    totalScore;

  setTeams(updatedTeams);

  await saveGame(updatedTeams);

  setLogs([
    `${updatedTeams[teamIndex].name} +${totalScore} 마나 획득`,
    ...logs,
  ]);
  const updatedInputs = [...scoreInputs];

updatedInputs[teamIndex] = {
  activity1: "",
  activity2: "",
  activity3: "",
};

setScoreInputs(updatedInputs);
};

 
const takeoverLand = async () => {
  const latestLand =
    board[teams[myIndex].position];

  const owner = getOwner(latestLand.name);

  if (
    !owner ||
    owner.name === currentTeam.name
  ) {
    return;
  }

  const cost = latestLand.price * 2;

  if (teams[myIndex].mana < cost) {
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

  updatedTeams[myIndex].lands.push(
    latestLand.name
  );

  updatedTeams[myIndex].mana -= cost;

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

  await setDoc(
    doc(db, "games", "main"),
    {
      teams: resetTeams,
      logs: [],
    }
  );
};

if (!myTeam) {
  return (
    <main className="min-h-screen bg-zinc-900 text-white p-6">
      <h1 className="text-4xl font-bold mb-6">
        팀 선택
      </h1>

      <div className="flex flex-col gap-4">
        {teams.map((team) => (
          <button
            key={team.name}
            onClick={async () => {
  setMyTeam(team.name);
  localStorage.setItem(
  "myTeam",
  team.name
);

  const teamIndex =
    teams.findIndex(
      (t) => t.name === team.name
    );


  await setDoc(
    doc(db, "games", "main"),
    {
      teams,
      logs,
    }
  );
}}
            className="bg-blue-600 p-4 rounded-xl text-xl font-bold"
          >
            {team.name}
          </button>
        ))}
      </div>
    </main>
  );
}
  return (
    <main
  className="min-h-screen bg-cover bg-center text-white p-6 overflow-auto"
  style={{
    backgroundImage: "url('/board.png')",
  }}
>
      <h1 className="text-4xl font-bold mb-6">
        Mana Marble
      </h1>
<button
  onClick={() => {
    const password =
      prompt("관리자 비밀번호");

    if (password === "1234") {
      setIsAdmin(true);
    }
  }}
  className="bg-red-500 px-4 py-2 rounded-xl mb-4"
>
  관리자 로그인
</button>
      <div className="bg-blue-600 p-4 rounded-2xl mb-6">
        <h2 className="text-2xl font-bold">
  현재 팀: {myTeam}
</h2>
      </div>

      <div className="relative w-full h-[900px] bg-zinc-900 rounded-3xl mb-6">

  {board.map((tile, index) => {
    const owner = getOwner(tile.name);

    const positions = [
  // 아래
  { top: "85%", left: "0%" },
  { top: "85%", left: "12%" },
  { top: "85%", left: "24%" },
  { top: "85%", left: "36%" },
  { top: "85%", left: "48%" },
  { top: "85%", left: "60%" },
  { top: "85%", left: "72%" },
  { top: "85%", left: "84%" },
  { top: "85%", left: "96%" },

  // 오른쪽
  { top: "72%", left: "85%" },
  { top: "59%", left: "85%" },
  { top: "46%", left: "85%" },
  { top: "33%", left: "85%" },
  { top: "20%", left: "85%" },
  { top: "7%", left: "85%" },

  // 위
  { top: "7%", left: "75%" },
  { top: "7%", left: "65%" },
  { top: "7%", left: "55%" },
  { top: "7%", left: "45%" },
  { top: "7%", left: "35%" },
  { top: "7%", left: "25%" },
  { top: "7%", left: "15%" },
  { top: "7%", left: "5%" },

  // 왼쪽
  { top: "20%", left: "5%" },
  { top: "33%", left: "5%" },
  { top: "46%", left: "5%" },
  { top: "59%", left: "5%" },
  { top: "72%", left: "5%" },
  { top: "85%", left: "5%" },
  { top: "85%", left: "95%" },
];

    const position =
  positions[
    (index + 1) %
      positions.length
  ];

    return (
      <div
        key={index}
        className={`absolute w-28 h-28 rounded-2xl p-2 text-center border-4 ${
          owner
            ? owner.color
            : "bg-zinc-800"
        }`}
        style={{
          top: position.top,
          left: position.left,
        }}
      >
        <div className="font-bold text-sm">
          {tile.name}
        </div>

        <div className="text-xs">
          {tile.price > 0
            ? `${tile.price}`
            : "특수"}
        </div>

        {owner && (
          <div className="text-xs mt-1">
            🏠 {owner.name}
          </div>
        )}

        <div className="text-xs mt-1">
          {teams
            .filter(
              (team) =>
                team.position === index
            )
            .map((team) => (
              <div key={team.name}>
                🚶
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
    board[teams[myIndex].position].name
  );

  return (
    owner &&
    owner.name !== myTeam && (
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

  <div className="flex gap-4 border-4 border-red-500 p-4">
    <button
      onClick={rollDice}
      className="bg-white text-black px-6 py-3 rounded-xl text-lg font-bold"
    >
      주사위 굴리기
    </button>

    {isAdmin && (
      <button
        onClick={resetGame}
        className="bg-red-600 px-6 py-3 rounded-xl text-lg font-bold"
      >
        새 게임
      </button>
    )}
  </div>
</div>

      <div className="bg-zinc-800 p-6 rounded-2xl mb-6">
        <h2 className="text-2xl font-bold mb-4">
          게임 로그
        </h2>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.length === 0 && (
            <p>아직 로그가 없습니다.</p>
          )}

          {logs.slice(0, 10).map((log, index) => (
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

      
  <div className="flex flex-col gap-2">
    <input
      type="number"
      placeholder="단순"
      value={scoreInputs[index].activity1}
      onChange={(e) => {
        const updated = [...scoreInputs];

        updated[index].activity1 =
          e.target.value;

        setScoreInputs(updated);
      }}
      className="bg-zinc-700 px-3 py-2 rounded-lg"
    />

    <input
      type="number"
      placeholder="유효"
      value={scoreInputs[index].activity2}
      onChange={(e) => {
        const updated = [...scoreInputs];

        updated[index].activity2 =
          e.target.value;

        setScoreInputs(updated);
      }}
      className="bg-zinc-700 px-3 py-2 rounded-lg"
    />

    <input
      type="number"
      placeholder="침례"
      value={scoreInputs[index].activity3}
      onChange={(e) => {
        const updated = [...scoreInputs];

        updated[index].activity3 =
          e.target.value;

        setScoreInputs(updated);
      }}
      className="bg-zinc-700 px-3 py-2 rounded-lg"
    />

    <p className="text-lg font-bold">
      예상 마나:
      {calculateMana(index)}
    </p>

    <button
      onClick={() => addScore(index)}
      className="bg-green-500 px-4 py-2 rounded-lg font-bold"
    >
      마나 지급
    </button>
  </div>
    </div>
  ))}
</div>

    </main>
  );
}