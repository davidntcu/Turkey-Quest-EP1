
import { Language, Translation, TileType, TownTileType, Enemy } from './types';

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
    cmdItem: "Item",
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
    itemUsed: (name) => `Hero used ${name}.`,
    noItem: "Empty pockets!",
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
        buyPotion: (cost) => `Buy Potion - ${cost.toLocaleString()}G`,
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
      sceneUnlocked: "The road to Charlottetown is now open!"
    },
    scenes: {
      avonlea: "Avonlea",
      charlottetown: "Charlottetown",
      travelTo: (place) => `Travel to ${place}`
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
    potions: "道具",
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
    cmdItem: "使用道具",
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
    itemUsed: (name) => `勇者使用了${name}。`,
    noItem: "沒有道具了！",
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
        buyPotion: (cost) => `購買回復藥水 - ${cost.toLocaleString()}G`,
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
      sceneUnlocked: "通往夏洛特敦的道路開啟了！"
    },
    scenes: {
      avonlea: "艾凡里 (Avonlea)",
      charlottetown: "夏洛特敦 (Charlottetown)",
      travelTo: (place) => `前往 ${place}`
    }
  }
};

// Balanced Initial Player (Buffed as requested)
export const INITIAL_PLAYER = {
  name: "Anne", 
  level: 1,
  hp: 250,      // Director requested buff
  maxHp: 250,   // Director requested buff
  mp: 50,       // Director requested buff
  maxMp: 50,    // Director requested buff
  exp: 0,
  gold: 0,
  potions: 0,
  equipmentAtk: 10, // Start with a stick
  equipmentDef: 10  // Start with clothes
};

export const GOD_MODE_PLAYER = {
  name: "Hero (God)",
  level: 99,
  hp: 10000,
  maxHp: 10000,
  mp: 10000,
  maxMp: 10000,
  exp: 0,          // Set to 0 to see progress
  gold: 1000000,
  potions: 99,
  equipmentAtk: 500,
  equipmentDef: 0  // Set to 0 to feel damage
};

// Updated Anne Sprite: Red hair, pigtails (long02), slim face (Zoey seed helps)
export const PLAYER_SPRITE_URL = "https://api.dicebear.com/9.x/adventurer/svg?seed=Zoey&hair=long02&hairColor=e53935&skinColor=f5d0c5&backgroundColor=b6e3f4";

// Fallback: A generic pixel art turkey icon (DiceBear pixel art with turkey keyword seed often gives random stuff, so we use a reliable turkey-like fallback if AI fails)
export const MONSTER_FALLBACK_URL = "https://api.dicebear.com/9.x/pixel-art/svg?seed=TurkeyMonster&backgroundColor=b6e3f4"; 

// Realistic Badge for Title
export const TITLE_BADGE_URL = "https://images.unsplash.com/photo-1626548307930-deac221f87d9?q=80&w=1000&auto=format&fit=crop";

// Enhanced resolution seeds
export const LOCATION_IMAGES = {
  forest: "https://images.unsplash.com/photo-1448375240586-dfd8d395ea6c?q=80&w=1200&auto=format&fit=crop",
  mountain: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop",
  volcano: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1200&auto=format&fit=crop",
  castle: "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=1200&auto=format&fit=crop"
};

// Shop NPCs (Pixel Art Avatars)
export const SHOP_IMAGES = {
  guild: "https://api.dicebear.com/9.x/pixel-art/svg?seed=GuildMaster&clothing=armor&hair=long",
  weapon: "https://api.dicebear.com/9.x/pixel-art/svg?seed=Blacksmith&beard=variant04",
  armor: "https://api.dicebear.com/9.x/pixel-art/svg?seed=Guard&clothing=armor",
  item: "https://api.dicebear.com/9.x/pixel-art/svg?seed=Merchant&glasses=variant02",
  magic: "https://api.dicebear.com/9.x/pixel-art/svg?seed=Wizard&hat=variant03&beard=variant06"
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

export const TILE_COLORS: Record<TileType | TownTileType, string> = {
  W: 'bg-blue-600',
  G: 'bg-green-500',
  F: 'bg-green-800',
  M: 'bg-gray-600',
  V: 'bg-red-700',
  C: 'bg-yellow-600',
  H: 'bg-emerald-700', // House / Green Gables
  K: 'bg-blue-400', // School
  U: 'bg-purple-600', // University
  
  // Town specific
  _: 'bg-gray-900', // Wall
  S: 'bg-yellow-900', // Path/Floor
  A: 'bg-gray-400', // Armor
  I: 'bg-yellow-700', // Item
  E: 'bg-red-900', // Exit
};

export const TILE_ICONS: Record<TileType | TownTileType, string> = {
  W: '🌊',
  G: '🌱',
  F: '🌲',
  M: '⛰️',
  V: '🌋',
  C: '🏰',
  H: '🏡', // Green Gables
  K: '🏫', // School
  U: '🏛️', // University

  _: '🧱',
  S: '🟫',
  A: '🛡️',
  I: '💊',
  E: '🚪'
};

// Encounter Rates (0-1)
export const ENCOUNTER_RATES: Record<TileType, number> = {
  W: 0,
  C: 0,
  H: 0,
  K: 0,
  U: 0,
  G: 0.1,  // 10% on Grass
  F: 0.2,  // 20% in Forest
  M: 0.3,  // 30% in Mountain
  V: 0.4   // 40% in Volcano
};

// MAP DESIGN NOTES:
// Town (C) is usually start. Dungeon (V) is usually end.
// Special Tile (H, K, U) is placed between Town and Dungeon, slightly lower, 4 tiles away from V.
// Assuming 15x10 grid.

// SCENE 1: AVONLEA
// Town (C) at (2,2). Dungeon (V) at (12,2).
// H (Green Gables) target: x=8 or 9, y=6.
export const MAP_AVONLEA: TileType[][] = [
  ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
  ['W','G','G','G','F','F','F','M','M','M','M','M','F','F','W'],
  ['W','G','C','G','F','F','G','G','M','M','M','F','V','F','W'], // C: Town, V: Dungeon
  ['W','G','G','G','F','F','F','M','M','M','F','F','F','M','W'],
  ['W','G','G','F','F','F','F','M','M','M','M','F','M','M','W'],
  ['W','G','G','F','F','F','F','F','M','M','M','M','M','W','W'],
  ['W','G','G','G','F','F','F','F','G','H','M','M','W','W','W'], // H: Green Gables (Between C and V, Lower)
  ['W','W','G','G','G','G','G','G','G','G','G','W','W','W','W'],
  ['W','W','W','W','G','G','G','G','G','W','W','W','W','W','W'],
  ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
];

// SCENE 2: CAVENDISH
// K (School)
export const MAP_CAVENDISH: TileType[][] = [
    ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
    ['W','G','G','G','G','G','G','G','F','F','M','M','M','M','W'],
    ['W','G','C','G','G','G','G','G','F','F','M','M','V','M','W'],
    ['W','G','G','G','F','F','F','M','M','M','F','F','F','F','W'],
    ['W','G','G','F','F','F','F','G','G','G','G','G','G','G','W'],
    ['W','G','G','F','F','F','F','F','G','G','G','G','G','W','W'],
    ['W','G','G','G','F','F','F','F','G','K','M','M','W','W','W'], // K: School
    ['W','W','G','G','G','G','G','G','G','G','G','W','W','W','W'],
    ['W','W','W','W','G','G','G','G','G','W','W','W','W','W','W'],
    ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
];

// SCENE 3: CHARLOTTETOWN
// U (Academy)
export const MAP_CHARLOTTETOWN: TileType[][] = [
  ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
  ['W','G','G','G','G','G','G','G','M','M','M','M','M','M','W'],
  ['W','G','C','G','G','G','G','G','M','M','M','M','V','M','W'],
  ['W','G','G','G','F','F','F','M','M','M','G','G','G','G','W'],
  ['W','G','G','F','F','F','F','G','G','G','G','G','G','G','W'],
  ['W','G','G','F','F','F','F','F','G','G','G','G','G','W','W'],
  ['W','G','G','G','F','F','F','F','G','U','M','M','W','W','W'], // U: Academy
  ['W','W','G','G','G','G','G','G','G','G','G','W','W','W','W'],
  ['W','W','W','W','G','G','G','G','G','W','W','W','W','W','W'],
  ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
];

// 15x9 Town Map
export const TOWN_MAP: TownTileType[][] = [
    ['_','_','_','_','_','_','G','_','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','S','S','S','_','_','_','_','_','_','_'],
    ['_','_','W','S','S','S','S','S','S','S','A','_','_','_','_'],
    ['_','_','S','S','_','_','S','_','_','S','S','_','_','_','_'],
    ['_','_','S','S','_','_','S','_','_','S','S','_','_','_','_'],
    ['_','_','I','S','S','S','S','S','S','S','M','_','_','_','_'],
    ['_','_','_','_','_','S','S','S','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','S','S','S','_','_','_','_','_','_','_'],
    ['_','_','_','_','_','_','E','_','_','_','_','_','_','_','_'],
];

export const MAP_START_POS = { x: 2, y: 2 };
export const TOWN_START_POS = { x: 6, y: 8 };
