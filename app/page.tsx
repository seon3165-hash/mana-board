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
  { name: "일본", price: 120 },
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

  { name: "랜덤", price: 0 },

  { name: "뉴욕", price: 340 },
  { name: "토론토", price: 360 },
  { name: "멕시코시티", price: 380 },

  { name: "축제", price: 0 },
  { name: "시드니", price: 400 },
  { name: "케이프타운", price: 420 },
  { name: "로스앤젤레스", price: 460 },
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
      activity4: "",
    }))
  );
const activityRewards = {
  "단순": 1,
  "대학생": 1,
  "유효": 100,
  "침례": 1000,
};
const [isAdmin, setIsAdmin] =
  useState(false);
const [myTeam, setMyTeam] =
  useState("");
  const [showTeams, setShowTeams] =
  useState(false);
  const [playerName, setPlayerName] =
  useState("");
  const [savedPlayerName, setSavedPlayerName] =
  useState("");

  

  const [loaded, setLoaded] =
  useState(false);
  useEffect(() => {
  const savedTeam =
    localStorage.getItem(
      "myTeam"
    );

  const savedName =
    localStorage.getItem(
      "playerName"
    );

  if (savedTeam) {
    setMyTeam(savedTeam);
  }

  if (savedName) {
    setSavedPlayerName(
      savedName
    );
  }

  setLoaded(true);
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

  const activity4 =
    Number(
      scoreInputs[index].activity4
    ) || 0;

  return (
    activity1 * 1 +
    activity2 * 10 +
    activity3 * 100 +
    activity4 * 1000 
  );
};
const getTime = () => {
  return new Date().toLocaleString(
    "ko-KR",
    {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};
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
  board[currentTeam.position] ||
  board[0];

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

    if (myIndex === -1) return;

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
  `[${getTime()}] ${currentTeam.name}_${savedPlayerName}_${landedLand.name}_도착`
);

    if (landedLand.name === "이벤트") {
  updatedTeams[myIndex].mana += 100;

  newLogs.unshift(
    `[${getTime()}] ${currentTeam.name} +100 마나 획득`
  );
}

if (landedLand.name === "세금") {
  const tax = Math.floor(
    updatedTeams[myIndex].mana * 0.1
  );

  updatedTeams[myIndex].mana -= tax;

  newLogs.unshift(
  `${currentTeam.name}_${savedPlayerName}_${tax}마나_세금지불`
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
if (landedLand.name === "랜덤") {

  const randomEvent =
    Math.floor(
      Math.random() * 4
    );

  if (randomEvent === 0) {
    updatedTeams[myIndex].mana += 200;

    newLogs.unshift(
`${currentTeam.name}_${savedPlayerName}_200마나_획득`
    );
  }

  if (randomEvent === 1) {
    updatedTeams[myIndex].mana -= 100;

    newLogs.unshift(
`${currentTeam.name}_${savedPlayerName}_100마나_차감`
    );
  }

  if (randomEvent === 2) {
    updatedTeams[myIndex].position =
      Math.floor(
        Math.random() *
        board.length
      );

    newLogs.unshift(
`${currentTeam.name}_${savedPlayerName}_랜덤이동`
    );
  }

  if (randomEvent === 3) {
    newLogs.unshift(
`${currentTeam.name}_${savedPlayerName}_아무일없음`
    );
  }
}

    if (
      owner &&
      owner.name !== myTeam
    ) {
      const toll = Math.floor(
  landedLand.price * 0.1
);

updatedTeams[myIndex].mana -=
  toll;

const ownerIndex = teams.findIndex(
  (team) => team.name === owner.name
);

updatedTeams[ownerIndex].mana +=
  toll;

      newLogs.unshift(
        `${currentTeam.name} 통행료 ${toll} 지불`
      );
      newLogs.unshift(
  `${owner.name} +${toll} 마나 획득`
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

    if (myIndex === -1) return;

  const latestLand =
    board[currentTeam.position];

  if (
    latestLand.price > 0 &&
    currentTeam.mana >= latestLand.price &&
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
  `[${getTime()}]${currentTeam.name}_${savedPlayerName}_${latestLand.name}_구매`,
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

  const activity4 =
    Number(
      scoreInputs[teamIndex]
        .activity4
    ) || 0;

  const totalScore =
    activity1 * 1 +
    activity2 * 10 +
    activity3 * 100 +
    activity4 * 1000 ;

  const updatedTeams = teams.map((team) => ({
    ...team,
    lands: [...team.lands],
  }));

  updatedTeams[teamIndex].mana +=
    totalScore;

  setTeams(updatedTeams);

  await saveGame(updatedTeams);

  setLogs([
    `${updatedTeams[teamIndex].name}_${savedPlayerName}_${totalScore}마나_추가`,
    ...logs,
  ]);
  const updatedInputs = [...scoreInputs];

updatedInputs[teamIndex] = {
  activity1: "",
  activity2: "",
  activity3: "",
  activity4: "",
};

setScoreInputs(updatedInputs);
};

 
const takeoverLand = async () => {
  const latestLand =
    board[currentTeam.position];

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

  updatedTeams[myIndex].lands.push(
    latestLand.name
  );

  updatedTeams[myIndex].mana -= cost;

  setTeams(updatedTeams);
  await saveGame(updatedTeams);

  setLogs([
    `[${getTime()}]${currentTeam.name}_${savedPlayerName}_${latestLand.name}_인수`,
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


  if (!loaded) {
  return null;
  }

if (savedPlayerName === "") {
  
  return (
    <main className="min-h-screen bg-zinc-900 text-white p-6">

      <h1 className="text-3xl font-bold mb-6">
        이름 입력
      </h1>

      <input
        value={playerName}
        onChange={(e) => {
  e.stopPropagation();
  setPlayerName(e.target.value);
}}
        placeholder="이름 입력"
        className="bg-zinc-800 p-3 rounded-xl w-full"
      />

      <button
  onClick={() => {
    if (!playerName.trim()) return;

    localStorage.setItem(
  "playerName",
  playerName.trim()
);

setSavedPlayerName(
  playerName.trim()
);

  }}
  className="bg-blue-500 p-3 rounded-xl mt-4"
>
  시작
</button>

    </main>
  );
}

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
      onClick={() => {

        setMyTeam(team.name);

        localStorage.setItem(
          "myTeam",
          team.name
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
    className="min-h-screen bg-cover bg-center text-white p-6 overflow-auto relative"
    style={{}}
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

  <button
    onClick={() =>
      setShowTeams(!showTeams)
    }
    className="w-full text-left"
  >
    <h2 className="text-2xl font-bold">
      현재 팀: {myTeam} ▼
    </h2>
  </button>

  {showTeams && (
    <div className="mt-3 flex flex-col gap-2">

      {teams.map((team) => (
        <button
          key={team.name}
          onClick={() => {
            setMyTeam(team.name);

            localStorage.setItem(
              "myTeam",
              team.name
            );

            setShowTeams(false);
          }}
          className="
          bg-white
          text-black
          p-2
          rounded-xl
          "
        >
          {team.name}
        </button>
      ))}

    </div>
  )}

</div>

      <div className="relative w-full h-[650px] md:h-[900px] bg-zinc-900 rounded-3xl mb-6 overflow-hidden">
        <div
  className="
  absolute
  inset-0
  flex
  items-center
  justify-center
  pointer-events-none
"
>
  <img
    src="/로고.jpeg"
    alt="Mana Marble Logo"
    className="w-[800px] opacity-60"
  />
</div>

  {board.map((tile, index) => {

  const isSpecial = [
    "이벤트",
    "세금",
    "행운",
    "랜덤",
    "축제",
  ].includes(tile.name);
    const owner = getOwner(tile.name);


  const isMobile =
  typeof window !== "undefined" &&
  window.innerWidth < 768;

const positions = isMobile
  ? [

      // 📱 모바일 아래 (7칸)
      { top: "90%", left: "2%" },
      { top: "90%", left: "22%" },
      { top: "90%", left: "42%" },
      { top: "90%", left: "62%" },
      { top: "90%", left: "82%" },

      // 📱 모바일 오른쪽 (6칸)
      { top: "79%", left: "82%" },
      { top: "68%", left: "82%" },
      { top: "57%", left: "82%" },
      { top: "46%", left: "82%" },
      { top: "35%", left: "82%" },
      { top: "24%", left: "82%" },
      { top: "13%", left: "82%" },
      { top: "2%", left: "82%" },

      // 📱 모바일 위 (6칸)
      { top: "2%", left: "62%" },
      { top: "2%", left: "42%" },
      { top: "2%", left: "22%" },
      { top: "2%", left: "2%" },

      // 📱 모바일 왼쪽 (5칸)
      { top: "13%", left: "2%" },
      { top: "24%", left: "2%" },
      { top: "35%", left: "2%" },
      { top: "46%", left: "2%" },
      { top: "57%", left: "2%" },
      { top: "68%", left: "2%" },
      { top: "79%", left: "2%" },

    ]
  : [

      // 💻 PC 기존 유지
      { top: "85%", left: "2%" },
      { top: "85%", left: "14%" },
      { top: "85%", left: "26%" },
      { top: "85%", left: "38%" },
      { top: "85%", left: "50%" },
      { top: "85%", left: "62%" },
      { top: "85%", left: "74%" },
      { top: "85%", left: "86%" },
      

      { top: "70%", left: "86%" },
      { top: "55%", left: "86%" },
      { top: "40%", left: "86%" },
      { top: "25%", left: "86%" },
      { top: "10%", left: "86%" },

      { top: "10%", left: "74%" },
      { top: "10%", left: "62%" },
      { top: "10%", left: "50%" },
      { top: "10%", left: "38%" },
      { top: "10%", left: "26%" },
      { top: "10%", left: "14%" },
      { top: "10%", left: "2%" },

      { top: "25%", left: "2%" },
      { top: "40%", left: "2%" },
      { top: "55%", left: "2%" },
      { top: "70%", left: "2%" },

    ];

    const position =
  positions[index] ||
  positions[0];

    return (
      <div
        key={index}
        className={`absolute w-16 h-16 md:w-32 md:h-32 rounded-2xl p-1 md:p-2 text-center border-4 ${
          owner
  ? owner.color
  : isSpecial
    ? "bg-amber-400 border-yellow-100 text-black"
    : "bg-zinc-800"
        }`}
        style={{
          top: position.top,
          left: position.left,
        }}
      >
        <div className="font-bold text-[7px] md:text-base">
          {tile.name}
        </div>

        <div className="text-[7px] md:text-sm">
          {tile.price > 0
            ? `${tile.price}`
            : "특수"}
        </div>

        {owner && (
          <div className="text-[5px] md:text-xs mt-1">
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
    board[currentTeam.position].name
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
      <div className="bg-zinc-800 p-4 rounded-2xl mb-6">
  <h2 className="text-2xl font-bold mb-4">
    순위
  </h2>

  {[...teams]
    .sort((a, b) => {
      const aTotal =
        a.mana +
        a.lands.reduce(
          (sum, land) =>
            sum +
            (board.find(
              (b) => b.name === land
            )?.price || 0),
          0
        );

      const bTotal =
        b.mana +
        b.lands.reduce(
          (sum, land) =>
            sum +
            (board.find(
              (b2) => b2.name === land
            )?.price || 0),
          0
        );

      return bTotal - aTotal;
    })
    .map((team, index) => {

      const totalScore =
        team.mana +
        team.lands.reduce(
          (sum, land) =>
            sum +
            (board.find(
              (b) => b.name === land
            )?.price || 0),
          0
        );

      return (
        <div
          key={team.name}
          className="flex justify-between items-center mb-2 bg-zinc-700 p-3 rounded-xl"
        >
          <div>
            <span className="font-bold">
              {index + 1}등
            </span>

            <span className="ml-3">
              {team.name}
            </span>
          </div>

          <div className="text-right">
            <div>
              {totalScore} 점
            </div>

            <div className="text-sm text-zinc-300">
              마나 {team.mana}
            </div>
          </div>
        </div>
      );
    })}
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

{team.name === myTeam && (

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
      placeholder="대학생"
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
      placeholder="유효"
      value={scoreInputs[index].activity3}
      onChange={(e) => {
        const updated = [...scoreInputs];

        updated[index].activity3 =
          e.target.value;

        setScoreInputs(updated);
      }}
      className="bg-zinc-700 px-3 py-2 rounded-lg"
    />

    <input
      type="number"
      placeholder="침례"
      value={scoreInputs[index].activity4}
      onChange={(e) => {
        const updated = [...scoreInputs];

        updated[index].activity4 =
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
)}
    </div>
  ))}
</div>
  

</main>
);
}