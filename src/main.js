import './styles/main.css';
import engine from './engine/Engine.js';
import sceneManager from './engine/SceneManager.js';
import audioManager from './engine/AudioManager.js';
import LoadingScreen from './components/ui/LoadingScreen.js';
import AudioToggle from './components/ui/AudioToggle.js';
import ThemeToggle from './components/ui/ThemeToggle.js';

// Scenes
import LandingScene from './scenes/LandingScene.js';
import SolarSystemScene from './scenes/SolarSystemScene.js';
import MLScene from './scenes/planets/MLScene.js';
import AgentsScene from './scenes/planets/AgentsScene.js';
import CreativeScene from './scenes/planets/CreativeScene.js';
import RoboticsScene from './scenes/planets/RoboticsScene.js';
import CollectiveScene from './scenes/planets/CollectiveScene.js';

async function init() {
  // Loading screen
  const loading = new LoadingScreen();
  loading.create();
  loading.setProgress(10, 'Initializing engine...');

  // Init Three.js engine
  const appContainer = document.getElementById('app');
  engine.init(appContainer);
  loading.setProgress(30, 'Setting up scenes...');

  // Init scene manager
  sceneManager.init();

  // Register all scenes
  sceneManager.register('landing', new LandingScene());
  sceneManager.register('solarSystem', new SolarSystemScene());
  sceneManager.register('ml', new MLScene());
  sceneManager.register('agents', new AgentsScene());
  sceneManager.register('creative', new CreativeScene());
  sceneManager.register('robotics', new RoboticsScene());
  sceneManager.register('collective', new CollectiveScene());
  loading.setProgress(60, 'Preparing audio system...');

  // Audio
  audioManager.init();
  loading.setProgress(80, 'Loading UI components...');

  // Persistent UI elements (always visible)
  const audioToggle = new AudioToggle();
  audioToggle.create();
  const themeToggle = new ThemeToggle();
  themeToggle.create();
  loading.setProgress(100, 'Ready.');

  // Start engine
  engine.start();

  // Small delay then hide loading and go to landing
  await new Promise(r => setTimeout(r, 500));
  await loading.hide();

  // Start with landing scene
  await sceneManager.goTo('landing', { skipHistory: true });
}

// Boot
init().catch(console.error);
