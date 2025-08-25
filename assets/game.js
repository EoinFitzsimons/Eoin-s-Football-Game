import {
  Vector3,
  CylinderGeometry,
  MeshStandardMaterial,
  Mesh,
  SphereGeometry,
  Scene,
  Color,
  PerspectiveCamera,
  WebGLRenderer,
  PlaneGeometry,
  MeshLambertMaterial,
  LineBasicMaterial,
  BufferGeometry,
  Line,
  RingGeometry,
  MeshBasicMaterial,
  DoubleSide,
  AmbientLight,
  DirectionalLight,
  Box3,
  Group,
} from "https://unpkg.com/three@0.152.2/build/three.module.js";
import { GLTFLoader } from "./GLTFLoader.js";

// Aggregate all three.js imports into a THREE object for legacy code
const THREE = {
  Vector3,
  CylinderGeometry,
  MeshStandardMaterial,
  Mesh,
  SphereGeometry,
  Scene,
  Color,
  PerspectiveCamera,
  WebGLRenderer,
  PlaneGeometry,
  MeshLambertMaterial,
  LineBasicMaterial,
  BufferGeometry,
  Line,
  RingGeometry,
  MeshBasicMaterial,
  DoubleSide,
  AmbientLight,
  DirectionalLight,
  Box3,
  Group,
};
window.THREE = THREE;

// --- Animation Library Loader ---
let animationLibrary = null;
let animationClips = [];
let animationLibraryLoaded = false;
function loadAnimationLibrary(callback) {
  if (animationLibraryLoaded) {
    callback(animationClips);
    return;
  }
  const loader = new GLTFLoader();
  loader.load(
    "assets/Animation Library[Standard]/Godot/AnimationLibrary_Godot_Standard.glb",
    (gltf) => {
      animationLibrary = gltf;
      // Only keep football-related animations
      const footballKeywords = [
        "Idle",
        "Jog",
        "Run",
        "Sprint",
        "Walk",
        "Kick",
        "Pass",
        "Shoot",
        "Tackle",
        "Celebrate",
        "Goal",
        "Save",
        "Dribble",
        "Slide",
        "Header",
        "Foul",
        "Defend",
        "Attack",
        "Keeper",
        "Throw",
        "Catch",
        "Chest",
        "Trap",
        "Turn",
        "Stand",
        "Sit",
        "Warmup",
        "Stretch",
        "Sub",
        "Injured",
        "Fall",
        "GetUp",
        "Lineup",
        "Handshake",
        "Wave",
        "Point",
        "Call",
        "Signal",
        "Coach",
        "Ref",
        "Whistle",
        "Yellow",
        "Red",
        "Card",
        "Corner",
        "FreeKick",
        "Penalty",
        "Kickoff",
        "Substitute",
        "Manager",
        "Bench",
        "Stretch",
        "Stretching",
        "Push",
        "Pull",
        "Pushup",
        "Jump",
        "Land",
        "Start",
        "Stop",
        "Ready",
        "Prepare",
        "Celebrate",
        "Victory",
        "Win",
        "Lose",
        "Draw",
        "Cheer",
        "Applaud",
        "Clap",
        "Boo",
        "Disappointed",
        "Angry",
        "Argue",
        "Complain",
        "Appeal",
        "Dispute",
        "Discuss",
        "Talk",
        "Shout",
        "Yell",
        "Scream",
        "Smile",
        "Laugh",
        "Cry",
        "Sad",
        "Happy",
        "Excited",
        "Nervous",
        "Anxious",
        "Focused",
        "Concentrate",
        "Motivate",
        "Encourage",
        "Support",
        "Team",
        "Group",
        "Huddle",
        "Circle",
        "Break",
        "Timeout",
        "Pause",
        "Resume",
        "Restart",
        "End",
        "Finish",
        "Final",
        "Half",
        "Second",
        "First",
        "Extra",
        "Overtime",
        "Shootout",
        "Penalty",
        "VAR",
        "Review",
        "Replay",
        "Offside",
        "Onside",
        "Handball",
        "Foul",
        "Injury",
        "Medical",
        "Stretcher",
        "Assist",
        "Coach",
        "Manager",
        "Referee",
        "Linesman",
        "Fourth",
        "Official",
        "Fan",
        "Crowd",
        "Spectator",
        "Audience",
        "Stadium",
        "Arena",
        "Field",
        "Pitch",
        "Grass",
        "Turf",
        "Net",
        "Goalpost",
        "Crossbar",
        "Flag",
        "Banner",
        "Sign",
        "Board",
        "Ad",
        "Sponsor",
        "Logo",
        "Brand",
        "Uniform",
        "Kit",
        "Jersey",
        "Shorts",
        "Socks",
        "Boots",
        "Shoes",
        "Gloves",
        "Shin",
        "Pad",
        "Tape",
        "Band",
        "Captain",
        "Armband",
        "Number",
        "Name",
        "Badge",
        "Patch",
        "Emblem",
        "Crest",
        "Shield",
        "Star",
        "Stripe",
        "Pattern",
        "Design",
        "Color",
        "Theme",
        "Style",
        "Look",
        "Appearance",
        "Outfit",
        "Dress",
        "Suit",
        "Tie",
        "Jacket",
        "Coat",
        "Sweater",
        "Hoodie",
        "Hat",
        "Cap",
        "Beanie",
        "Helmet",
        "Mask",
        "Face",
        "Hair",
        "Head",
        "Eye",
        "Ear",
        "Mouth",
        "Nose",
        "Chin",
        "Neck",
        "Shoulder",
        "Arm",
        "Elbow",
        "Wrist",
        "Hand",
        "Finger",
        "Thumb",
        "Chest",
        "Back",
        "Waist",
        "Hip",
        "Leg",
        "Knee",
        "Ankle",
        "Foot",
        "Toe",
        "Heel",
        "Sole",
        "Instep",
        "Arch",
        "Ball",
        "Boot",
        "Cleat",
        "Stud",
        "Lace",
        "Tongue",
        "Collar",
        "Heel",
        "Counter",
        "Quarter",
        "Vamp",
        "Toe",
        "Box",
        "Cap",
        "Guard",
        "Protector",
        "Support",
        "Cushion",
        "Pad",
        "Sock",
        "Tape",
        "Band",
        "Wrap",
        "Strap",
        "Tie",
        "Lace",
        "Fastener",
        "Clip",
        "Hook",
        "Loop",
        "Velcro",
        "Zip",
        "Button",
        "Snap",
        "Press",
        "Stud",
        "Popper",
        "Rivet",
        "Eyelet",
        "Grommet",
        "Ring",
        "D-Ring",
        "O-Ring",
        "Buckle",
        "Slider",
        "Keeper",
        "Retainer",
        "Holder",
        "Tab",
        "Pull",
        "Tag",
        "Label",
        "Patch",
        "Sticker",
        "Decal",
        "Print",
        "Mark",
        "Logo",
        "Brand",
        "Symbol",
        "Sign",
        "Badge",
        "Emblem",
        "Crest",
        "Shield",
        "Star",
        "Stripe",
        "Pattern",
        "Design",
        "Color",
        "Theme",
        "Style",
        "Look",
        "Appearance",
        "Outfit",
        "Dress",
        "Suit",
        "Tie",
        "Jacket",
        "Coat",
        "Sweater",
        "Hoodie",
        "Hat",
        "Cap",
        "Beanie",
        "Helmet",
        "Mask",
        "Face",
        "Hair",
        "Head",
        "Eye",
        "Ear",
        "Mouth",
        "Nose",
        "Chin",
        "Neck",
        "Shoulder",
        "Arm",
        "Elbow",
        "Wrist",
        "Hand",
        "Finger",
        "Thumb",
        "Chest",
        "Back",
        "Waist",
        "Hip",
        "Leg",
        "Knee",
        "Ankle",
        "Foot",
        "Toe",
        "Heel",
        "Sole",
        "Instep",
        "Arch",
        "Ball",
        "Boot",
        "Cleat",
        "Stud",
        "Lace",
        "Tongue",
        "Collar",
        "Heel",
        "Counter",
        "Quarter",
        "Vamp",
        "Toe",
        "Box",
        "Cap",
        "Guard",
        "Protector",
        "Support",
        "Cushion",
        "Pad",
        "Sock",
        "Tape",
        "Band",
        "Wrap",
        "Strap",
        "Tie",
        "Lace",
        "Fastener",
        "Clip",
        "Hook",
        "Loop",
        "Velcro",
        "Zip",
        "Button",
        "Snap",
        "Press",
        "Stud",
        "Popper",
        "Rivet",
        "Eyelet",
        "Grommet",
        "Ring",
        "D-Ring",
        "O-Ring",
        "Buckle",
        "Slider",
        "Keeper",
        "Retainer",
        "Holder",
        "Tab",
        "Pull",
        "Tag",
        "Label",
        "Patch",
        "Sticker",
        "Decal",
        "Print",
        "Mark",
        "Logo",
        "Brand",
        "Symbol",
        "Sign",
        "Badge",
        "Emblem",
        "Crest",
        "Shield",
        "Star",
        "Stripe",
        "Pattern",
        "Design",
        "Color",
        "Theme",
        "Style",
        "Look",
        "Appearance",
        "Outfit",
        "Dress",
        "Suit",
        "Tie",
        "Jacket",
        "Coat",
        "Sweater",
        "Hoodie",
        "Hat",
        "Cap",
        "Beanie",
        "Helmet",
        "Mask",
        "Face",
        "Hair",
        "Head",
        "Eye",
        "Ear",
        "Mouth",
        "Nose",
        "Chin",
        "Neck",
        "Shoulder",
        "Arm",
        "Elbow",
        "Wrist",
        "Hand",
        "Finger",
        "Thumb",
        "Chest",
        "Back",
        "Waist",
        "Hip",
        "Leg",
        "Knee",
        "Ankle",
        "Foot",
        "Toe",
        "Heel",
        "Sole",
        "Instep",
        "Arch",
        "Ball",
        "Boot",
        "Cleat",
        "Stud",
        "Lace",
        "Tongue",
        "Collar",
        "Heel",
        "Counter",
        "Quarter",
        "Vamp",
        "Toe",
        "Box",
        "Cap",
        "Guard",
        "Protector",
        "Support",
        "Cushion",
        "Pad",
        "Sock",
        "Tape",
        "Band",
        "Wrap",
        "Strap",
        "Tie",
        "Lace",
        "Fastener",
        "Clip",
        "Hook",
        "Loop",
        "Velcro",
        "Zip",
        "Button",
        "Snap",
        "Press",
        "Stud",
        "Popper",
        "Rivet",
        "Eyelet",
        "Grommet",
        "Ring",
        "D-Ring",
        "O-Ring",
        "Buckle",
        "Slider",
        "Keeper",
        "Retainer",
        "Holder",
        "Tab",
        "Pull",
        "Tag",
        "Label",
        "Patch",
        "Sticker",
        "Decal",
        "Print",
        "Mark",
        "Logo",
        "Brand",
        "Symbol",
        "Sign",
        "Badge",
        "Emblem",
        "Crest",
        "Shield",
        "Star",
        "Stripe",
        "Pattern",
        "Design",
        "Color",
        "Theme",
        "Style",
        "Look",
        "Appearance",
        "Outfit",
        "Dress",
        "Suit",
        "Tie",
        "Jacket",
        "Coat",
        "Sweater",
        "Hoodie",
        "Hat",
        "Cap",
        "Beanie",
        "Helmet",
        "Mask",
        "Face",
        "Hair",
        "Head",
        "Eye",
        "Ear",
        "Mouth",
        "Nose",
        "Chin",
        "Neck",
        "Shoulder",
        "Arm",
        "Elbow",
        "Wrist",
        "Hand",
        "Finger",
        "Thumb",
        "Chest",
        "Back",
        "Waist",
        "Hip",
        "Leg",
        "Knee",
        "Ankle",
        "Foot",
        "Toe",
        "Heel",
        "Sole",
        "Instep",
        "Arch",
        "Ball",
        "Boot",
        "Cleat",
        "Stud",
        "Lace",
        "Tongue",
        "Collar",
        "Heel",
        "Counter",
        "Quarter",
        "Vamp",
        "Toe",
        "Box",
        "Cap",
        "Guard",
        "Protector",
        "Support",
        "Cushion",
        "Pad",
        "Sock",
        "Tape",
        "Band",
        "Wrap",
        "Strap",
        "Tie",
        "Lace",
        "Fastener",
        "Clip",
        "Hook",
        "Loop",
        "Velcro",
        "Zip",
        "Button",
        "Snap",
        "Press",
        "Stud",
        "Popper",
        "Rivet",
        "Eyelet",
        "Grommet",
        "Ring",
        "D-Ring",
        "O-Ring",
        "Buckle",
        "Slider",
        "Keeper",
        "Retainer",
        "Holder",
        "Tab",
        "Pull",
        "Tag",
        "Label",
        "Patch",
        "Sticker",
        "Decal",
        "Print",
        "Mark",
        "Logo",
        "Brand",
        "Symbol",
        "Sign",
        "Badge",
        "Emblem",
        "Crest",
        "Shield",
        "Star",
        "Stripe",
        "Pattern",
        "Design",
        "Color",
        "Theme",
        "Style",
        "Look",
        "Appearance",
        "Outfit",
        "Dress",
        "Suit",
        "Tie",
        "Jacket",
        "Coat",
        "Sweater",
        "Hoodie",
        "Hat",
        "Cap",
        "Beanie",
        "Helmet",
        "Mask",
        "Face",
        "Hair",
        "Head",
        "Eye",
        "Ear",
        "Mouth",
        "Nose",
        "Chin",
        "Neck",
        "Shoulder",
        "Arm",
        "Elbow",
        "Wrist",
        "Hand",
        "Finger",
        "Thumb",
        "Chest",
        "Back",
        "Waist",
        "Hip",
        "Leg",
        "Knee",
        "Ankle",
        "Foot",
        "Toe",
        "Heel",
        "Sole",
        "Instep",
        "Arch",
        "Ball",
        "Boot",
        "Cleat",
        "Stud",
        "Lace",
        "Tongue",
        "Collar",
        "Heel",
        "Counter",
        "Quarter",
        "Vamp",
        "Toe",
        "Box",
        "Cap",
        "Guard",
        "Protector",
        "Support",
        "Cushion",
        "Pad",
        "Sock",
        "Tape",
        "Band",
        "Wrap",
        "Strap",
        "Tie",
        "Lace",
        "Fastener",
        "Clip",
        "Hook",
        "Loop",
        "Velcro",
        "Zip",
        "Button",
        "Snap",
        "Press",
        "Stud",
        "Popper",
        "Rivet",
        "Eyelet",
        "Grommet",
        "Ring",
        "D-Ring",
        "O-Ring",
        "Buckle",
        "Slider",
        "Keeper",
        "Retainer",
        "Holder",
        "Tab",
        "Pull",
        "Tag",
        "Label",
        "Patch",
        "Sticker",
        "Decal",
        "Print",
        "Mark",
        "Logo",
        "Brand",
        "Symbol",
        "Sign",
        "Badge",
        "Emblem",
        "Crest",
        "Shield",
        "Star",
        "Stripe",
        "Pattern",
        "Design",
        "Color",
        "Theme",
        "Style",
        "Look",
        "Appearance",
        "Outfit",
        "Dress",
        "Suit",
        "Tie",
        "Jacket",
        "Coat",
        "Sweater",
        "Hoodie",
        "Hat",
        "Cap",
        "Beanie",
        "Helmet",
        "Mask",
        "Face",
        "Hair",
        "Head",
        "Eye",
        "Ear",
        "Mouth",
        "Nose",
        "Chin",
        "Neck",
        "Shoulder",
        "Arm",
        "Elbow",
        "Wrist",
        "Hand",
        "Finger",
        "Thumb",
        "Chest",
        "Back",
        "Waist",
        "Hip",
        "Leg",
        "Knee",
        "Ankle",
        "Foot",
        "Toe",
        "Heel",
        "Sole",
        "Instep",
        "Arch",
      ];
      animationClips = (gltf.animations || []).filter((clip) =>
        footballKeywords.some(
          (keyword) =>
            clip.name?.toLowerCase().includes(keyword.toLowerCase())
        )
      );
      animationLibraryLoaded = true;
      callback(animationClips);
    },
    undefined,
    (err) => {
      console.error("Failed to load animation library:", err);
      callback([]);
    }
  );
}

// --- Main Menu and Team Selection Logic ---

// Language group selection
let selectedLanguage = "English";
let selectedColor = "#f39c12";
let playerNames = getRandomizedNames(LANGUAGE_GROUPS[selectedLanguage]);
let cpuLanguage = "Spanish";
let cpuColor = "#e74c3c";
let cpuNames = getRandomizedNames(LANGUAGE_GROUPS[cpuLanguage]);

document.addEventListener("DOMContentLoaded", () => {
  // Declare all DOM elements once, before any usage
  const mainMenu = document.getElementById("mainMenu");
  const languageSelect = document.getElementById("languageSelect");
  const mainMenuColor = document.getElementById("mainMenuColor");
  const cpuLanguageSelect = document.getElementById("cpuLanguageSelect");
  const cpuMenuColor = document.getElementById("cpuMenuColor");
  if (
    !mainMenu ||
    !languageSelect ||
    !mainMenuColor ||
    !cpuLanguageSelect ||
    !cpuMenuColor
  )
    return;

  // Dynamically populate language selectors
  languageSelect.innerHTML = "";
  cpuLanguageSelect.innerHTML = "";
  Object.keys(LANGUAGE_GROUPS).forEach((lang) => {
    const opt1 = document.createElement("option");
    opt1.value = lang;
    opt1.textContent = lang;
    languageSelect.appendChild(opt1);
    const opt2 = document.createElement("option");
    opt2.value = lang;
    opt2.textContent = lang;
    cpuLanguageSelect.appendChild(opt2);
  });
  languageSelect.value = selectedLanguage;
  cpuLanguageSelect.value = cpuLanguage;

  // --- Main Menu and Team Selection Logic ---
  function findAlternativeLanguage(excludeLang) {
    for (let l in LANGUAGE_GROUPS) {
      if (l !== excludeLang) {
        return l;
      }
    }
    return null;
  }

  function handleLanguageChange(e, isUser) {
    if (isUser) {
      selectedLanguage = e.target.value;
      playerNames = getRandomizedNames(LANGUAGE_GROUPS[selectedLanguage]);
      if (cpuLanguage === selectedLanguage) {
        const altLang = findAlternativeLanguage(selectedLanguage);
        if (altLang) {
          cpuLanguage = altLang;
          cpuLanguageSelect.value = altLang;
          cpuNames = getRandomizedNames(LANGUAGE_GROUPS[altLang]);
        }
      }
    } else {
      cpuLanguage = e.target.value;
      cpuNames = getRandomizedNames(LANGUAGE_GROUPS[cpuLanguage]);
      if (cpuLanguage === selectedLanguage) {
        const altLang = findAlternativeLanguage(cpuLanguage);
        if (altLang) {
          selectedLanguage = altLang;
          languageSelect.value = altLang;
          playerNames = getRandomizedNames(LANGUAGE_GROUPS[altLang]);
        }
      }
    }
  }

  languageSelect.onchange = (e) => handleLanguageChange(e, true);
  cpuLanguageSelect.onchange = (e) => handleLanguageChange(e, false);

  mainMenuColor.oninput = (e) => {
    selectedColor = e.target.value;
  };
  cpuMenuColor.oninput = (e) => {
    cpuColor = e.target.value;
  };

  // ...rest of your code...
});

// --- Gameplay Engine: Start Game ---
document.getElementById("startGameBtn").onclick = () => {
  mainMenu.style.display = "none";
  // Load animation library and model, then start game only after both are ready
  let animationReady = false;
  let modelReady = false;
  let loadedModel = null;

  function tryStartGame() {
    if (animationReady && modelReady) {
      window.game = new Game({
        THREE,
        playerNames,
        cpuNames,
        userColor: selectedColor,
        cpuColor: cpuColor,
        keeperColor: keeperColor,
        cpuKeeperColor: cpuKeeperColor,
        userFormation: userFormation,
        cpuFormation: cpuFormation,
        loadedModel: loadedModel
      });
      function trySetupPauseMenu(retries = 10) {
        if (window.game && typeof window.game.setupPauseMenu === "function") {
          window.game.setupPauseMenu();
          if (!window.game.pauseMenuSetupDone && retries > 0) {
            setTimeout(() => trySetupPauseMenu(retries - 1), 50);
          }
        }
      }
      trySetupPauseMenu();
    }
  }

  // Load animation library
  loadAnimationLibrary((clips) => {
  window.animationClips = clips;
  animationReady = true;
  tryStartGame();
  });

  // Load model
  const loader = new GLTFLoader();
  loader.load("assets/Base Characters/Godot/Superhero_Male.gltf", (gltf) => {
    loadedModel = gltf.scene;
    modelReady = true;
    tryStartGame();
  });
};
// --- Vector Math Helpers ---
class VectorHelper {
  static toBall(player, ball) {
    return new Vector3(
      ball.position.x - player.position.x,
      0,
      ball.position.z - player.position.z
    );
  }
  static toPlayer(from, to) {
    return new Vector3(
      to.position.x - from.position.x,
      0,
      to.position.z - from.position.z
    );
  }
  static getNearestTeammate(playerIdx, players) {
    let minDist = Infinity,
      idx = -1;
    for (let i = 0; i < players.length; ++i) {
      if (i === playerIdx) continue;
      let d = players[playerIdx].position.distanceTo(players[i].position);
      if (d < minDist) {
        minDist = d;
        idx = i;
      }
    }
    return idx !== -1 ? players[idx] : null;
  }
  static getFarthestTeammate(playerIdx, players) {
    let maxDist = -1,
      idx = -1;
    for (let i = 0; i < players.length; ++i) {
      if (i === playerIdx) continue;
      let d = players[playerIdx].position.distanceTo(players[i].position);
      if (d > maxDist) {
        maxDist = d;
        idx = i;
      }
    }
    return idx !== -1 ? players[idx] : null;
  }
  static getPlayerMovementDir(player) {
    if (typeof player.lastPos === "object") {
      let dx = player.position.x - player.lastPos.x;
      let dz = player.position.z - player.lastPos.z;
      let len = Math.sqrt(dx * dx + dz * dz);
      if (len > 0.01) return { dx: dx / len, dz: dz / len };
    }
    return { dx: 0, dz: 1 };
  }
}

// --- Player Class ---
class Player {
  constructor(color, x, z, name, isKeeper = false, modelScene = null) {
    this.color = color;
    this.x = x;
    this.z = z;
    this.name = name;
    this.isKeeper = isKeeper;
    this.modelScene = modelScene;
    this.initMesh();
    this.initProperties();
    this.initAnimation();
  }

  initMesh() {
    const { color, x, z, name, modelScene } = this;
    console.log(`[Player] modelScene received for '${name}':`, modelScene);
    this.mesh = new THREE.Group();
    const modelGroup = modelScene ? modelScene.clone(true) : null;
    if (modelGroup) {
      console.log(`[Player] modelGroup cloned for '${name}':`, modelGroup);
      let meshCount = 0;
      let hasVisibleMesh = false;
      let boundingBox = null;
      modelGroup.traverse((child) => {
        if (child.isMesh) {
          meshCount++;
          child.castShadow = true;
          child.receiveShadow = true;
          child.material = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.2,
            roughness: 0.7,
          });
          child.material.needsUpdate = true;
          child.visible = true;
          hasVisibleMesh = true;
          if (!boundingBox) {
            boundingBox = new THREE.Box3().setFromObject(child);
          } else {
            boundingBox.expandByObject(child);
          }
        }
      });
      if (boundingBox) {
        const size = boundingBox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const desiredHeight = 2.2;
        const scale = desiredHeight / maxDim;
        modelGroup.scale.set(scale, scale, scale);
        const center = boundingBox.getCenter(new THREE.Vector3());
        modelGroup.position.y -= center.y * scale;
      }
      this.mesh.add(modelGroup);
      this.mesh.position.set(x, 0, z);
      this.modelGroup = modelGroup;
      this.meshCount = meshCount;
      this.hasVisibleMesh = hasVisibleMesh;
      this.boundingBox = boundingBox;
      if (!hasVisibleMesh || meshCount === 0) {
        console.warn(
          `[Player] Model for '${name}' is empty or invisible, using fallback primitive. modelScene:`,
          modelScene,
          "modelGroup:",
          modelGroup
        );
        const geo = new THREE.CylinderGeometry(0.6, 0.6, 2.2, 16);
        const mat = new THREE.MeshStandardMaterial({ color });
        this.mesh = new THREE.Mesh(geo, mat);
        this.mesh.position.set(x, 1.1, z);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
      }
    } else {
      console.warn(
        `[Player] No modelScene provided for '${name}', using fallback primitive.`
      );
      const geo = new THREE.CylinderGeometry(0.6, 0.6, 2.2, 16);
      const mat = new THREE.MeshStandardMaterial({ color });
      this.mesh = new THREE.Mesh(geo, mat);
      this.mesh.position.set(x, 1.1, z);
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;
    }
    this.mesh.name = name;
    this.mesh.displayName = name;
    this.mesh.isKeeper = this.isKeeper;
  }

  initProperties() {
    this.position = this.mesh.position;
    this.vel = { x: 0, z: 0 };
    this.lastPos = { x: this.x, z: this.z };
  }

  initAnimation() {
    const { modelGroup, modelScene, name } = this;
    if (!modelGroup) return;
    if (typeof THREE.AnimationMixer === "function") {
      this.mixer = new THREE.AnimationMixer(modelGroup);
      let allClips = [];
      if (window.animationClips && Array.isArray(window.animationClips)) {
        allClips = allClips.concat(window.animationClips);
      }
      if (modelScene?.animations && Array.isArray(modelScene.animations)) {
        allClips = allClips.concat(modelScene.animations);
      }
      const seen = new Set();
      allClips = allClips.filter((c) => {
        if (!c?.name || seen.has(c.name)) return false;
        seen.add(c.name);
        return true;
      });
      this.actions = {};
      allClips.forEach((clip) => {
        this.actions[clip.name] = this.mixer.clipAction(clip);
      });
      let clip =
        allClips.find((c) => /walk/i.test(c.name)) ||
        allClips.find((c) => /run/i.test(c.name)) ||
        allClips.find((c) => /jog/i.test(c.name)) ||
        allClips.find((c) => /idle/i.test(c.name));
      if (clip && this.actions[clip.name]) {
        this.actions[clip.name].play();
        console.log(
          `[Player] Playing animation '${clip.name}' for '${name}'.`
        );
      } else {
        console.warn(
          `[Player] No walk/run/idle animation found for '${name}'.`
        );
      }
    }
    if (this.meshCount !== undefined) {
      console.log(
        `[Player] Created player '${name}' at (${this.x},${this.z}) with ${this.meshCount} mesh(es). Visible:`,
        this.modelGroup?.visible
      );
    }
    if (this.boundingBox) {
      console.log(
        `[Player] Bounding box for '${name}':`,
        this.boundingBox.min,
        this.boundingBox.max,
        "size:",
        this.boundingBox.getSize(new THREE.Vector3())
      );
    } else if (this.modelGroup) {
      console.warn(`[Player] No bounding box for '${name}'.`);
    }
  }
}

// --- Team Class ---
class Team {
  constructor(names, color, formation, keeperColor, modelScene = null) {
    this.players = [];
    for (let i = 0; i < 11; ++i) {
      const name = names[i] || `Player ${i + 1}`;
      const isKeeper = i === 0;
      const player = new Player(
        isKeeper ? keeperColor : color,
        formation[i][0],
        formation[i][1],
        name,
        isKeeper,
        modelScene
      );
      this.players.push(player);
    }
  }
  forEach(fn) {
    this.players.forEach(fn);
  }
}

// --- Ball Class ---
class Ball {
  constructor() {
    const geo = new SphereGeometry(0.7, 32, 32);
    const mat = new MeshStandardMaterial({ color: 0xf7f7f7 });
    this.mesh = new Mesh(geo, mat);
    this.mesh.position.set(0, 0.7, 0);
    this.position = this.mesh.position;
    this.vel = new Vector3(0, 0, 0);
    // Ensure ball is completely still at start
    this.vel.x = 0;
    this.vel.y = 0;
    this.vel.z = 0;
  }
  update(dt, pitchLength, pitchWidth) {
    // Ball physics: inertia, friction, rolling, height
    if (!this.vel.x) this.vel.x = 0;
    if (!this.vel.z) this.vel.z = 0;
    if (!this.vel.y) this.vel.y = 0;
    this.position.x += this.vel.x * dt;
    this.position.z += this.vel.z * dt;
    this.position.y += this.vel.y * dt;
    // Friction
    this.vel.x *= 0.98;
    this.vel.z *= 0.98;
    // Gravity for height
    if (this.position.y > 0.7 || this.vel.y > 0) {
      this.vel.y -= 25 * dt;
    }
    // Clamp to pitch
    this.position.x = Math.max(
      -pitchLength / 2 + 1,
      Math.min(pitchLength / 2 - 1, this.position.x)
    );
    this.position.z = Math.max(
      -pitchWidth / 2 + 1,
      Math.min(pitchWidth / 2 - 1, this.position.z)
    );
    // Ball hits ground
    if (this.position.y <= 0.7) {
      this.position.y = 0.7;
      if (this.vel.y < 0) this.vel.y *= -0.3; // Small bounce
      if (Math.abs(this.vel.y) < 2) this.vel.y = 0;
    }
    // Stop if slow
    if (
      Math.sqrt(this.vel.x * this.vel.x + this.vel.z * this.vel.z) < 0.1 &&
      Math.abs(this.vel.y) < 0.1
    ) {
      this.vel.x = 0;
      this.vel.z = 0;
      this.vel.y = 0;
    }
  }
}

// --- Camera Controller ---
class CameraController {
  constructor(camera, userPlayers) {
    this.camera = camera;
    this.userPlayers = userPlayers;
    this.controlledIdx = 0;
    this.cameraTarget = { x: 0, y: 40, z: 40 };
  }
  update() {
    const player = this.userPlayers[this.controlledIdx];
  if (!player?.mesh) return; // Guard: player or mesh not available yet
  const p = player.mesh;
    const camHeight = 38;
    const camDistance = 38;
    const { dx, dz } = VectorHelper.getPlayerMovementDir(p);
    const desired = {
      x: p.position.x - dx * camDistance,
      y: camHeight,
      z: p.position.z - dz * camDistance,
    };
    this.cameraTarget.x += (desired.x - this.cameraTarget.x) * 0.18;
    this.cameraTarget.y += (desired.y - this.cameraTarget.y) * 0.18;
    this.cameraTarget.z += (desired.z - this.cameraTarget.z) * 0.18;
    this.camera.position.set(
      this.cameraTarget.x,
      this.cameraTarget.y,
      this.cameraTarget.z
    );
    this.camera.lookAt(p.position.x, 0, p.position.z);
    if (!p.lastPos) p.lastPos = { x: p.position.x, z: p.position.z };
    p.lastPos.x = p.position.x;
    p.lastPos.z = p.position.z;
  }
}

// --- Main Game Class ---
/**
 * Main Game class for managing the football match simulation, rendering, and user interaction.
 * @class
 * @constructor
 * @param {object} THREE - The three.js namespace object.
 * @param {string[]} playerNames - Array of user team player names.
 * @param {string[]} cpuNames - Array of CPU team player names.
 * @param {number} userColor - User team outfield player color as integer (e.g., 0xf39c12).
 * @param {number} cpuColor - CPU team outfield player color as integer (e.g., 0xe74c3c).
 * @param {number} keeperColor - User team goalkeeper color as integer (e.g., 0x1abc9c).
 * @param {number} cpuKeeperColor - CPU team goalkeeper color as integer (e.g., 0xf1c40f).
 * @param {Array<Array<number>>} userFormation - User team formation as array of [x, z] positions.
 * @param {Array<Array<number>>} cpuFormation - CPU team formation as array of [x, z] positions.
 * @param {number} [pitchLength=105] - Length of the pitch (default 105).
 * @param {number} [pitchWidth=68] - Width of the pitch (default 68).
 *
 * Usage:
 *   const game = new Game(
 *     THREE,
 *     playerNames,
 *     cpuNames,
 *     0xf39c12, // userColor
 *     0xe74c3c, // cpuColor
 *     0x1abc9c, // keeperColor
 *     0xf1c40f, // cpuKeeperColor
 *     [[-45,0], ...], // userFormation
 *     [[45,0], ...],  // cpuFormation
 *     105,            // pitchLength (optional)
 *     68              // pitchWidth (optional)
 *   );
 */
class Game {
  constructor(options) {
    const {
      THREE,
      playerNames,
      cpuNames,
      userColor,
      cpuColor,
      keeperColor,
      cpuKeeperColor,
      userFormation,
      cpuFormation,
      pitchLength = 105,
      pitchWidth = 68,
      loadedModel = null
    } = options;

    this.THREE = THREE;
    this.pitchLength = pitchLength;
    this.pitchWidth = pitchWidth;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x228b22);

    this.camera = new THREE.PerspectiveCamera(
      60,
      this.width / this.height,
      0.1,
      1000
    );
    this.camera.position.set(0, 40, 40);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.shadowMap.enabled = true;
    document.body.appendChild(this.renderer.domElement);

    // --- Add goals to the scene ---
    const goalHeight = 7;
    const goalWidth = 18;
    const postGeo = new THREE.CylinderGeometry(0.3, 0.3, goalHeight, 16);
    const crossbarGeo = new THREE.CylinderGeometry(0.3, 0.3, goalWidth, 16);
    const postMat = new THREE.MeshStandardMaterial({ color: 0xffffff });

    // Left goal
    const leftPost1 = new THREE.Mesh(postGeo, postMat);
    leftPost1.position.set(
      -this.pitchLength / 2,
      goalHeight / 2,
      -goalWidth / 2
    );
    const leftPost2 = new THREE.Mesh(postGeo, postMat);
    leftPost2.position.set(
      -this.pitchLength / 2,
      goalHeight / 2,
      goalWidth / 2
    );
    const leftBar = new THREE.Mesh(crossbarGeo, postMat);
    leftBar.position.set(-this.pitchLength / 2, goalHeight, 0);
    leftBar.rotation.x = Math.PI / 2; // Fix: horizontal crossbar
    this.scene.add(leftPost1, leftPost2, leftBar);
    // Right goal
    const rightPost1 = new THREE.Mesh(postGeo, postMat);
    rightPost1.position.set(
      this.pitchLength / 2,
      goalHeight / 2,
      -goalWidth / 2
    );
    const rightPost2 = new THREE.Mesh(postGeo, postMat);
    rightPost2.position.set(
      this.pitchLength / 2,
      goalHeight / 2,
      goalWidth / 2
    );
    const rightBar = new THREE.Mesh(crossbarGeo, postMat);
    rightBar.position.set(this.pitchLength / 2, goalHeight, 0);
    rightBar.rotation.x = Math.PI / 2; // Fix: horizontal crossbar
    this.scene.add(rightPost1, rightPost2, rightBar);

    // --- Initialize teams and ball ---
    this.userTeam = new Team(
      playerNames,
      userColor,
      userFormation,
      keeperColor,
      loadedModel
    );
    this.cpuTeam = new Team(cpuNames, cpuColor, cpuFormation, cpuKeeperColor, loadedModel);
    this.ball = new Ball();

    // Optionally, add players and ball to the scene
    this.userTeam.players.forEach((p) => this.scene.add(p.mesh));

    // Input
    this.keys = {};
    window.addEventListener("keydown", (e) => {
      this.keys[e.key.toLowerCase()] = true;
    });
    window.addEventListener("keyup", (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    // Game state
    this.last = performance.now();
    this.running = true;
    this.animate = this.animate.bind(this);
    this.animate();
  }
  animate() {
    if (!this.running) return;
    const now = performance.now();
    const dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;

    // Update camera controller
    if (!this.cameraController && this.userTeam?.players) {
      this.cameraController = new CameraController(
        this.camera,
        this.userTeam.players
      );
    }
    if (this.cameraController) {
      this.cameraController.update();
    }

    // Handle player control and CPU AI
    this.handlePlayerControl(dt);
    this.handleCpuAI(dt);

    // Update ball
    this.ball.update(dt, this.pitchLength, this.pitchWidth);

    // Render
    this.renderer.setSize(this.width, this.height);
    this.renderer.render(this.scene, this.camera);

    // Continue animation loop
    requestAnimationFrame(this.animate);
  }
}

// Expose Game globally for event handlers
window.Game = Game;

// --- Utility Class for Names ---
class StatsManager {
  constructor(game) {
    this.game = game;
    this.stats = {
      possession: [0, 0],
      shots: [0, 0],
      shotsOnTarget: [0, 0],
      passes: [0, 0],
      fouls: [0, 0],
      corners: [0, 0],
      saves: [0, 0],
      tackles: [0, 0],
      events: [],
      playerStats: {},
      playerPositions: {},
      fitness: {},
      passingNetwork: {},
      keeperStats: [
        { saves: 0, passes: 0 },
        { saves: 0, passes: 0 },
      ],
      referee: { cards: [], fouls: [] },
    };
    this.setupIntervals();
    window.statsManager = this; // For debugging/UI
  }
  setupIntervals() {
    setInterval(() => this.updateStats(), 1000);
    setInterval(() => this.updateMatchStatsPanel(), 1000);
    setInterval(() => this.updateEventFeedPanel(), 1000);
    setInterval(() => this.updatePlayerComparePanel(), 1000);
    setInterval(() => this.updateHeatmapPanel(), 2000);
    setInterval(() => this.updateTacticsPanel(), 2000);
    setInterval(() => this.updateBenchPanel(), 2000);
    setInterval(() => this.updateFitnessPanel(), 1000);
    setInterval(() => this.updatePassingPanel(), 2000);
    setInterval(() => this.updateKeeperPanel(), 2000);
    setInterval(() => this.updateRefPanel(), 2000);
  }
  updateStats() {
    if (!this.game) return;
    let poss = this.game.getPossession?.();
    if (poss) this.stats.possession[poss.teamIdx]++;
    for (let t = 0; t < 2; ++t) {
      if (!this.game.teams) continue;
      this.game.teams[t].players.forEach((p, i) => {
        let id = `${t}_${i}`;
        if (!this.stats.fitness[id]) this.stats.fitness[id] = 100;
        this.stats.fitness[id] = Math.max(0, this.stats.fitness[id] - 0.01);
        if (!this.stats.playerPositions[id])
          this.stats.playerPositions[id] = [];
        this.stats.playerPositions[id].push({
          x: p.mesh.position.x,
          z: p.mesh.position.z,
        });
        if (this.stats.playerPositions[id].length > 200)
          this.stats.playerPositions[id].shift();
      });
    }
  }
  updateMatchStatsPanel() {
    const el = document.getElementById("matchStatsContent");
    if (!el) return;
    const s = this.stats;
    const totalPoss = s.possession[0] + s.possession[1] || 1;
    el.innerHTML = `
			<b>Possession</b>: <span style='color:#f39c12;'>${Math.round(
        (100 * s.possession[0]) / totalPoss
      )}%</span> - <span style='color:#e74c3c;'>${Math.round(
      (100 * s.possession[1]) / totalPoss
    )}%</span><br>
			<b>Shots</b>: ${s.shots[0]} - ${s.shots[1]}<br>
			<b>Passes</b>: ${s.passes[0]} - ${s.passes[1]}<br>
			<b>Fouls</b>: ${s.fouls[0]} - ${s.fouls[1]}<br>
			<b>Corners</b>: ${s.corners[0]} - ${s.corners[1]}<br>
			<b>Saves</b>: ${s.saves[0]} - ${s.saves[1]}<br>
			<b>Tackles</b>: ${s.tackles[0]} - ${s.tackles[1]}<br>
		`;
  }
  updateEventFeedPanel() {
    const el = document.getElementById("eventFeedContent");
    if (!el) return;
    const events = this.stats.events;
    el.innerHTML =
      events
        .slice(-20)
        .map((e) => `<div>${e}</div>`)
        .join("") || "(No events yet)";
  }
  updatePlayerComparePanel() {
    const el = document.getElementById("playerCompareContent");
    if (
      !el ||
      !this.game?.teams?.[0]?.players ||
      this.game.teams[0].players.length < 2
    ) {
      if (el) el.innerHTML = "(Compare two players)";
      return;
    }
    const p1 = this.game.teams[0].players[0];
    const p2 = this.game.teams[0].players[1];
    el.innerHTML = `
			<b>${p1.displayName}</b> vs <b>${p2.displayName}</b><br>
			<b>Fitness</b>: ${this.stats.fitness["0_0"]?.toFixed(1)} - ${this.stats.fitness[
      "0_1"
    ]?.toFixed(1)}<br>
			<b>Distance</b>: ${(this.stats.playerPositions["0_0"]?.length || 0) / 10}m - ${
      (this.stats.playerPositions["0_1"]?.length || 0) / 10
    }m<br>
		`;
  }
  updateHeatmapPanel() {
    const el = document.getElementById("heatmapContent");
    if (!el) return;
    el.innerHTML = "(Heatmap coming soon)";
  }
  updateTacticsPanel() {
    const el = document.getElementById("tacticsContent");
  if (!el || !this.game?.teams?.[0] || !this.game?.teams?.[1]) return;
  el.innerHTML = `
    <b>Home Formation:</b> ${this.game?.teams?.[0]?.formationType ?? ''}<br>
    <b>Away Formation:</b> ${this.game?.teams?.[1]?.formationType ?? ''}<br>
    (Tactical instructions coming soon)
  `;
  }
  updateBenchPanel() {
    const el = document.getElementById("benchContent");
    if (!el) return;
    el.innerHTML = "(No substitutes implemented yet)";
  }
  updateFitnessPanel() {
    const el = document.getElementById("fitnessContent");
  if (!el || !this.game?.teams?.[0]) return;
	if (!el || !this.game?.teams?.[0]) return;
	let html = '<table style="width:100%">';
	for (let i = 0; i < this.game.teams[0].players.length; ++i) {
	  let p = this.game.teams[0].players[i];
	  let id = `0_${i}`;
	  html += `<tr><td style='color:#fff;'>${
		p.displayName
	  }</td><td style='color:#ffd700;text-align:center;'>${this.stats.fitness[
		id
	  ]?.toFixed(1)}</td></tr>`;
	}
	html += "</table>";
	el.innerHTML = html;
  }
  updatePassingPanel() {
    const el = document.getElementById("passingContent");
    if (!el) return;
    el.innerHTML = "(Passing network coming soon)";
  }
  updateKeeperPanel() {
    const el = document.getElementById("keeperContent");
    if (!el) return;
    el.innerHTML = `
			<b>Home Saves:</b> ${this.stats.keeperStats?.[0]?.saves}<br>
			<b>Away Saves:</b> ${this.stats.keeperStats?.[1]?.saves}<br>
			(Saves map coming soon)
		`;
  }
  updateRefPanel() {
    const el = document.getElementById("refContent");
    if (!el) return;
    el.innerHTML = `
			<b>Cards:</b> ${this.stats.referee.cards.length}<br>
			<b>Fouls:</b> ${this.stats.referee.fouls.length}<br>
		`;
  }
  // Modern Stats Panels Logic
  setupPanel(openBtnId, panelId, closeBtnId) {
    const openBtn = document.getElementById(openBtnId);
    const panel = document.getElementById(panelId);
    const closeBtn = document.getElementById(closeBtnId);
    if (openBtn && panel && closeBtn) {
      openBtn.onclick = () => {
        panel.style.display = "block";
      };
      closeBtn.onclick = () => {
        panel.style.display = "none";
      };
    }
  }
}

// --- App Class: Entry Point ---

