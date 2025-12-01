
import { Language, Translation, TileType, TownTileType, DungeonTileType, SceneType } from './types';

export const GAME_VERSION = "v1.3.2";

export const TRANSLATIONS: Record<Language, Translation> = {
  [Language.EN]: {
    worldMapName: "Prince Edward Island",
    loading: "Encountering Beast...",
    title: "TURKEY QUEST",
    start: "Start Adventure",
    continue: "Continue",
    credits: "Credits",
    hp: "HP",
    mp: "MP",
    lvl: "LVL",
    atk: "ATK",
    def: "DEF",
    potions: "Potions",
    reincarnationLabel: "Rank",
    about: {
      title: "About Turkey Quest",
      plot: "Plot: In a world dominated by mutant turkeys, a hero rises to reclaim Prince Edward Island. Guided by the spirit of Anne, you must defeat the poultry overlords.",
      gameplay: "Gameplay: AI make the monster turkeys. Turn-based RPG. Explore 3 towns, clear dungeons, collect loot, and reincarnate to get stronger. Supports Touch & Mouse.",
      author: "Author: HSJ David Ho",
      email: "Email: ntcudavid@gmail.com",
      close: "Close"
    },
    naming: {
      title: "Name Your Hero",
      placeholder: "Enter Name",
      hint: "Max 10 letters",
      confirm: "Start Journey",
      defaultName: "Anne"
    },
    saveLoad: {
      saveTitle: "Save Adventure",
      loadTitle: "Load Adventure",
      emptySlot: "Empty Slot",
      saveBtn: "Save",
      backBtn: "Back",
      savedMsg: "Game Saved!",
      loadedMsg: "Game Loaded!",
      autoSave: "AUTO-SAVE",
      autoSavedLog: "[SYSTEM] Progress Auto-Saved.",
      returnTitle: "Return Home",
      returningMsg: "[SYSTEM] Auto-saved. Returning Home..."
    },
    cmdPhysical: "Physical",
    cmdMagAtk: "Mag. Atk",
    cmdMagHeal: "Mag. Heal",
    cmdItem: "Potion Heal",
    cmdFlee: "Run",
    enemyAppears: (name) => `A wild ${name} gobbles loudly!`,
    playerAttack: (dmg) => `Sword Strike! ${dmg.toLocaleString()} damage!`,
    playerMagAtk: (dmg) => `Fireball! ${dmg.toLocaleString()} burn damage!`,
    enemyAttack: (name, dmg) => `${name} pecks! Hero takes ${dmg.toLocaleString()} damage!`,
    win: (exp, gold) => `Victory! Plucked ${exp.toLocaleString()} EXP and ${gold.toLocaleString()} Gold.`,
    loot: {
      found: (item) => `Found ${item}!`,
      equip: (stat, val) => `Equipped! ${stat} increased by ${val}.`,
      learn: (stat, val) => `Ancient Recipe! ${stat} +${val}.`
    },
    lose: "Overwhelmed by the flock...",
    runSuccess: "Escaped to fight another day!",
    runFail: "The Turkey blocks the way!",
    heal: (amt) => `Healing Light! Recovered ${amt.toLocaleString()} HP.`,
    itemUsed: () => `Hero used Potion Heal.`,
    noItem: "No Potions left!",
    noMp: "Not enough MP!",
    locations: {
      forest: "Feather Woods",
      mountain: "Beak Peaks",
      volcano: "Roaster Dungeon",
      castle: "Thanksgiving Keep"
    },
    mapActions: {
      enterTown: "Enter Town",
      enterDungeon: "Enter Dungeon"
    },
    town: {
      welcome: "Welcome to Thanksgiving Keep.",
      enterShop: "Press ENTER to visit",
      exitTown: "Exit Town",
      shops: {
        guild: "Adventurer's Guild",
        weapon: "Blacksmith",
        armor: "Armory",
        item: "General Store",
        magic: "Wizard's Tower"
      },
      actions: {
        rest: (cost) => `Rest & Heal (${cost.toLocaleString()}G)`,
        buyWeapon: (cost) => `Sharpen Sword (+3 ATK) - ${cost.toLocaleString()}G`,
        buyArmor: (cost) => `Reinforce Shield (+3 DEF) - ${cost.toLocaleString()}G`,
        buyPotion: (cost) => `Buy Red Potion - ${cost.toLocaleString()}G`,
        buyMagic: (cost) => `Study Scrolls (+5 MaxMP) - ${cost.toLocaleString()}G`,
        leave: "Leave Shop"
      },
      notEnoughGold: "Not enough Gold!",
      restored: "Fully restored!",
      bought: "Transaction complete!"
    },
    dungeon: {
      title: "Exploring...",
      floor: (f) => `Dungeon B${f}F`,
      forward: "Move Forward",
      goDeeper: "Descend to B2F",
      returnSurface: "Return to Surface",
      search: "Look Around",
      leave: "Escape Dungeon",
      nothing: "Just feathers and dust...",
      foundGold: (amt) => `Found a treasure chest with ${amt.toLocaleString()} Gold!`,
      encounter: "GOBBLE GOBBLE! (Enemy approaches)",
      bossEncounter: "DANGER! A massive presence approaches!",
      floorCleared: "The Floor Guardian is defeated!",
      sceneUnlocked: "A new area has been unlocked!",
      reincarnationMsg: (n) => `Reincarnation successful. Rank: ${n}.`
    },
    reincarnationModal: {
      title: "The Cycle of Rebirth",
      message: (n) => `Congratulations! You have defeated the ultimate evil of Prince Edward Island.\n\nYour spirit will now transmigrate to a new timeline.\n\nYou retain your Level, Gold, and Equipment.\nMonsters will become stronger in the next cycle.\n\nRank: ${n}`,
      bonus: "REWARD: ATK +10, DEF +10",
      confirm: "Accept Reincarnation"
    },
    scenes: {
      avonlea: "1. Avonlea",
      charlottetown: "3. Charlottetown",
      cavendish: "2. Cavendish",
      travelTo: (place) => `Travel to ${place}`,
      locked: "Area Locked (Clear Previous Dungeon)"
    },
    facilityHints: {
        house: "Green Gables: Rest here to recover HP/MP over time.",
        school: "Avonlea School: Study hard to earn Scholarship (Gold) over time.",
        academy: "Queen's Academy: Advanced training grants Potions over time."
    }
  },
  [Language.ZH]: {
    worldMapName: "愛德華王子島",
    loading: "魔雞遭遇中...",
    title: "勇者鬥火雞",
    start: "開啟冒險之書",
    continue: "讀取進度",
    credits: "製作團隊",
    hp: "生命",
    mp: "魔力",
    lvl: "等級",
    atk: "攻擊",
    def: "防禦",
    potions: "藥水",
    reincarnationLabel: "轉生",
    about: {
      title: "關於 勇者鬥火雞",
      plot: "劇情：在這個被變異火雞統治的世界，勇者挺身而出，誓言奪回愛德華王子島。在清秀佳人安妮的指引下，擊敗火雞霸主，讓人類重獲自由。",
      gameplay: "玩法：AI即時融入遊戲怪物創作，經典回合制 RPG。探索三個城鎮，攻略雙層地下城，收集神裝與魔法書。透過無限轉生機制，不斷突破數值極限。",
      author: "作者：信 David Ho",
      email: "信箱：ntcudavid@gmail.com",
      close: "關閉"
    },
    naming: {
      title: "請輸入勇者姓名",
      placeholder: "輸入姓名",
      hint: "最多5個中文字或10個英文字",
      confirm: "開始旅程",
      defaultName: "Anne"
    },
    saveLoad: {
      saveTitle: "儲存冒險",
      loadTitle: "讀取冒險",
      emptySlot: "空白記錄",
      saveBtn: "記錄",
      backBtn: "返回",
      savedMsg: "記錄完成！",
      loadedMsg: "讀取完成！",
      autoSave: "系統自動存檔",
      autoSavedLog: "[系統] 進度已自動保存。",
      returnTitle: "回首頁",
      returningMsg: "[系統] 進度已自動保存，正在返回首頁..."
    },
    cmdPhysical: "物理攻擊",
    cmdMagAtk: "魔法攻擊",
    cmdMagHeal: "魔法治癒",
    cmdItem: "藥水治癒",
    cmdFlee: "轉身逃跑",
    enemyAppears: (name) => `兇猛的 ${name} 出現了！`,
    playerAttack: (dmg) => `勇者的斬擊！給予火雞 ${dmg.toLocaleString()} 點傷害！`,
    playerMagAtk: (dmg) => `勇者施放爆炎術！造成 ${dmg.toLocaleString()} 點燃燒傷害！`,
    enemyAttack: (name, dmg) => `${name} 的攻擊！勇者受到了 ${dmg.toLocaleString()} 點傷害！`,
    win: (exp, gold) => `勝利！獲得 ${exp.toLocaleString()} 經驗值與 ${gold.toLocaleString()} 金幣。`,
    loot: {
      found: (item) => `發現了 ${item}！`,
      equip: (stat, val) => `裝備確認！${stat} 提升了 ${val} 點。`,
      learn: (stat, val) => `習得食譜！${stat} 增加了 ${val} 點。`
    },
    lose: "勇者被火雞群淹沒了......",
    runSuccess: "勇者成功逃走了！",
    runFail: "被翅膀擋住了！無法逃跑！",
    heal: (amt) => `勇者施放聖光術！恢復了 ${amt.toLocaleString()} 點生命。`,
    itemUsed: () => `勇者使用了藥水治癒。`,
    noItem: "沒有藥水了！",
    noMp: "MP 不足！",
    locations: {
      forest: "落羽之森",
      mountain: "尖喙山脈",
      volcano: "烤爐地下城",
      castle: "感恩節堡壘"
    },
    mapActions: {
      enterTown: "進入城鎮",
      enterDungeon: "進入地下城"
    },
    town: {
      welcome: "歡迎來到感恩節堡壘。",
      enterShop: "按 ENTER 進入設施",
      exitTown: "離開城鎮",
      shops: {
        guild: "冒險者公會",
        weapon: "武器鍛造屋",
        armor: "皇家防具店",
        item: "雜貨店",
        magic: "大魔導士之塔"
      },
      actions: {
        rest: (cost) => `休息回復 (${cost.toLocaleString()}G)`,
        buyWeapon: (cost) => `強化武器 (+3 攻擊) - ${cost.toLocaleString()}G`,
        buyArmor: (cost) => `強化防具 (+3 防禦) - ${cost.toLocaleString()}G`,
        buyPotion: (cost) => `購買紅色藥水 - ${cost.toLocaleString()}G`,
        buyMagic: (cost) => `研讀古卷 (+5 MaxMP) - ${cost.toLocaleString()}G`,
        leave: "離開設施"
      },
      notEnoughGold: "金幣不足！",
      restored: "體力完全恢復了！",
      bought: "交易完成！"
    },
    dungeon: {
      title: "探索中...",
      floor: (f) => `地下 ${f} 層`,
      forward: "向前探索",
      goDeeper: "進入地下 2 層",
      returnSurface: "返回地面",
      search: "調查周邊",
      leave: "逃離地下城",
      nothing: "這裡只有雞毛......",
      foundGold: (amt) => `發現了寶箱！獲得 ${amt.toLocaleString()} 金幣。`,
      encounter: "聽到了巨大的咕咕聲！",
      bossEncounter: "警告！感覺到了巨大的殺氣！",
      floorCleared: "該層的守護者已被擊敗！",
      sceneUnlocked: "通往新區域的道路開啟了！",
      reincarnationMsg: (n) => `恭喜戰勝最終頭目！系統將幫您轉生。每次轉生可提升 攻擊+10，防禦+10。您目前轉生次數為 ${n}次。`
    },
    reincarnationModal: {
      title: "傳說的終結與開始",
      message: (n) => `恭喜戰勝愛德華王子島的最終霸主！\n\n作為獎勵，您的靈魂將經歷轉生，\n繼承現有的等級、金幣與裝備，\n並前往新的輪迴。\n\n下個輪迴的怪物將會更強大，\n請準備好迎接挑戰。\n\n目前轉生次數：${n}`,
      bonus: "轉生獎勵：攻擊力 +10，防禦力 +10",
      confirm: "接受轉生，開啟新冒險"
    },
    scenes: {
      avonlea: "1. 艾凡里 (Avonlea)",
      charlottetown: "3. 夏洛特敦 (Charlottetown)",
      cavendish: "2. 卡文迪什 (Cavendish)",
      travelTo: (place) => `前往 ${place}`,
      locked: "區域未解鎖 (需通關前一地城)"
    },
    facilityHints: {
        house: "綠山莊：在此駐留可持續恢復 HP/MP。",
        school: "艾凡里學校：在此駐留可獲得獎學金 (金幣)。",
        academy: "女王學院：接受高等教育可獲得 藥水 補給。"
    }
  }
};

export const INITIAL_PLAYER = {
  name: "Anne", 
  level: 1,
  hp: 250,      
  maxHp: 250,   
  mp: 50,       
  maxMp: 50,    
  exp: 0,
  gold: 0,
  potions: 0,
  equipmentAtk: 0,
  equipmentDef: 0,
  reincarnationCount: 0 
};

export const GOD_MODE_PLAYER = {
  name: "Hero (God)",
  level: 99,
  hp: 10000,
  maxHp: 10000,
  mp: 10000,
  maxMp: 10000,
  exp: 0,
  gold: 1000000,
  potions: 100,
  equipmentAtk: 500,
  equipmentDef: 0,
  reincarnationCount: 10
};

export const PLAYER_SPRITE_URL = "https://api.dicebear.com/9.x/adventurer/svg?seed=Zoey&hair=long02";
export const POTION_ICON_URL = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none'><path d='M35 25 h30 v10 h-10 v15 h15 a5 5 0 0 1 5 5 v30 a10 10 0 0 1 -10 10 h-40 a10 10 0 0 1 -10 -10 v-30 a5 5 0 0 1 5 -5 h15 v-15 h-10 z' fill='%23e11d48' stroke='%23fff' stroke-width='2'/><path d='M40 20 h20 v5 h-20 z' fill='%239f1239'/></svg>";
export const MONSTER_FALLBACK_URL = "https://cdn-icons-png.flaticon.com/512/1895/1895685.png"; 

export const LOCATION_IMAGES = {
  forest: "https://images.unsplash.com/photo-1448375240586-dfd8d395ea6c?q=80&w=1200&auto=format&fit=crop",
  mountain: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop",
  volcano: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1200&auto=format&fit=crop",
  castle: "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=1200&auto=format&fit=crop"
};

export const SHOP_IMAGES = {
  guild: "https://api.dicebear.com/9.x/notionists/svg?seed=Guild",
  weapon: "https://api.dicebear.com/9.x/notionists/svg?seed=Blacksmith",
  armor: "https://api.dicebear.com/9.x/notionists/svg?seed=Guard",
  item: "https://api.dicebear.com/9.x/notionists/svg?seed=Merchant",
  magic: "https://api.dicebear.com/9.x/notionists/svg?seed=Wizard"
};

export const LOOT_NAMES = {
  [Language.EN]: {
    weapons: ["Carving Knife", "Fork of Destiny", "Turkey Slayer", "Gravy Blade"],
    armors: ["Apron of Protection", "Oven Mitts", "Plated Bib", "Golden Crust Mail"],
    grimoires: ["Recipe: Roast", "Recipe: Brine", "Sauce Tactics", "Holiday Spirit"]
  },
  [Language.ZH]: {
    weapons: ["切肉刀", "命運之叉", "屠雞者大劍", "肉汁長劍"],
    armors: ["防護圍裙", "隔熱手套", "合金圍兜", "金黃酥脆甲"],
    grimoires: ["秘傳：炙烤", "秘傳：鹽漬", "醬汁戰術", "節慶精神"]
  }
};

export const ANNE_TRIVIA: Record<SceneType, string[]> = {
  'AVONLEA': [
    "安妮曾經在吉爾伯特的頭上打碎了一塊石板。",
    "馬修送給安妮夢寐以求的泡泡袖洋裝。",
    "瑪莉拉以為安妮偷了紫水晶胸針。",
    "安妮為了把頭髮染黑，結果變成了綠色。",
    "安妮和黛安娜發誓要做永遠的知心好友。"
  ],
  'CAVENDISH': [
    "黛安娜喝了安妮給的紅酒，結果醉倒了。",
    "夜晚的鬧鬼森林對安妮來說非常可怕。",
    "安妮曾差點因為扮演百合少女而淹死。",
    "瑞秋·林德太太總是對鄰居的事情瞭若指掌。",
    "安妮的想像力讓平淡的生活充滿了色彩。"
  ],
  'CHARLOTTETOWN': [
    "安妮贏得了愛弗利獎學金，成績優異。",
    "吉爾伯特放棄了學校教職，讓給了安妮。",
    "為了考上女王學院，大家都非常努力唸書。",
    "約瑟芬姑婆雖然嚴肅，但很欣賞安妮。",
    "安妮在朗誦比賽中獲得了滿堂喝采。"
  ]
};

// Fun NPC Dialogues
export const NPC_DIALOGUES = [
    "聽說城外的火雞會噴火，是真的嗎？",
    "最近蔬菜漲價了，都是那些巨型雞害的。",
    "好想吃真正的烤雞，而不是被雞烤。",
    "冒險者公會的咖啡很好喝喔。",
    "你有看到紅頭髮的女孩跑過去嗎？",
    "我的盾牌被啄了一個大洞...",
    "如果世界和平了，我想開一家麵包店。",
    "不要小看憤怒的家禽，牠們有團體戰術。",
    "聽說收集羽毛可以換到神祕禮物？",
    "小心地下城的寶箱，有時候是陷阱。"
];

export const NPC_NAMES = ["村民A", "老爺爺", "熱心大嬸", "頑皮小孩", "旅行商人", "警衛", "農夫"];

export const TILE_COLORS: Record<TileType | TownTileType | DungeonTileType, string> = {
  W: 'bg-blue-600',
  G: 'bg-green-700',
  F: 'bg-green-900',
  M: 'bg-gray-600',
  V: 'bg-red-700',
  C: 'bg-yellow-600',
  H: 'bg-emerald-700',
  K: 'bg-blue-400',
  U: 'bg-purple-600',
  
  // Town specific
  _: 'bg-gray-900', // Wall/Fill
  R: 'bg-gray-600', // Road
  T: 'bg-green-800', // Tree
  N: 'bg-orange-800', // House
  g: 'bg-blue-800', // Guild
  w: 'bg-red-800', // Weapon
  a: 'bg-slate-500', // Armor
  i: 'bg-yellow-800', // Item
  m: 'bg-purple-900', // Magic
  E: 'bg-red-900', // Exit

  // Dungeon specific - Darker Blue/Grey theme for better visibility
  f: 'bg-slate-900', // Floor (Dark Blue-Black)
  d: 'bg-slate-700', // Wall (Lighter Blue-Grey)
  S: 'bg-yellow-600', // Stairs
  B: 'bg-red-900', // Boss
};

export const TILE_ICONS: Record<TileType | TownTileType | DungeonTileType, string> = {
  W: '🌊',
  G: '', 
  F: '🌲',
  M: '⛰️',
  V: '🌋',
  C: '🏰',
  H: '🏡', 
  K: '🏫', 
  U: '🏛️',

  _: '',
  R: '',
  T: '🌳',
  N: '🏠',
  g: '🏰',
  w: '⚔️',
  a: '🛡️',
  i: '💊',
  m: '🔮',
  E: '🚪', 

  f: '', // Empty floor
  d: '🧱', // Wall brick
  S: '🪜',
  B: '☠️',
};

export const ENCOUNTER_RATES: Partial<Record<TileType | DungeonTileType, number>> = {
  G: 0.1,  
  F: 0.2,  
  M: 0.3,  
  V: 0.4,
  f: 0.35, // High encounter rate in dungeon floor
};

export const MAP_AVONLEA: TileType[][] = [
  ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
  ['W','G','G','G','F','F','F','M','M','M','M','M','F','F','W'],
  ['W','G','C','G','F','F','G','G','M','M','M','F','V','F','W'],
  ['W','G','G','G','F','F','F','M','M','M','F','F','F','M','W'],
  ['W','G','G','G','F','F','F','M','M','M','M','F','M','M','W'],
  ['W','G','G','G','F','F','F','F','G','G','G','M','M','W','W'],
  ['W','G','G','G','G','G','G','F','G','H','G','M','W','W','W'],
  ['W','W','G','M','M','G','G','G','G','G','G','W','W','W','W'],
  ['W','W','W','W','M','G','G','G','G','W','W','W','W','W','W'],
  ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
];

export const MAP_CAVENDISH: TileType[][] = [
    ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
    ['W','G','G','G','G','G','G','G','F','F','M','M','M','M','W'],
    ['W','G','C','G','G','G','G','G','F','F','M','M','V','M','W'],
    ['W','G','G','G','F','F','F','M','M','M','F','F','F','F','W'],
    ['W','G','G','F','F','F','F','G','G','G','G','G','G','G','W'],
    ['W','G','G','G','F','F','F','F','G','G','G','G','G','W','W'],
    ['W','G','G','G','G','G','G','F','G','K','G','M','W','W','W'],
    ['W','W','G','M','M','G','G','G','G','G','G','W','W','W','W'],
    ['W','W','W','W','M','G','G','G','G','W','W','W','W','W','W'],
    ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
];

export const MAP_CHARLOTTETOWN: TileType[][] = [
  ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
  ['W','G','G','G','G','G','G','G','M','M','M','M','M','M','W'],
  ['W','G','C','G','G','G','G','G','M','M','M','M','V','M','W'],
  ['W','G','G','G','F','F','F','M','M','M','G','G','G','G','W'],
  ['W','G','G','F','F','F','F','G','G','G','G','G','G','G','W'],
  ['W','G','G','G','F','F','F','F','G','G','G','G','G','W','W'],
  ['W','G','G','G','G','G','G','F','G','U','G','M','W','W','W'],
  ['W','W','G','M','M','G','G','G','G','G','G','W','W','W','W'],
  ['W','W','W','W','M','G','G','G','G','W','W','W','W','W','W'],
  ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
];

export const TOWN_MAP: TownTileType[][] = [
    ['T','T','T','T','T','T','T','T','T','T','T','T','T','T','T'],
    ['T','N','N','T','g','T','m','T','N','N','T','N','N','T','T'], 
    ['T','R','R','R','R','R','R','R','R','R','R','R','R','R','T'], 
    ['T','R','T','T','T','R','T','R','T','T','T','R','T','R','T'],
    ['T','R','w','T','a','R','i','R','N','T','N','R','N','R','T'], 
    ['T','R','R','R','R','R','R','R','R','R','R','R','R','R','T'], 
    ['T','R','R','R','R','R','R','R','R','R','R','R','R','R','T'],
    ['T','T','T','T','T','T','R','T','T','T','T','T','T','T','T'],
    ['T','T','T','T','T','T','E','T','T','T','T','T','T','T','T'],
];

// Re-designed Dungeon Maps using 'd' and 'f'
// B1: Maze with 1 Boss (B) which reveals Stairs Down (S)
// E: Entrance(Exit) from surface
export const DUNGEON_B1_MAP: DungeonTileType[][] = [
    ['d','d','d','d','d','d','d','d','d','d','d','d','d','d','d'],
    ['d','d','d','d','d','f','f','f','f','f','f','d','B','d','d'],
    ['d','f','f','f','d','f','d','d','d','d','f','d','f','d','d'],
    ['d','f','d','f','d','f','d','d','f','f','f','f','f','f','d'],
    ['d','f','d','f','d','f','f','f','f','d','d','d','d','f','d'],
    ['d','f','d','f','d','d','d','d','d','d','f','f','f','f','d'],
    ['d','f','f','f','f','f','f','f','f','f','f','d','d','d','d'],
    ['d','E','d','d','d','d','d','d','d','d','d','d','d','d','d'],
    ['d','d','d','d','d','d','d','d','d','d','d','d','d','d','d']
];

// B2: Maze with Stairs Up (S) and Boss (B) which reveals Exit (E - Teleport)
export const DUNGEON_B2_MAP: DungeonTileType[][] = [
    ['d','d','d','d','d','d','d','d','d','d','d','d','d','d','d'],
    ['d','B','f','f','f','f','d','d','d','d','d','d','S','d','d'],
    ['d','d','d','d','d','f','d','f','f','f','f','d','f','d','d'],
    ['d','f','f','f','f','f','d','f','d','d','f','d','f','d','d'],
    ['d','f','d','d','d','d','d','f','d','d','f','d','f','d','d'],
    ['d','f','d','f','f','f','f','f','f','f','f','f','f','d','d'],
    ['d','f','d','f','d','d','d','d','d','d','d','d','d','d','d'],
    ['d','f','f','f','d','d','d','d','d','d','d','d','d','d','d'],
    ['d','d','d','d','d','d','d','d','d','d','d','d','d','d','d']
];

export const MAP_START_POS = { x: 2, y: 2 };
export const TOWN_START_POS = { x: 6, y: 7 }; 
export const DUNGEON_START_POS = { x: 1, y: 7 };
